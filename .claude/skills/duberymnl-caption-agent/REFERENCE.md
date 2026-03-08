# DuberyMNL Caption Agent — Ops Manual

For RA and Arabelle. This is the human guide to maintaining and updating the caption system.

---

## Brand Rules Quick Reference

### Prices (use exactly these)
| Product | Price | How to frame it |
|---------|-------|----------------|
| Single pair | ₱699 | Always lead with this |
| Bundle (2 pairs) | ₱1,200 | "two pairs" or "share with your buddy" |
| Delivery | ₱100 COD | Never mention this in captions |

### Never Say
- ₱799 or ₱1,300 (total-with-delivery prices — never in captions)
- "Free shipping" / "Nationwide" / "₱499"
- "PM is key" (banned)
- Any sentence that sounds like a press release or marketing agency

### Always Do
- 60% English / 40% Tagalog — English carries structure, Tagalog delivers the punch
- Dynamic length — short when that wins, longer when that wins. Never lock a format.
- Inner arm detail callout — hidden design only visible up close — at least once per vibe
- CTA on its own line before hashtags
- Hashtags: `#DuberyMNL #PolarizedSunglasses #DuberyOptics #CODMetroManila #SameDayDelivery`

---

## The 5 Vibes

| # | Vibe | Scene | Tone |
|---|------|-------|------|
| 1 | Commuter / Anti-Corporate | EDSA, jeepney, MRT, tricycle, e-bike | Self-aware Filipino humor, relatable pain points |
| 2 | Outdoor / Tactical | Trail, road trip, moto/car/beach camping, running, biking | Active, adventurous, built-for-outdoors |
| 3 | Urban / Streetwear | City daily, sneaker/fit energy, Cubao/BGC/Marikina | Confident, subtle flex, "pa-cool" but grounded |
| 4 | Lifestyle / Culture | Pinoy pride first, Filipino identity, Rasta as one flavor | Warm, proud, culturally grounded |
| 5 | Sale / Urgency | Price-forward, FOMO, "right now" energy | Urgent but not desperate, ₱699 is hero |

---

## Approved Sample Captions

Pre-seed these into the `approved_content` tab in Google Sheets before the first run.
The agent reads these as voice calibration — not templates.

1. Is squinting your new personality trait? Fix your vision with Dubery. Polarized protection for only ₱699. Sulit na, pogi pa.
   Message us.

2. POV: You're in a jeep but you look like the owner. ₱699 for total eye comfort. Iwas eye-contact sa seatmate.
   Order now!

3. "Hindi kailangang mahal magmukhang boss." ₱1,200 for two pairs. Share the porma with your work buddy.
   DM us.

4. Still using your hand as a visor? It's 2026, lodi. Polarized protection for ₱699. Same-day delivery within Metro Manila.
   Order na.

5. Trail vision shouldn't be a struggle. Blue or Green lenses for elite clarity. Matte finish kaya kapit na kapit.
   Message us.

6. Tactical gear or just for show? Complete your kit with Dubery. ₱1,200 for two pairs para may backup ka sa top box.
   DM us.

7. Kalsada is life, but the silaw-factor is a drag. Dubery Outback Matte Black for that serious mission look. Polarized for your safety.
   Order na.

8. The "I look rich but I'm saving" starter pack. Classic shades that match any OOTD. ₱699 is the real life hack.
   Order now.

9. Navigate the city in 4K resolution. Block the building reflections. Clean look, solid vibes. Dubery lang sapat na.
   Order now.

10. Rooted in culture, designed for the sun. Rasta vibe for that proud Pinoy energy. Solid ang dating, lodi.
    DM us.

11. Pinoy pride in every sunset. Enjoy the golden hour without the squinting. Our Rasta collection is for the community.
    Message us.

### What NOT to write
❌ "Elevate your eyewear experience with Dubery's premium polarized lens technology."

---

## Google Sheets Seed Instructions

Do this once before the first Monday run.

1. Open your Google Sheets spreadsheet (name it **DuberyMNL Content**)
2. Create these tabs exactly:
   - `pending_review`
   - `approved_content`
   - `rejected_content`
   - `product_catalog`

3. In `approved_content`, add these column headers in row 1:
   `Timestamp | Vibe | Model | Caption | Hashtags | Generated_At`

4. In `rejected_content`, same headers:
   `Timestamp | Vibe | Model | Caption | Hashtags | Generated_At`

5. In `pending_review`, add:
   `ID | Vibe | Model | Caption | Hashtags | Generated_At`

6. In `product_catalog`, add:
   `Model | Colors | Drive_File_ID | Vibe`

7. Seed the 11 sample captions above into `approved_content` rows 2–12.
   Use today's date as Timestamp, assign the correct Vibe,
   add the hashtag line, and leave Generated_At and Model blank (manual seed).

---

## How to Update Things

### Add a new banned phrase
1. Open `SKILL.md` → Section 3 → NEVER SAY list
2. Add the phrase
3. Copy the entire SKILL.md content
4. Paste into n8n → WF1 → Agent node → System Message field
5. Save and re-activate WF1

### Add or change a vibe
1. Open `SKILL.md` → Section 4 → find the vibe
2. Edit the Scene / Tone / Hook ideas
3. Update the matching row in this file's vibe table above
4. Paste updated SKILL.md into n8n → WF1 → Agent node → System Message
5. Save and re-activate WF1

### Add a new approved sample caption
1. Open Google Sheets → `approved_content` tab
2. Add a new row with: Timestamp, Vibe, Model, Caption, Hashtags, Generated_At
3. No need to update SKILL.md — the agent picks it up automatically next Monday

### Change caption language ratio
1. Open `SKILL.md` → Section 1 (job list, line 4) and Section 3 (ALWAYS list, first bullet)
2. Update the ratio in both places
3. Paste updated SKILL.md into n8n and save

---

## Credentials Checklist

| What | Where to get it | Where to set it |
|------|----------------|-----------------|
| OpenAI API key | platform.openai.com | n8n → Variables → `OPENAI_API_KEY` |
| Tavily API key | tavily.com (free tier) | n8n → Variables → `TAVILY_API_KEY` |
| RA email | your Gmail | n8n → Variables → `RA_EMAIL` |
| n8n public URL | run `ngrok http 5678` | n8n → Variables → `N8N_BASE_URL` |
| Image gen API | decide when building WF3 | n8n → Variables → `IMAGE_GEN_API_KEY` |

### ngrok note
Free ngrok URL changes every time you restart it. If the review link stops working,
restart ngrok, copy the new URL, update `N8N_BASE_URL` in n8n variables.
Paid ngrok ($10/mo) gives a static domain — set once, never changes.
