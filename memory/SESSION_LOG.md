# SESSION LOG (Milestone-Based)

## 2026-03-08 — WF3 END-TO-END VERIFIED + AGENT 1 PROMPT UPDATES ✅

### What was accomplished
- **WF3 first successful run**: Pick Caption fixed (Rating column had no trailing space — was reading wrong column). Polling loop added (IF node: Is Result Ready? checks `data.resultJson` not empty, loops back every 30s). image_log append working (all columns populated). Drive upload confirmed.
- **Mark Caption Used**: fixed `row_number` → `_row_index` in URL expression.
- **image_log formula error**: Value Input Option changed from USER_ENTERED → RAW (prevents `=` values being treated as formulas).
- **Agent 1 Setting Rule added**: outdoor default, indoor only for product shots (TYPE B/C/D/E), never person indoors with sunglasses.
- **Agent 1 Reflection Rule added**: lens must reflect actual scene, not BGC/Makati skyline. Scene-specific examples provided.
- **Resolution changed**: Call Nano Banana 2 `resolution` changed 2K → 1K for mobile optimization.
- **SKILL.md updated**: Setting Rule + Reflection Rule merged into repo file.
- **WF3 JSON re-exported**: latest version saved to repo.

### WF4 (Image Reviewer) — designed, not yet built
- Mock Facebook post card UI per image
- Like = Approve, Comment = Feedback, Share = silent for now
- Rejected = logged, manual re-trigger
- image_log needs 3 new columns: Review_Status, Review_Feedback, Reviewed_At
- GET/POST webhook pattern same as WF2

### Still pending
- Add Review_Status, Review_Feedback, Reviewed_At columns to image_log sheet
- Build WF4 in n8n

---

## 2026-03-08 — WF1/WF2 CLEANUP + REVIEW PAGE REDESIGN ✅

### What was accomplished
- **Read Feedback Execute Once fix**: was running 84× (once per upstream item). Execute Once ON → runs once. Root cause: Google Sheets blank-row padding (15 real rows + 69 blank = 84 items).
- **"All Models" fully removed**: deleted from SKILL.md JSON output example, REFERENCE.md, WF1 n8n node (user pasted updated SKILL.md), repo JSON replaced with fresh export. `Model` column deleted from pending_review, approved_content, rejected_content sheets.
- **WF2 Build Review HTML redesigned**: Facebook post card style — DuberyMNL avatar, Vibe tag, editable caption textarea, hashtags in blue, Like/Comment/Share bar (decorative), review controls (visual anchor, ref pickers, stars) in grey tray below.
- **Progressive reference pickers**: only Reference 1 shown by default. Reference 2 reveals when Reference 1 is filled, etc. Clearing a picker hides and resets all subsequent ones.
- **Editable captions**: caption is now a `<textarea>` — editable before submit. Tag Decisions reads `body['caption_' + i] || row.Caption` so edited text flows to approved_content sheet.
- **Caption feedback node**: confirmed Read Feedback was missing Execute Once. Limit Feedback node discussed (slice -10 to keep last 10 real rows after filtering blanks).

### What was learned
- Execute Once OFF on Google Sheets read nodes = runs once per upstream item, not once per workflow. Same root cause every time — always check Execute Once first when a node outputs unexpectedly high item counts.
- "All Models" was only in the JSON output example — removing it from there was enough to stop the agent from outputting it. LLMs mimic the example format directly.
- Teaching protocol: RA learns better with step-by-step walkthroughs + ASCII visuals rather than full instruction dumps. Give one step, wait for confirmation before next.

### Still pending
- Limit Feedback node (Code node after Read Feedback, slice -10) — discussed but not yet built

### End-to-end verified ✅ (2026-03-08)
- Edited caption landed in approved_content ✅
- Feedback text landed in feedback sheet ✅
- pending_review cleared ✅
- Trigger Regenerate removed — feedback no longer auto-triggers WF1. WF1 runs on schedule or manual trigger only.

---

## 2026-03-08 — VIBE RANDOMIZATION + AGENT MEMORY DESIGN (design only, not yet built)

### What was discussed
- LLM positional bias: models prefer vibes listed first (Commuter, Outdoor, Urban, Lifestyle).
  "Freely" is too vague to overcome this without additional nudges.
- Three randomization options: (1) prompt anti-bias rule, (2) random seed injection via Code node,
  (3) run history — wf1_run_history tab tracks last 3 runs, injected into AI Agent to actively avoid repeating vibes
- Vibe memory architecture designed (Option 3, recommended):
  - New WF1 nodes: Read Run History → Format History (Code) → [AI Agent] → [Write Captions] → Save Run History
  - wf1_run_history sheet tab: columns run_date, selected_vibes (comma-separated, Sale filtered out)
  - Format History Code node builds "avoid these vibes" string from last 3 rows
  - AI Agent user message: prepend history text + "Generate 25 captions now."
  - SKILL.md rule 5 to add: "You will receive recent run vibes. Do NOT select any of those vibes."
- 300-line system prompts confirmed safe for Gemini 2.5-flash (~5K tokens vs 1M limit)

### What was learned
- LLMs need structural entropy (shuffled list) or injected state (history to avoid) for genuine variety
- The approved/rejected history pattern (Section 2 SKILL.md) is the same injection mechanism —
  vibe history is just a new application of it
