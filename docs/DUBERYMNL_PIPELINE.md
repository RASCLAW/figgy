# DuberyMNL Ad Pipeline — Documentation & Portfolio Notes

**Author:** RA (FIGGY Project)
**Built with:** n8n (self-hosted), Google Gemini 2.5-flash, kie.ai (Nano Banana 2), Google Drive/Sheets
**Status:** Production (as of 2026-03-08)

---

## Overview

An end-to-end automated Facebook ad production system for DuberyMNL, a Filipino sunglasses brand.
The pipeline generates 25 ad captions per run, routes them through a human review UI,
and produces photo-realistic ad images for each approved caption — with zero manual image editing.

```
WF1 (Caption Generator)
  → Google Sheet (pending_review)
    → WF2 (Caption Approver — human review UI)
      → Google Sheet (approved_content)
        → WF3 (Image Generator)
          → Google Drive (ad images)
```

**Core constraint that shaped the architecture:** n8n runs local-only (no public URL).
External services (kie.ai) cannot reach n8n webhooks. This ruled out callback patterns.
Every async operation uses polling instead.

---

## WF1 — Caption Generator

**Node:** Google Gemini 2.5-flash (AI Agent)
**Trigger:** Manual (cron optional)
**Output:** 25 captions written to Google Sheets `pending_review` tab

### What it does
Generates 25 marketing captions per run, each tagged with:
- `Vibe` — one of 5 tones: Commuter, Outdoor, Urban, Lifestyle, Sale
- `Visual_Anchor` — "PERSON" or "PRODUCT" — indicates what anchors the ad image
- `Hashtags`, `Tone`, `Caption` body

### Why Gemini 2.5-flash
Originally built on GPT-4o. Switched to Gemini 2.5-flash after the OpenAI integration
showed cost sensitivity at scale. Gemini handles Filipino vernacular and structured JSON
output reliably, and the 1M-token context window is headroom for future batching.

### Distribution Design: 40% PRODUCT rule

**The problem:** LLMs default toward PERSON-anchored ad copy because most training data
features human subjects. Without explicit distribution rules, the model produces ~80%
PERSON captions — all showing a person wearing sunglasses.

**The solution:** Hard-coded distribution per vibe:

| Vibe | PERSON | PRODUCT | PRODUCT rationale |
|------|--------|---------|-------------------|
| Vibe 1 Commuter | 4/5 | 1/5 | Product on jeepney ledge / MRT seat |
| Vibe 2 Outdoor | 3/5 | 2/5 | Product in nature setting |
| Vibe 3 Urban | 3/5 | 2/5 | Product flat-lay on concrete / café table |
| Vibe 4 Lifestyle | 2/5 | 3/5 | Aspirational minimal, tagline-driven |
| Vibe 5 Sale | 3/5 | 2/5 | Product hero shot + dominant ₱699 price |
| **Total** | **15/25** | **10/25 (40%)** | |

**Why explicit numbers beat vague instructions:** "Generate some PRODUCT captions" is
ambiguous — the model interprets "some" differently each run. Saying "exactly 2 of 5
must be PRODUCT-anchored in this vibe" removes interpretation. The model counts.

### LLM Prompt Engineering Insight: The Enumeration Constraint

When you need a language model to produce balanced output across categories,
explicit counts are more reliable than ratios or qualitative instructions:

- Weak: "Include a mix of PERSON and PRODUCT captions"
- Medium: "About 40% should be PRODUCT captions"
- Strong: "Vibe 1: exactly 1 of 5 must be PRODUCT-anchored"

The strong form works because it maps each output slot to a specific constraint
the model can verify against as it generates. It cannot drift to 0 PRODUCT captions
without violating an explicit, countable rule.

---

## WF2 — Caption Approver (Human Review UI)

**Node:** Webhook (GET renders HTML form, POST submits decisions)
**Output:** Approved captions written to `approved_content` tab with Selected_Model

### What it does
Serves a browser-based review UI — a styled HTML card for each caption in `pending_review`.
RA reads each caption, selects Approve/Reject, picks up to 5 reference product models,
and submits. The webhook processes the form data and writes to the sheet.

### The Multi-Reference Model Picker

**The problem:** Early versions had a single model picker per caption. This prevented:
- Group ads (multiple people wearing different sunglass models)
- Series shots (multiple product variants arranged together)
- Mixed flat-lay product ads

**The solution:** 5 model dropdowns per card, fields 2–5 optional ("— None —" default).
Submitted as `selected_model_1_N` through `selected_model_5_N`.

