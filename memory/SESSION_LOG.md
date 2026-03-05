# SESSION LOG (Milestone-Based)

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