- Vibe memory is NOT yet built in n8n — only designed. Pending: create sheet tab + 3 WF1 nodes + SKILL.md edit

---

## 2026-03-08 — WF1 CAPTION AGENT VIBE LIBRARY EXPANSION ✅

### What was accomplished
- `duberymnl-caption-agent/SKILL.md` fully restructured:
  - Section 1: Added 21-term Filipino address vocabulary bank + 3x diversity rule
  - Section 4: Replaced fixed 5-vibe structure with 16-vibe VIBE LIBRARY + VIBE SELECTION RULE
    - Sale/Urgency always mandatory; model picks 4 more freely each run
    - 16 vibes: 4 original + 12 new (Mirror Selfie, New Haircut, Content Creator, Motovlogger, Moto Camping, Palenke, Church, Walking Dog, Cat Parent, Toddler, Teenager, Chaos Energy)
    - Each vibe has: Scene, Tone, Hook ideas, PRODUCT lean
    - Commuter upgraded to "NCR Streets" — added España, Quezon Ave, SM North, Phil Arena
    - Outdoor upgraded — added Mayon, Pinatubo, Baguio, Ilocos + specific PH tourist spots
    - Lifestyle upgraded — added 9 sub-cultures (skate, hiphop, punk, tattoo, car, etc.)
  - Section 4: TONE/BUNDLE/RULES blocks replaced with unified GLOBAL QUOTAS (10/25 PRODUCT, 5/25 bundle, 3/25 elevated tone)
  - Section 5: `selected_vibes` added to JSON root; ID range labels made dynamic
  - Old fixed per-vibe distribution table removed (was contradicting dynamic library)
- SKILL.md is ready to paste into n8n WF1 Caption Generator node

### What was learned
- When vibes rotate dynamically, per-vibe hard PRODUCT counts become contradictory — global quota (10/25) is cleaner and more flexible
- LLM contradictions between a stale reference table and a new rule can cause drift — always remove stale sections, don't just add new ones
- Named Filipino locations (Mayon, Ilocos, Pinatubo) trigger emotional memory better than generic descriptors — specificity is a key scroll-stopping lever

## 2026-03-08 — RECALIBRATION SESSION (WF2 + WF3 MULTI-REF COMPLETE ✅)

### What was accomplished
- Agent 1 system prompt (WF3): pasted into n8n. Contains HARD RULE (PRODUCT → TYPE B/C/D/E only), MULTI-SUBJECT + MULTI-PRODUCT variants, Hard Rule #5
- Portfolio doc created: `docs/DUBERYMNL_PIPELINE.md` — architecture, AIDA mapping, prompt engineering rationale, decisions log
- WF2 Build Review HTML: updated with 5 reference pickers + PERSON/PRODUCT toggle per card. Toggle defaults to Gemini's assigned visual_anchor; user can override before submitting
- WF2 Tag Decisions: updated to join 5 model pickers into comma-separated Selected_Model; reads submitted visual_anchor toggle value
- WF3 Lookup Reference Image: multi-model parsing (comma-separated → array of URLs + keys)
- WF3 Call Nano Banana 2: image_input now uses `referenceImageUrls` array
- WF3 Agent 1 user message: adds Reference_Count + Reference_Models fields
- Both WF2 + WF3 JSONs exported to repo ✅
- Memory rule added: NEVER replace existing working code — always ask for current code first, merge additions in

### What was learned
- `button[type="submit"]` CSS selector required when toggle buttons are on the same form — prevents green submit style bleeding onto PERSON/PRODUCT buttons
- Tag Decisions bug caught: `d.Visual_Anchor` → `row.Visual_Anchor` (variable was named `row` in current scope, not `d`)
- n8n Code node draft state: changes don't go live until Ctrl+S in n8n
- Always re-download JSON from n8n after fixing a bug before copying to repo

### Still pending
- WF1 SKILL.md caption distribution update: bump PRODUCT quotas to 10/25 (Commuter +1, Urban +1, Lifestyle +1, Sale +2)
- User manually pastes updated WF1 system prompt into n8n Caption Generator node
- End-to-end verification: approve caption with 2-3 models, run WF3, confirm multi-ref + PRODUCT type selection working

---

## 2026-03-07 (continued) — WF3 PIPELINE COMPLETE ✅

### WF3 Full Pipeline Verified Working
- Full node chain end-to-end: Manual Trigger → Read Approved Content → Pick Caption → Lookup Reference Image → Agent 1 → Parse Prompt → Call Nano Banana 2 → Wait 30s → Fetch Image Result → Is Image Ready? (polling loop) → Wait 30s (CDN buffer) → Extract Image URL → Download Image → Upload to Drive
- Images landing in Google Drive Generated Images folder ✅
- Reference images (all 14 product variants) in Drive, public, used as `image_input` ✅
- Polling loop: IF `$json.code` is not equal to `422` → continue; else loop back to Wait 30s
- CDN buffer: extra 30s Wait before Download Image (kie.ai CDN needs time after recordInfo returns 200)
- Key fix: Fetch Image Result taskId MUST use `$('Call Nano Banana 2').first().json.data.taskId` — NOT from Wait node
- Key fix: Fetch Image Result response format must be set to **JSON**

### Mark Caption Used — Completed ✅ (continued session)