The webhook processor joins non-empty values into a comma-separated string:
```
"CLASSIC - Blue, OUTBACK - Green, BANDITS - Black"
```
Stored in a single `Selected_Model` column — no schema change needed.

**Why comma-separated instead of a new column per model:**
The downstream node (WF3 Lookup) parses the string at runtime. This keeps the
sheet schema stable and backward-compatible — rows approved before this change
still work (single model = no commas = array of length 1).

### Why a webhook UI instead of a native n8n approval node

n8n's built-in "Wait for webhook" approval pattern requires the workflow to stay
active between trigger and approval — meaning n8n holds an execution open for hours.
This is fragile on self-hosted instances with limited memory.

The WF2 pattern decouples review from execution: WF1 writes to a sheet, WF2 reads
and serves the UI on demand, WF3 reads approved rows independently. No long-lived
execution, no timeout risk.

---

## WF3 — Image Generator

**Trigger:** Manual (run after WF2 approval)
**Node chain:**
```
Manual Trigger
→ Read Approved Content        (Google Sheets — skip Caption_Used = TRUE)
→ Pick Caption                 (random selector among unused rows)
→ Lookup Reference Image       (Code node — model name → Drive URL)
→ Agent 1 — Prompt Writer      (AI agent — caption → image prompt)
→ Parse Prompt                 (text extractor)
→ Call Nano Banana 2           (HTTP Request — POST to kie.ai)
→ Wait 30s
→ Fetch Image Result           (polling loop)
→ Is Image Ready?              (IF node — loops on 422)
→ Wait 30s (CDN buffer)
→ Extract Image URL            (Code node)
→ Download Image               (HTTP Request)
→ Upload to Drive              (Google Drive)
→ Mark Caption Used            (HTTP Request — Google Sheets API PUT)
```

### Polling Architecture (not callbacks)

kie.ai returns a `taskId` immediately on job creation. The image isn't ready yet.
The workflow polls `Fetch Image Result` in a loop until the API returns 200 (not 422).

```
Call Nano Banana 2 → Wait 30s → Fetch Image Result
                                    ↓ (if 422)
                               Wait 30s ←──────────
```

**Why polling over callbacks:** n8n is local-only — no public URL for kie.ai to POST back to.
Polling is the only viable pattern for any external service that needs async completion.

**The taskId expression gotcha:** `Fetch Image Result` must reference
`$('Call Nano Banana 2').first().json.data.taskId` directly — not the Wait node.
Wait nodes pass empty ping data. If you reference the Wait node, the expression
resolves to null and every poll request fails silently.

### Lookup Reference Image — Multi-Model Support

The Code node maps `Selected_Model` (comma-separated) to an array of Drive URLs:

```javascript
const rawModels = (item.Selected_Model ?? '').split(',').map(s => s.trim()).filter(Boolean);
const models = rawModels.length > 0 ? rawModels : ['']; // fallback → random

const urls = [], keys = [];
for (const rawModel of models) {
  const key = rawModel.toLowerCase().replace(/[\s\-_]/g, ''); // normalize key
  const fileId = REF_MAP[key] ?? REF_MAP[randomKey]; // fallback → random if no match
  urls.push(DRIVE_BASE + fileId);
  keys.push(resolvedKey);
}

return [{ json: {
  ...item,
  referenceImageUrl: urls[0],      // backward compat — single model still works
  referenceImageUrls: urls,        // new — array for multi-ref
  referenceImageKeys: keys,
  referenceCount: urls.length
} }];
```

**Key normalization:** `rawModel.toLowerCase().replace(/[\s\-_]/g, '')` converts
`"CLASSIC - Blue"` → `"classicblue"`. The REF_MAP uses normalized keys, so spacing
and dash variations in the dropdown don't cause lookup failures.

### Mark Caption Used — Coordinate Targeting Pattern

**The problem:** Standard Google Sheets "Update Row" nodes match by column value.
DuberyMNL captions contain `₱699` — a special Unicode character. The Sheets API
URL-encodes this inconsistently, causing silent column match failures.

**The solution:** WF1 stores a `row_number` for each caption. WF3 uses an HTTP Request
node (PUT) to write directly to a coordinate:

```
https://sheets.googleapis.com/v4/spreadsheets/{ID}/values/approved_content!L{row_number}?valueInputOption=RAW
```

Body: `{ "values": [["TRUE"]] }`

This bypasses text matching entirely. Row 14 is always row 14, regardless of what's
in any cell. Immune to special characters, encoding issues, and column reordering.

