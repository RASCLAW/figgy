# Current Priorities

_Update this file whenever your focus shifts. Dated snapshots — don't delete old entries, just add new ones at the top._

---

## 2026-03-06

### Active Build: DuberyMNL Automation Pipeline
WF1 (Caption Generator) and WF2 (Approval Handler) are live and verified. The pipeline generates captions, delivers them via email for review, routes approved/rejected to Google Sheets, and triggers regeneration on feedback.

**Next gates (in order):**
1. Add Tavily API key → activate web research in WF1 Agent node
2. Deploy DuberyMNL site to GitHub Pages or Netlify
3. Wire order form to n8n webhook
4. Build WF3 (Image Generator) — architecture fully designed; ready for node build

### WF3 Status: Architecture Locked 🚧
- Full flow designed: Schedule → Caption selection (5★ first) → Agent 1 → batch queue (5 min) → n8n Form approval → Agent 2 → fal.ai → Drive → Ready to Post sheet
- Agent 1 system prompt drafted (AIDA framework + Caption Analysis + dynamic overlays)
- Pending before node build: product model specs (Bandits Green, Rasta Red, Outback Blue) + naming confirmation + finalize Agent 1 system prompt

### Active Client: DuberyMNL
- COD sunglasses brand, Manila / NCR market
- 4 Golden Assets: Sky Blue, Stealth, Fire, Gold
- Content engine: caption generation → star review → approved content log → future FB posting

### Deferred (not blocking)
- Rating-weighted generation in WF1 (use star scores to influence prompt style)
- Correct product photo assignment in site
- Portfolio presence (Upwork / LinkedIn) — when pipeline is stable