**What was accomplished:**
- Mark Caption Used node working in WF3 — writes TRUE to approved_content column L for the used row

**The struggle:**
- Native Google Sheets "Update Row" node fails silently when Caption column has special characters (₱, quotes) — string match returns 0 rows, no error thrown
- HTTP Request approach initially failed because the node was tested in isolation (Execute step) — `$('Pick Caption').first().json.row_number` had no upstream data to resolve, URL became `...!Lundefined?...`

**What was learned:**
- Use row_number coordinate targeting (Google Sheets API PUT) instead of column-match for updates — immune to special characters
- Always test HTTP Request nodes that use upstream expressions by running the full workflow (or bypass chain), not Execute step in isolation
- Isolation debugging pattern: build a separate 2-node test workflow (Manual Trigger → HTTP Request hardcoded) to confirm credential and body format before adding expressions
- Milestone trigger rule added to communication-style.md — "success!", "milestone!", "accomplished!", "done for the day!" auto-trigger a checkpoint save

**Final node config (Mark Caption Used):**
- Type: HTTP Request
- Method: PUT
- URL: `https://sheets.googleapis.com/v4/spreadsheets/1OwWHwlhHfFgMMokMS3GGtH1fHptahbg2OscB07c8bkk/values/approved_content!L{{ $('Pick Caption').first().json.row_number }}?valueInputOption=RAW`
- Auth: Google Sheets OAuth2
- Body: `{ "values": [["TRUE"]] }`

---

## 2026-03-07 (continued) — WF3 Manual Build Start + Nano Banana 2 Decision

### Changes (Objective)
- Abandoned WF3 JSON import (repeated "Could not find property option" error never resolved)
- Switched to manual node-by-node build in n8n UI for reliability
- Tested Node 1 (Manual Trigger) ✅
- Built and tested Node 2 (Read Approved Content) ✅
- Built and tested Node 3 (Pick Caption / Code node) ✅ — star-tiered random selector working
- Confirmed Google Sheets UI action labels from user screenshots (saved to `n8n-patterns.md` as ground truth)
- **Key decision: Image generation provider switched from fal.ai → Nano Banana 2 (kie.ai)**

### Key Technical Patterns
- n8n manual build UI is more reliable than JSON import for complex workflows — user sees actual option dropdowns, eliminates guessing operation strings
- UI action picker in n8n 2.9.4 shows all available Google Sheets actions verbatim; this is ground truth for future JSON authoring
- Pick Caption Code node: `$input.all()` returns rows from previous node; filters by `Rating ` (with trailing space) and `Caption_Used`; outputs `_row_index` for downstream "Mark Caption Used" node
- Nano Banana 2 (kie.ai) vs fal.ai nano-banana: former is GENERATOR (from scratch), latter is EDITOR (needs reference image). Nano Banana 2 supports 4:5 aspect ratio natively, async API with callback URL support

### Verified Working
- Node 1 (Manual Trigger) ✅
- Node 2 (Read Approved Content → Google Sheets "Get row(s) in sheet") ✅
- Node 3 (Pick Caption → code node with star-tiered random selection) ✅ tested via "Test workflow"
- Node 4 (Agent 1 — Prompt Writer → AI Agent + Gemini Chat Model) ✅ outputs JSON with "prompt" key
- Node 4.5 (Parse Prompt → Code node) ✅ parses Agent 1 JSON output, emits clean {prompt: "..."}
- Node 5 (Call Nano Banana 2 → HTTP Request) ✅ returns taskId from kie.ai

### Key Technical Patterns (added)
- Node 5 body uses Raw mode + Content Type: application/json (NOT manual Content-Type header — causes ERR_INVALID_CHAR)
- Node 5 body uses `JSON.stringify($('Parse Prompt').first().json.prompt)` — required to escape ₱, newlines, quotes in prompt
- Agent 1 system prompt must include "Output ONLY valid raw JSON, no markdown, no code blocks" to suppress triple-backtick wrapping
- Parse Prompt code node: try/catch handles both JSON-wrapped and plain-text Agent 1 output

### Pending
- Node 6: Wait node (listen for kie.ai callback)
- Node 7: Route Decision (Switch node — Approved/Rejected)
- Node 8+: Email approval, stubs (Upload to Drive, Log to Ready to Post)
- Node 9: Mark Caption Used (Google Sheets update)
- Test full workflow (Trigger → Email → Approve → Route → kie.ai → callback)
- Export completed workflow JSON to git repo

### Insight (Growth)
- JSON-first approach to n8n workflows has a reliability ceiling — manual UI build trades speed for confidence (user validates each option, no guessing field names)
- User's screenshot-sending approach (UI action labels) creates ground truth for future JSON work — memory-first architecture beats specification-guessing
- Nano Banana 2 unblocks WF3: no hero shot sourcing needed, generates from scratch, callback support = cleaner n8n Wait integration

### Next Logic Gate
- RA confirms kie.ai API key ready
- Rewrite Agent 1 system prompt for Nano Banana 2 (fal.ai-specific language → Nano Banana 2 format)
- Continue Node 4 setup: paste system prompt + wire Chat Model

---

## 2026-03-07 — Context Optimization + WF1 Model Swap → Gemini Live ✅