**Isolation debugging insight:** HTTP Request nodes with upstream expressions
(like `$('Pick Caption').item.json.row_number`) cannot be tested with "Execute step"
alone — upstream nodes haven't run, so expressions resolve to null. Always test
HTTP Request nodes with hardcoded values first (separate 2-node test workflow),
then run the full chain to verify with live expressions.

---

## Agent 1 — Prompt Writer (The Core AI Component)

**Model:** Google Gemini (via n8n AI Agent node)
**Input:** Caption + metadata (vibe, visual_anchor, selected models, reference count)
**Output:** Complete Nano Banana 2 image generation prompt

This is the most prompt-engineered component in the pipeline.

### Architecture: Two-Pass Internal Reasoning

The system prompt instructs Agent 1 to silently run a Caption Analysis before writing
the image prompt. This two-pass structure is intentional:

**Pass 1 (internal):** Caption Analysis
1. Pain Point — what discomfort does this caption agitate?
2. Relevance & Urgency — what cultural/local context does it set?
3. Product Proof — what claim needs to be shown, not told?
4. Friction Removal — what facts convert a scroller to a buyer?
5. Content Type Selection — which of 5 types best serves this caption?

**Pass 2 (output):** Write the Prompt — using Pass 1 output to drive every visual decision.

**Why this matters (Chain-of-Thought prompting):**
Asking an LLM to immediately output a final result skips intermediate reasoning that
improves output quality. By forcing an analysis step first, the model builds a richer
internal representation of the caption before generating the visual description.
The final prompt is a direct function of the analysis — nothing arbitrary.

This is the same principle behind chain-of-thought prompting in research literature:
models that "show their work" produce more accurate and coherent final outputs.

### AIDA Framework Mapping

The Caption Analysis maps directly to the AIDA advertising framework:

| AIDA Stage | Caption Analysis Step | Prompt Output |
|------------|----------------------|---------------|
| Attention | Pain Point | Visual hook — expression, lighting, scene tension |
| Interest | Relevance & Urgency | Scene tone, cultural grounding, composition |
| Desire | Product Proof | Visual proof element (lens reflection, product in element) |
| Action | Friction Removal | Overlays — ₱699, POLARIZED, SAME-DAY DELIVERY |

**Why AIDA?** It's the most proven framework for direct-response advertising. Facebook
feed ads are scroll-stopping, single-view decisions. AIDA maps cleanly to the 3–5 second
window a viewer spends on an ad. By wiring the analysis steps to AIDA stages, every
visual decision has an advertising rationale — not just aesthetic preference.

### The visual_anchor Enforcement Problem and Fix

**The problem:** The Caption Analysis step can override the `visual_anchor` hint. A skilled
model might analyze a PRODUCT-anchored caption and find a human pain point angle —
then default to TYPE A (person) despite the PRODUCT signal. This happened regularly,
producing person-heavy output even when captions were explicitly PRODUCT-anchored.

**The fix:** A HARD RULE block placed *before* the type definitions:

```
HARD RULE — visual_anchor enforcement:
- If visual_anchor = "PRODUCT" → you MUST select TYPE B, C, D, or E.
  TYPE A is forbidden for PRODUCT-anchored captions.
- If visual_anchor = "PRODUCT" and ambiguous → default to TYPE D.
- If visual_anchor = "PERSON" → TYPE A preferred, all types available.
```

**Why placement before the type definitions matters:**
LLMs process prompts sequentially. Rules stated *before* the options they constrain
are evaluated first — they function as a gate. Rules placed *after* examples tend to
be overridden by the pattern established by the examples above them.
This is analogous to how "if/else" works in code: the condition is checked before
any branch is taken.

### Content Type Taxonomy

5 content types, each with distinct visual logic:

| Type | When to use | Overlay treatment | Visual anchor |
|------|-------------|-------------------|---------------|
| A — Person + Product | Caption agitates human pain point | Full (price, delivery, CTA) | Human subject |
| B — Product in Environment | Lifestyle / context-setting | Minimal (logo + tagline) | Scene + product |
| C — Product Lifestyle Minimal | Aspirational / vibe-based | Minimal (brand name + tagline) | Scenic backdrop |
| D — Product Hero Ad | Specific feature / benefit | Full (price, delivery, CTA) | Product with lens reflection |
| E — Infographic | Multiple features listed | Callout arrows + price badge | Product with labels |

**Why a taxonomy instead of free-form?**
A taxonomy constrains the model's output space to proven ad formats. Without it,
the model invents arbitrary visual treatments. Each type maps to a real advertising
format: Type A = lifestyle/person ad, Type D = product hero, Type E = feature breakdown.

