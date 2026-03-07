# RA MASTER MEMORY CORE — v1.0

## I. CORE IDENTITY
RA, 40, Manila. Night shift Criminal Data Processor (high-stakes compliance). C++ background.

Primary Mission:
- Transition into a Technical VA specializing in n8n automation + AI workflow systems.

Primary Driver:
- Build stable financial systems for family.

Learning Style:
- Hands-on builder; learns by doing.
- High persistence under failure.
- Thinks in logic trees and systems.
- Multitasks using voice input while building.

## II. COGNITIVE PROFILE
Engineering Bias:
- System integrity > speed.
- Architecture before scaling.
- Verification before trust.
- Observability required (logs, proof-of-work).

Compliance Influence:
- Cross-reference against a Source of Truth (Sheets/Docs).
- Automated decisions must be auditable.
- “Good enough” is unacceptable.

Productivity Pattern:
- Natural optimizer; builds internal tools without being asked.
- Prefers supervising automation over repetitive manual work.

## III. TECH STACK (LAB)
Environment:
- Windows + WSL2 Ubuntu
- Docker (native in WSL preferred)
- VSCode
- Claude Code (execution)
- claude.ai (strategy/planning)
- GitHub private repo (FIGGY)

n8n:
- Self-hosted via Docker
- Persistent storage via named volume: n8n-project_n8n_data
- MCP configured (czlonkowski/n8n-mcp)
- Version awareness: avoid n8n v2.9.4 file writing bug; prefer stable version (as applicable)

Operational Rule:
- Never modify Docker volume mapping without verifying mount path.

## IV. WORKSPACE (FIGGY OS)
Location:
- ~/projects/figgy

Purpose:
- Automation Lab + Portfolio Engine

Structure:
- n8n-workflows/
- automation-scripts/
- templates/
- learning/
- projects/
- clients/

Workflow Export Process:
- Build → Export JSON → Save in FIGGY → Push to GitHub

Milestone Files:
- CLAUDE.md
- ABOUT_ME.md

## V. ACTIVE PROJECT: DUBERYMNL AUTOMATION
Business Model:
- COD (Cash on Delivery)

Geo-Fence Logic:
- Validate address within NCR (Metro Manila) using regex or lookup table
- Route: NCR → COD branch; Non-NCR → Standard Shipping / rejection
- Must be deterministic + auditable

Product Catalog (confirmed):
- CLASSIC  — Blue, Red, Black, Purple
- OUTBACK  — Black, Blue, Green, Red
- BANDITS  — Camo, Green, Blue, Black
- RASTA    — Red, Brown

Content Engine:
- Logic: select model+color → localized prompt → image generation API → varied feed

## VI. EXECUTION PREFERENCES
- Clear step-by-step, copy-paste commands
- Prefer understanding what’s happening “behind the scenes”
- Token/session limit awareness early
- Minimal formatting; green=highlights, red=errors
- Claude Code handles heavy lifting; RA supervises
- Use plan mode for complex Claude Code tasks

## VII. OPERATIONAL GUARDRAILS
- Skill Gate: new tool → feasibility summary before implementation
- Session closeout: summarize what was built, where stored, next logic gate
- n8n deliverables: clean importable JSON
- Backtick principle: backticks for multi-line code in function nodes

## VIII. STRATEGIC QUESTIONS
- When to migrate n8n to cloud?
- When to convert named volume → bind mount?
- How to structure multi-client architecture inside FIGGY?
- When to formalize README?
- When to start portfolio presence (Upwork/LinkedIn)?

## IX. AI ORCHESTRATION MODEL

Primary Pattern:
- Use the BIG 3 (Claude, ChatGPT, Gemini) for brainstorming, architectural thinking, cross-validation, and perspective comparison.
- Use Claude Code for execution, implementation, file operations, and structured workflow building inside FIGGY.

Operational Flow:
1. Brainstorm / analyze with BIG 3.
2. Consolidate insights into a structured plan.
3. Execute implementation in Claude Code.
4. Export, document, and version inside FIGGY.

Tool Philosophy:
- AI models are processors, not identity holders.
- Memory lives in FIGGY, not inside any AI platform.
- No single model defines the system.
- Architecture must remain portable across models.

Future-Proofing Rule:
- New AI tools may be added over time.
- Tools are interchangeable components.
- FIGGY remains the central Source of Truth.