### Changes (Objective)
- Diagnosed context fill patterns: identified `@` imports, system reminder diffs, large JSON full-file reads as primary costs
- Implemented targeted Grep-first, range-read pattern for large files — saved to `memory/FACTS.md` as durable rule
- Removed `@memory/RA_CORE_v1.0.md` from CLAUDE.md imports (saves ~134 lines per session; RA_CORE content now in FACTS + MEMORY)
- Swapped WF1 (Caption Generator) LLM from OpenAI (gpt-4o) to **Google Gemini 2.5-flash**
- Created Google Gemini Chat Model node + configured API key

### Key Technical Patterns
- Grep + Read-with-range is the "controllable cost" in Claude Code sessions — system reminders from file diffs are uncontrollable
- `@` imports in CLAUDE.md are auto-loaded at session start (not hints) — every file added increases baseline token cost
- RA_CORE_v1.0.md (134 lines) was operational information duplicated in FACTS/MEMORY — removal reduced per-session overhead
- n8n Agent node is model-agnostic: swap LLM provider in the Chat Model child node, system prompt stays unchanged

### Verified Working
- WF1 executed perfectly with Gemini 2.5-flash ✅
- 25 captions generated with correct Visual_Anchor field ✅
- Caption flow through WF2 (review page with filter + model picker) confirmed ✅
- All downstream sheets (approved_content, rejected_content) received Visual_Anchor + Selected_Model fields ✅

### Decisions
- Use Gemini 2.5-flash for WF1 (latest, fast, capable for caption generation)
- Removed RA_CORE from auto-imports — RA can read on-demand when onboarding new AI tools
- Grep-first approach saved to FACTS.md as durable rule for all future context-conscious sessions

### Insight (Growth)
- Context management is about identifying *controllable* costs (proactive reads) vs *uncontrollable* (system reminder diffs)
- Architecture > model choice — system prompt survives any LLM swap at the n8n level
- Memory imports at session start have compounding cost — three 50-line files = 150 baseline tokens before first message

### Next Logic Gate
**WF3 node design** — Image Generator pipeline is architecturally locked, Agent 1 system prompt finalized at `.claude/skills/duberymnl-image-prompt-writer/SKILL.md`. Ready to build nodes.

---

## 2026-03-06 — WF3 Image Generator: Full Architecture + Agent 1 System Prompt Designed 🚧

### Changes (Objective)
- Designed complete WF3 (Image Generator) architecture for DuberyMNL pipeline
- Reviewed Nate's nano-banana n8n workflows (Edit Image Tool + Combine Images) — confirmed fal.ai integration pattern
- Designed Agent 1 system prompt with AIDA framework + Caption Analysis step
- Defined "Ready to Post" sheet schema (caption + image Drive link + prompt + tokens + model/color)

### Key Technical Patterns
- fal.ai nano-banana is an image EDITOR, not generator — requires existing product hero shot as input via image_urls
- ImgBB used as public URL intermediary — fal.ai needs public URLs, Google Drive files must be re-uploaded to ImgBB first
- fal.ai async queue pattern: POST → get request_id → wait 10s → poll → retry loop (5s) on error output
- Caption selection: waterfall priority — 5-star pool first, fallback to 4-star pool, random within tier
- Caption marked used by moving row to "Ready to Post" sheet (not a flag column — absence = consumed)
- Prompt is model-agnostic — model/color selection happens at approval time via n8n Form picker
- Same prompt can produce 4 ads by swapping input hero shot image (content multiplication)

### Decisions
- Schedule trigger (not event-driven) for WF3 Agent 1 runs
- Batch of 5 prompts before approval email fires (cost + attention management)
- n8n Form for approval: editable prompt textareas + model/color radio buttons per prompt
- Rejected prompts regenerate on next scheduled run (same caption, new prompt attempt)
- Agent 1 is fully model-agnostic — no product catalog needed in system prompt; image does the work
- Ad overlays: brand content is fixed (₱699, POLARIZED, same-day delivery, DUBERY), visual execution is dynamic per concept
- Overlay accuracy rule: exact brand strings must render verbatim, no approximation
- "Ready to Post" row = complete content asset: caption + image Drive link + prompt used + tokens + model/color + timestamp

### WF3 Architecture (Locked)
```
Schedule trigger
→ Pull top-rated captions from Approved Captions sheet (5-star first, 4-star fallback, random within tier)
→ Agent 1: Caption Analysis (AIDA framework) → generate fal.ai image prompt
→ Append to Sheets (status: pending) + check count
→ [count < 5] stop; [count >= 5] pull all pending → build n8n Form → send email
→ RA reviews: edit prompts + pick model/color per prompt → submit
→ [Approved] Agent 2: hero shot → ImgBB → fal.ai → Drive → move caption to "Ready to Post" sheet
→ [Rejected] flag for regeneration on next run
```

### Agent 1 System Prompt Structure (Designed, not yet finalized)
1. Caption Analysis (internal reasoning) — Pain Point, Relevance/Urgency, Product Proof, Friction Removal → AIDA map
2. GOAL — photo-realistic, Facebook feed, 4:5, mobile
3. SCENE / ENVIRONMENT — specific Manila setting
4. PRODUCT VARIABLE — hard rule verbatim (exact frame/lens/logo from reference image)
5. VISUAL STRUCTURE — detailed scene from analysis
6. AD OVERLAYS — dynamic execution, fixed brand content, accuracy rule for exact brand strings

