# DuberyMNL Caption Agent

Automated weekly caption generator for DuberyMNL social media (Facebook).
Runs every Monday 9AM, generates 25 captions across 5 vibes, and sends them
to RA for one-tap mobile approval.

---

## What This Agent Does

1. Researches competitor content (Angkas FB, Philippines sunglasses brands)
2. Reads the last 10 approved + 10 rejected captions from Google Sheets
3. Generates 25 fresh captions (5 per vibe × 5 vibes) as structured JSON
4. Saves them to a `pending_review` sheet and emails a single review link
5. RA reviews and submits approvals via a mobile-friendly webpage
6. Approved captions feed the image generator (WF3)

---

## Files in This Folder

| File | Purpose |
|------|---------|
| `SKILL.md` | System prompt — paste this into the n8n Agent node System Message field |
| `REFERENCE.md` | Ops manual — brand rules, sample captions, vibe guide, update instructions |
| `README.md` | This file |

---

## Setup Checklist

Before the first run, complete the following:

- [ ] Paste `SKILL.md` into the n8n Agent node System Message field (WF1)
- [ ] Pre-seed the 11 sample captions into Google Sheets `approved_content` tab
      (see `REFERENCE.md` → Google Sheets Seed Instructions)
- [ ] Add `OPENAI_API_KEY` to n8n variables panel
- [ ] Add `TAVILY_API_KEY` to n8n variables panel (free at tavily.com)
- [ ] Set `RA_EMAIL` in n8n variables panel
- [ ] Start ngrok (`ngrok http 5678`) and set the URL as `N8N_BASE_URL`
- [ ] Activate WF2 first (webhook must be live before WF1 sends the link)
- [ ] Activate WF1
- [ ] Activate WF3 (image generator — activate after first approvals exist)

---

## Workflows

| Workflow | File | Trigger |
|----------|------|---------|
| WF1 Caption Generator | `duberymnl-caption-generator.json` | Monday 9AM (`0 9 * * 1`) |
| WF2 Approval Handler | `duberymnl-caption-approver.json` | Webhook, always-on |
| WF3 Image Generator | `duberymnl-image-generator.json` | Triggered by WF2 on submission |

---

## Google Sheets Structure

Spreadsheet name: **DuberyMNL Content**

| Tab | Purpose |
|-----|---------|
| `pending_review` | 25 captions written here every Monday — cleared after review |
| `approved_content` | Approved captions accumulate here — agent reads last 10 |
| `rejected_content` | Rejected captions accumulate here — agent reads last 10 |
| `product_catalog` | Model → Drive photo mapping for WF3 |

---

## Weekly Flow (What Happens Each Week)

```
Monday 9AM    WF1 runs → generates 25 captions → saves to pending_review → emails RA
Monday–Wed    RA opens review link on phone → approves/rejects → submits
On submit     WF2 sorts captions → appends to sheets → triggers WF3
WF3           Image generator runs on approved captions
```

---

## Build Paths

**Path A — Manual build** (recommended for learning)
Claude guides you live through each node in the n8n UI.

**Path B — Import JSON** (fast setup)
Import the workflow JSON files above via n8n → top-right menu → Import from file.
Then reconnect credentials and set your variable references.