**Why TYPE D as PRODUCT default?**
The lens reflection is a visual proof element — it shows the polarized lens actually
filtering the environment. It's the strongest single claim DuberyMNL can make
(UV protection + polarization = better vision). Type D gets price + delivery overlays,
making it a complete conversion-focused ad.

### Multi-Reference Logic

When a reviewer selects multiple models in WF2, Agent 1 receives:
- `Reference_Count`: how many models
- `Reference_Models`: comma-separated model keys

Two new behaviors activate:

**MULTI-SUBJECT (Reference_Count > 1, PERSON anchor):**
Each subject wears the model from their respective reference image.
Subject 1 → Reference Image 1, Subject 2 → Reference Image 2, etc.
Group composition, interactions, individual expressions — all described.

**MULTI-PRODUCT (Reference_Count > 1, PRODUCT anchor):**
Series logic:
- Same family (all classic*, all outback*) → "DUBERY [FAMILY] SERIES" — all color variants
  arranged together on a surface, styled like a product lineup ad
- Mixed families → curated flat-lay — each model described individually by frame shape,
  color, and lens
- No person in frame in either case

**Why Series naming?**
"DUBERY CLASSIC SERIES" signals a product line, not individual items. It increases
perceived brand depth — the viewer sees a brand with a collection, not just one product.
This is a standard retail brand strategy (see: Ray-Ban Wayfarer Series, etc.).

### Accuracy Rule: Fixed String Verbatim

The overlays section specifies exact strings that must appear verbatim:
```
₱699 / POLARIZED / DUBERY / SAME-DAY DELIVERY / METRO MANILA
```

**Why this matters:** Image generation models learn text from training data. Unusual
strings (₱, non-English words) are underrepresented and prone to hallucination — the
model might render "P699" instead of "₱699", or misspell "POLARIZED". By specifying
verbatim strings with an explicit accuracy rule, the model is given the exact output
to target. This doesn't guarantee correctness (image AI text rendering is imperfect),
but it removes ambiguity in intent.

---

## Portfolio Summary: What Makes This System Interesting

### 1. Constraint-Driven Prompt Architecture
Every prompt instruction is tied to a constraint with a rationale. No vague instructions
("make it look good"). Distribution rules, hard rules, taxonomy, verbatim strings —
all designed to narrow the model's output space to the correct range.

### 2. Sequential Reasoning via Two-Pass Design
Agent 1 analyzes before it generates. This is applied chain-of-thought prompting
in a production system — not a research demo.

### 3. AIDA-Wired Visual Design
The creative brief (caption) maps mechanically to the visual brief (image prompt)
via AIDA. Every visual element has an advertising function. This is systems thinking
applied to creative work.

### 4. Human-in-the-Loop at the Right Stage
WF2 is the human gate. Captions are reviewed before image generation (the expensive step).
This positions human review at maximum leverage — catching bad captions before they consume
kie.ai credits and Drive storage.

### 5. Robust Data Transport (Coordinate Targeting)
The `row_number` + coordinate URL pattern for marking captions used is a real-world
engineering solution to a real problem (special character encoding failures).
Not an elegant hack — it's the correct tool for write-by-address operations.

### 6. Polling over Callbacks for Async AI APIs
The kie.ai polling loop is a transferable pattern for any async AI API (image generation,
video generation, document processing) running against a local or firewalled n8n instance.

---

## Key Decisions Log (ADR-lite)

### Decision: Coordinate targeting for Mark Caption Used
- Context: `₱699` in caption text caused silent URL encoding failures in column-match updates
- Alternative: Sanitize caption text before column match
- Why coordinate: Row_number is always unambiguous. Sanitizing text is fragile — future
  special characters would break it again. Write by address, not by content.

### Decision: Comma-separated Selected_Model (no new columns)
- Context: Adding columns for model_2 through model_5 would require WF2 and WF3 schema updates
- Alternative: JSON array in a single cell
- Why comma-separated: Simpler to parse in Code nodes, human-readable in the sheet,
  backward-compatible (single model rows are unchanged).

### Decision: HARD RULE before type definitions in Agent 1
- Context: Post-analysis type selection overrode visual_anchor signal
- Alternative: Add visual_anchor check inside each type description
- Why before: Gate pattern — constrains before options are evaluated.

### Decision: Two-pass reasoning (analysis then prompt)
- Context: Direct prompt generation produced generic, caption-disconnected visuals
- Alternative: Single-pass with all context in one instruction block
- Why two-pass: Forces model to build an intermediate representation. Output quality
  improves measurably when the model "plans" before it "writes".