### Additional Work (same session, continued)
- Reviewed all 6 DuberyMNL sample content files — identified 5 valid content types for fal.ai (A-E)
- Comic/illustrated style (Sample 1) flagged as out of scope for fal.ai
- Product naming confirmed from file names: Classic, Bandits, Rasta, Outback
- Price confirmed: ₱699 (₱499 in Sample 4 is old/outdated)
- Agent 1 system prompt revised to include 5 content types + content type selection logic
- Agent 1 system prompt locked and saved to `.claude/skills/duberymnl-image-prompt-writer/SKILL.md`
- Tested Agent 1 prompt in Gemini — produced 2 professional-grade Type A Facebook ads
- WF1 caption agent updated: visual_anchor field, product-anchor rules (5 per run), 3 elevated-tone captions per run
- Updated WF1 SKILL.md tested in Gemini — correct distribution, product-anchor captions validated

### Deferred
- Apply updated WF1 system prompt to live n8n agent node (SKILL.md updated, n8n not yet)
- WF3 node design not started
- WF3 JSON build not started
- Google Drive MCP (Option B) — on hold, RA approved plan

### Next Session
**Resume here:**
1. Apply updated WF1 SKILL.md to live n8n agent node (copy system prompt into agent node)
2. Begin WF3 node design in n8n

---

## 2026-03-06 — FIGGY System Upgrade: EA Eval + Memory Architecture ✅

### Changes (Objective)
- Evaluated "Executive Assistant Initialize Prompt" (found online) against FIGGY — concluded it would conflict if merged; better as a separate project
- Adopted 3 best ideas from EA prompt into FIGGY: `@` imports, `.claude/rules/`, `context/` folder
- Added `@` imports to CLAUDE.md: CORE → RA_CORE_v1.0.md, FACTS, PRINCIPLES, INTEGRITY auto-load every session
- Created `.claude/rules/communication-style.md` — persistent comm style rule file (checklists, copy-paste blocks, no silent memory edits, plan mode for complex tasks)
- Rebuilt BACKLOG.md from scratch — replaced stale entries with real current next actions from SESSION_LOG
- Created `context/current-priorities.md` — live single-page focus file, DuberyMNL pipeline state
- Added Skills section to CLAUDE.md with directory pointer and `/skill-name` invocation pattern
- Created `templates/session-closeout.md` — structured closeout template with checklist
- Logged ADR-003 in DECISIONS.md

### Key Technical Patterns
- `@path/to/file` in CLAUDE.md = auto-loaded at session start (not just a hint)
- `.claude/rules/*.md` = persistent behavior rules, loaded automatically, separate from agent contract
- BACKLOG.md must be updated at session closeout — otherwise SESSION_LOG becomes the de facto backlog

### Verified Working
- `@` imports in CLAUDE.md committed and verified via git diff ✅
- `.claude/rules/communication-style.md` created and committed ✅
- All 5 improvements committed in 2 clean commits (`75bae88`, `ee9923c`) ✅

### Decisions
- Swap `@memory/CORE.md` for `@memory/RA_CORE_v1.0.md` — RA_CORE is a strict superset; loading both wastes context tokens
- Skip `context/` folder mirroring the EA prompt's structure — memory/ already covers identity; create only `context/current-priorities.md` (no equivalent in memory/)
- EA prompt best suited as a separate Claude Code project, not merged into FIGGY

### Deferred
- No blockers. DuberyMNL pipeline resumes next session.

### Next Session
**Resume here:**
1. Add Tavily API key in n8n → Settings → Variables → `TAVILY_API_KEY`
2. Connect Tavily tool to WF1 Agent node
3. Deploy DuberyMNL site to GitHub Pages or Netlify

---

## 2026-03-05 — DuberyMNL WF2 Stars-Only Review ✅

### Changes (Objective)
- Replaced approve/reject radio buttons entirely with 1–5 star rating system
- 0–2 stars = reject → `rejected_content` sheet
- 3–5 stars = approve → `approved_content` sheet with Rating column populated
- Feedback textarea retained — still triggers WF1 regenerate on submit

### Key Technical Patterns
- Loop index `i` used for all form field names: `data-card="${i}"`, `name="rating_${i}"`, `id="star_val_${i}"`
  - NOT `d.ID` — test captions without an ID column would make `d.ID = undefined`, causing all cards to share `data-id="undefined"` and rate simultaneously
- Event delegation: single `document.addEventListener('click', ...)` — no inline onclick handlers
- "Route by Decision" IF node: `$json.Rating >= 3` (Number Greater Than or Equal To 3) — threshold is 3, not 1
- `Tag Decisions` still outputs `decision` field (for IF node), but also `Rating: null` for rejects

### Confirmed n8n Behavior (autoMapInputData)
- `autoMapInputData` writes ALL input fields as columns, including unmatched ones
- `decision` field → extra column in `approved_content` (no matching header)
- `Timestamp` header in sheet has trailing space → field mismatch → new column created
- RA accepted resulting sheet format: `Vibe | Model | Caption | Hashtags | Generated_At | Timestamp | Rating | decision`

### Verified Working
- Stars render on review page, gold fill on click, label updates to "N stars — approved" ✅
- 0–2 star captions route to `rejected_content` ✅
- Rated captions route to `approved_content` with correct Rating value ✅
- Feedback loop still fires WF1 regenerate ✅

### Deferred
- WF2 JSON re-exported and saved to `n8n-workflows/duberymnl/duberymnl-caption-approver.json` ✅
- Add Tavily key → connect to WF1 Agent node
- Build WF3 (Image Generator) once sufficient approved captions accumulate
- Use Rating values in WF1 to weight caption generation (future)

---

## 2026-03-05 — DuberyMNL Caption Agent: Full Pipeline Live ✅

### Changes (Objective)
- Built WF1 (Caption Generator) end-to-end in n8n — fully tested and verified
- Node chain: Schedule Trigger → Read Approved History → Limit Approved (Code) → Read Rejected History → Limit Rejected (Code) → Read Feedback → Generate Captions (Agent) → Write To Pending → Gmail
- Added Feedback Loop: WF2 POST writes feedback to Sheets `feedback` tab → Has Feedback? IF → TRUE: HTTP GET triggers WF1 via `duberymnl-regenerate` webhook → new email with fresh captions
- WF1 dual-trigger: Schedule (Mon 9AM cron `0 9 * * 1`) + Webhook (`duberymnl-regenerate`)
- WF1 reads feedback via "Read Feedback" node → injected into Agent User Prompt as context

### Key Fixes This Session
- Google Sheets "Get Row(s)" has no native Limit option — fixed with Code node: `.filter(item => item.json.Caption).slice(-20)` + Execute Once ON
- "Read Rejected History" was returning 810 rows (Sheets default 1000-row padding includes blank rows) — same Code node pattern fixed it
- Missing backtick in "Build Review HTML" Code node template literal caused blank review page — found via Executions log, fixed manually

### Verified Working
- WF1 runs, writes 25 captions to `pending_review`, sends email ✅
- Review page loads at `http://localhost:5678/webhook/duberymnl-review` ✅
- Submit → captions sorted to approved/rejected sheets + pending_review cleared + confirmation page ✅
- Submit WITH feedback → WF1 fires via webhook → new email with feedback-influenced captions ✅

### Decisions
- Code node `.filter(item => item.json.Caption).slice(-20)` + Execute Once ON = standard pattern for capping Google Sheets reads
- Feedback loop uses HTTP GET (not POST) to trigger WF1 regenerate webhook — simpler, no body needed
- Agent runs without Tavily web search — SKILL.md provides enough context for quality output
- `$('Read Feedback').last().json.Feedback` — `.last()` returns most recent feedback row (Sheets appends at bottom)

### Deferred
- Tavily web search not connected (SerpAPI removed in earlier session, Tavily key not set) — agent works without it; add when ready

### Next Session
- Add Tavily key (free at tavily.com) → connect to WF1 Agent node → activate STEP A web research
- Build WF3 (Image Generator) once sufficient approved captions accumulate
- Export WF1 + WF2 JSONs to `n8n-workflows/duberymnl/` for version control

---

## 2026-03-05 — DuberyMNL Caption Agent: WF2 Complete ✅

### Changes (Objective)
- Built WF2 (Approval Handler) end-to-end in n8n — fully tested and verified
- Branch 1 (GET): Webhook → Read Pending Captions → Build Review HTML → Serve Review Page
- Branch 2 (POST): Webhook → Parse Form → Read Pending For Sort → Tag Decisions → Route by Decision (IF) → Append Approved / Append Rejected → Merge → Clear Pending Queue → Send Confirmation
- Skill files written in previous session: `.claude/skills/duberymnl-caption-agent/SKILL.md`, `README.md`, `REFERENCE.md`
- Preview page created at `preview-review-page.html` (to be deleted after use)

### Decisions
- `Tag Decisions` Code node outputs one item per caption with `decision: 'approve'/'reject'` field — enables n8n IF node routing
- `$('Parse Form').first().json` used in Tag Decisions to cross-reference webhook POST body with Sheets rows
- Sheet range `A2:Z1000` used in Clear node to preserve header row
- Node naming convention: `GET — Review Page` / `POST — Form Submission` prefixes for clarity
- `Respond With: Text` + `Content-Type: text/html` header = correct pattern for HTML responses from n8n webhooks

### Verified Working
- Review page loads at `http://localhost:5678/webhook/duberymnl-review` ✅
- Submit → confirmation page appears ✅
- Approved captions → `approved_content` sheet ✅
- Pending queue cleared after submission ✅

### Next Session (Resume Here)
**Pre-flight:** Set n8n variables → Settings → Variables:
- `OPENAI_API_KEY`, `RA_EMAIL`, `TAVILY_API_KEY` (free at tavily.com), `N8N_BASE_URL`

**Build WF1 (Caption Generator):**
1. Schedule Trigger — `0 9 * * 1`
2. Google Sheets Read → `approved_content` last 10 rows → "Read Approved History"
3. Google Sheets Read → `rejected_content` last 10 rows → "Read Rejected History"
4. Agent node — GPT-4o-mini, system prompt = SKILL.md, Tavily tool for web search
5. Code node — parse JSON output, write 25 rows to pending_review → "Write To Pending"
6. Gmail node — send review link to `$vars.RA_EMAIL`

Plan file: `~/.claude/plans/fluffy-dreaming-kay.md`

---

## 2026-03-03 — USER-Level Claude Instructions Established

### Changes (Objective)
- Created `~/.claude.md` — USER-level Claude instruction file (applies to all projects, not just FIGGY)
- Sections: Identity, Communication Style, Hard Limits, Security Protocol, Handling Unknowns, Default Tech Environment, Session Defaults, Engineering Philosophy
- Security Protocol covers full lifecycle: no hardcoding → .env → .gitignore check → flag leaks → all envs → pre-push scan
- Verified no conflicts with FIGGY `CLAUDE.md` or `memory/INTEGRITY.md` — layers are complementary, not overlapping

### Decisions
- USER-level = universal baseline; PROJECT-level = FIGGY-specific rules
- INTEGRITY.md rule (Docker env vars) is the *specialized* form; `~/.claude.md` is the *general* form
- Security protocol intentionally covers all environments — no dev/prod exceptions

### Insight (Growth)
- Learned the 4-level CLAUDE.md hierarchy: Enterprise → User → Project → Local
- Understood npm vs pnpm tradeoffs — "always use pnpm" is not a universal rule; follow the lockfile
- Established that USER-level instructions are a security baseline at the OS level — more durable than per-project rules

### Next Action
- Optional: create `CLAUDE.local.md` inside FIGGY for machine-specific overrides not suitable for git

---

## 2026-03-04 — DuberyMNL Agent 1 Redesign — PAUSED (session boundary)

### Status
- PAUSED — RA wants to explain their full vision for Agent 1 before planning continues
- Do NOT resume planning mid-session — start fresh with RA's explanation

### Context
- Reviewed part3.md (Gemini transcript): the full two-agent architecture (Copywriter + Photo Editor)
- Architecture: Google Sheets triggers → Agent 1 (copywriter) → Agent 2 (photo editor) → email approval → FB post + Approved_Content log
- 3-tab Google Sheets: Sheet1 (raw queue), Product Catalog (specs + hooks + global assets), Approved_Content (memory)
- Dubery_Packaging = static asset (box + pouch + card) used only when Style_Tag = VALUE_PACKAGE

### What's wrong with Gemini's Agent 1 (all confirmed by RA)
- Too robotic / corporate sounding — task list, not a persona
- Missing Taglish tone / lodi energy
- Style_Tag output too vague (VALUE/ACTION/DETAIL)
- Hook selection too loose ("pick one random")

### Draft direction for Agent 1 (NOT finalized — RA has more to share)
- Persona block first ("You are the DuberyMNL brand voice...")
- Few-shot examples from CONTENT_LOG.md approved captions
- Hook matrix: model-aware selection, not random
- Style_Tag redesigned as actionable scene enums: RIDER | COMMUTER | OUTDOORS | VALUE_PACKAGE | HERO_SHOT | BOLD_SUN
- Plan file at: ~/.claude/plans/synchronous-roaming-lampson.md

### Next session
- RA will explain their idea for Agent 1 first
- Then plan together — no pre-building

---

## 2026-03-03 — DuberyMNL Content Generator Workflow Built

### Changes (Objective)
- Created `n8n-workflows/duberymnl/duberymnl-content-gen.json`
- Full pipeline: Form Trigger → Claude API (brief gen) → Gemini Image API (scene gen) → Gmail (brief + image)
- Form collects: product model, content format, scene vibe, product photo (file upload), notes
- Claude generates: Gemini prompt, headline, supporting line, caption, Canva spec — all parsed from delimited output
- Gemini receives: product photo (base64) + generated prompt → returns lifestyle scene
- Gmail delivers: HTML brief + generated image attached

### Decisions
- Binary (product photo) extracted to base64 JSON string in Code node BEFORE HTTP call — prevents binary loss through HTTP Request node
- `$('Node Name').first()` used in Code nodes to reference earlier pipeline data after it's replaced by HTTP responses
- Claude model: `claude-sonnet-4-6` / Gemini model: `gemini-2.0-flash-preview-image-generation`
- Canva still used for finishing (logo, headline overlay, price badge) — workflow generates the base scene only

### Required Setup (n8n Variables)
- `ANTHROPIC_API_KEY` — Settings → Variables in n8n
- `GEMINI_API_KEY` — Google AI Studio → API Keys
- `RA_EMAIL` — RA's email address for brief delivery

### Next Logic Gate
- Import workflow into n8n (active instance)
- Set the 3 n8n variables above
- Test with one product photo + vibe
- Review generated image quality; iterate Gemini prompt if needed

---

## 2026-03-03 — DuberyMNL Content Workflow Established
**What Changed:**
- Defined full content pipeline: concept → Gemini brief → Gemini image generation → finishing tool
- Established Gemini prompting patterns for lifestyle scene generation (angle, subjects, no watermark)
- Learned Gemini v1 failures: frontal angle, wrong sunglasses, both subjects wearing glasses
- Gemini v2 prompt pattern that works: explicit camera angle (45-degree side), explicit "woman NOT wearing sunglasses, looking at man", explicit product description
- Built Node.js overlay tool (apply_overlay.js + Sharp) — then scrapped it; RA prefers Canva for finishing
- Confirmed visual style from sample content: Anton font, left-aligned 2-line headline, logo top-right, white/red price badge
- Rasta motorcycle couple base image approved → pending Canva finish (`data/EDITED/TEMP/RASTA - RED - EDIT 01.png`)

**Decisions:**
- Finishing tool = Canva (not code-based overlay)
- Gemini = scene generation only; brand elements added in Canva
- pip not available without sudo on this system; Node.js + Sharp works fine for image processing if needed

**Files:**
- `clients/duberymnl/content-guidelines/BRAND_GUIDE.md` — brand identity, visual standards
- `clients/duberymnl/content-guidelines/CONTENT_LOG.md` — all post tracking
- `clients/duberymnl/data/EDITED/TEMP/` — working image folder

**Next Logic Gate:**
- RA finishes Rasta motorcycle couple in Canva → log as APPROVED in CONTENT_LOG.md → post

---

## INFRA-01 — n8n Volume Recovery
Time Spent:
Difficulty (1–5):
What Changed:
- Reattached Docker named volume `n8n-project_n8n_data`
- Fixed docker-compose mount to `/home/node/.n8n`
Proof of Work:
- Workflows reappeared after updating compose and restarting container
Lesson:
- Always verify n8n persistence mount paths before moving projects
Next Logic Gate:
- Decide whether/when to migrate from named volume → bind mount for portability

## DUBERY-01 — First Workflows Operational
Time Spent:
Difficulty (1–5):
What Changed:
- “Send Test Email” (manual trigger + Gmail)
- “Daily Email Briefings” (4 topics every 2 hours)
Proof of Work:
- Workflows visible in n8n and runnable
Lesson:
- Export JSON after every meaningful build
Next Logic Gate:
- Build geo-fence NCR validation flow (COD branching)

## 2026-03-02 — FIGGY Governance + Memory Scaffolding

### Changes (Objective)
- Created governance layer: `CLAUDE.md` (agent operating contract + repo pointers).
- Preserved ops runbook into `docs/N8N_OPS.md`.
- Added `docs/SMOKE_TEST.md`.
- Scaffolded memory system: `CORE.md`, `PRINCIPLES.md`, `DECISIONS.md`, `FACTS.md`, `BACKLOG.md`.
- Created first operational script: `scripts/figgy-health.sh`.
- Versioned DuberyMNL workflows under `n8n-workflows/duberymnl/`.
- Committed multiple checkpoints and pushed to origin.

### Verification
- Ran `figgy-health.sh`.
- Docker reachable.
- n8n container running.
- `n8n-project_n8n_data` volume present.
- `/healthz` endpoint returned OK.
- **Smoke Test: PASS**

### Decisions
- Separate governance (`CLAUDE.md`) from operational runbooks (`docs/`).
- Use layered memory model instead of single `memory.md`.
- Track workflow exports in version control (no secrets).
- Use structured reflective logging (Operational + Insight hybrid).

### Insight (Growth)
- Transitioned from "using tools" to "building systems."
- Understood the importance of operational validation before deeper work.
- Recognized that scripts convert process into infrastructure.
- Logging is compounding clarity, not repetition.

### Promotion Candidates
- **FACTS.md**: Existence of `scripts/figgy-health.sh` as baseline health tool.
- **PRINCIPLES.md**: Always verify system health before structural changes.
- **DECISIONS.md**: Layered memory architecture (governance vs ops vs memory separation).

### Next Action
- Implement automated weekly workflow export + git-commit script for n8n backups.

---

## 2026-03-02 — DUBERY-02: First Client Website Live

### Changes (Objective)
- Built DuberyMNL's first-ever standalone website from scratch: `clients/duberymnl/site/`
- Stack: plain HTML / CSS / JS — no framework, no build tool, no dependencies
- Three files created: `index.html`, `css/style.css`, `js/main.js`
- Sections: sticky nav, hero with background image, 4 product cards, COD trust section, order form, footer
- Integrated real assets: `duberymnlLOGO4.png` (logo) + 4 Gemini-generated product images
- Light theme with Unsplash sunglasses hero background (rgba overlay for readability)
- Hero logo set to 4× size (360px desktop / 200px mobile)
- Order form fields pre-wired to n8n schema (`name`, `email`, `contact_number`, `address`, `product_model`)
- Client-side validation + success state (no backend calls yet)
- Product cards pre-select dropdown model on "Order This" click

### Verification
- All anchor links resolve to correct section IDs
- Form validation fires on empty submit
- Success message shows on valid submit, no network request fires
- Mobile-first layout: 1-col → 2-col → 4-col product grid

### Decisions
- Plain HTML/CSS/JS chosen for portability (GitHub Pages / Netlify ready, zero build step)
- Form field names locked to n8n normalization schema — future webhook wiring requires zero HTML changes
- Light theme chosen by RA preference mid-build
- Product photos assigned randomly (placeholder) — correct mapping deferred to RA

### Insight (Growth)
- RA shipped their first real website end-to-end
- Milestone: moved from "automation systems" to "client deliverables" as a FIGGY output
- Proof that FIGGY is not just internal tooling — it can produce portfolio-grade client work

### Promotion Candidates
- **FACTS.md**: `clients/duberymnl/site/` is the DuberyMNL landing page location
- **DECISIONS.md**: Form field names are locked to n8n schema for zero-friction webhook wiring

### Next Action
- Deploy site to GitHub Pages or Netlify for a real public URL
- Wire order form to n8n webhook (field names already match — minimal effort)
- Assign correct product photos to correct model cards