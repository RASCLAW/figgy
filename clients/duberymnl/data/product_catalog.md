# DuberyMNL Product Catalog

> Compiled from sales_2020_2021.txt and 2022 inventory spreadsheet.
> Use this as the canonical reference for product names, abbreviations, and color variants.

---

## Active Models (confirmed in 2022 inventory)

| Model | Short Code | Colors |
|-------|-----------|--------|
| Outback | OB | Red, Blue, Green, Black, Grey, Ash Grey, Stripe, Camou |
| Classic | C | Blue (CB), Red (CR), Purple (CP), Black (CBLK) |
| Bandits | B | Blue (BB), Green (BG), Black (BBLK), Camo, White |
| Rasta | R | Red (RR), Blue (RB), Brown, Yellow (RY), JH, GSC |
| Brooks | B | Blue (BB), Green (BG), Purple (BP), Black (BBLK), Brown (BBROWN) |
| Lycra | — | Sandblack, Slickblack |
| Evans | E | Black (EB), Green (EG), Red (ER), Blue (EBG), Mint (EM), Purple (EP) |

> Note: Bandits and Brooks share the same short prefix (B). Context distinguishes them.
> In 2022 data: BB/BG/BP/BBLK most likely refer to Brooks based on inventory layout.

---

## Discontinued / Not in 2022 Inventory

| Model | Short Code | Colors seen |
|-------|-----------|-------------|
| Drifters / Drifters XL | D / DR | Blue (DB), Black (DBLK), Green (DG) |
| Sherlock | — | Black, Blue, Brown |
| Quik | — | Blue, Brown, White |
| Envy | — | (single sale observed) |
| Camou | — | (standalone or OB variant — unclear) |

---

## Abbreviation Decoder

### Outback (OB)
| Code | Meaning |
|------|---------|
| OBR | Outback Red |
| OBB / OBBLU / OBBLUE | Outback Blue |
| OBG / OBGRN | Outback Green |
| OBBLK | Outback Black |
| OB GREY / ASH GRY | Outback Grey / Ash Grey |
| OB STRIPE | Outback Stripe |
| OB CAMOU | Outback Camou |

### Classic (C)
| Code | Meaning |
|------|---------|
| CB | Classic Blue |
| CR | Classic Red |
| CP / CPURPS | Classic Purple |
| CBLK | Classic Black |

### Bandits / Brooks (B)
| Code | Meaning |
|------|---------|
| BB | Bandits Blue OR Brooks Blue |
| BG | Bandits/Brooks Green |
| BP | Bandits/Brooks Purple |
| BBLK | Bandits/Brooks Black |
| BBROWN | Brooks Brown |
| BNDTS / BNDT | Bandits (full reference) |

### Rasta (R)
| Code | Meaning |
|------|---------|
| RR | Rasta Red (most ordered item) |
| RB | Rasta Blue |
| RY | Rasta Yellow |
| Rasta JH / Rasta GSC | Rasta colorway variants (unclear full name) |

### Evans (E)
| Code | Meaning |
|------|---------|
| EB | Evans Blue or Evans Black (context-dependent) |
| EG | Evans Green |
| ER | Evans Red |
| EBG | Evans Blue-Green |
| EM | Evans Mint |
| EP | Evans Purple |
| EBP | Evans Blue-Purple |

### Drifters (D) — discontinued
| Code | Meaning |
|------|---------|
| DB | Drifters Blue |
| DBLK | Drifters Black |
| DG | Drifters Green |
| DR | Drifters Red or Drifters (color unspecified) |

---

## Location Codes

| Code | Location |
|------|---------|
| LUZ | Luzon |
| VIS | Visayas |
| MIN | Mindanao |
| NCR | National Capital Region (Metro Manila) |
| MM / MNL | Metro Manila |
| QC | Quezon City |
| MKT / MRKN | Makati / Marikina |
| NL | North Luzon |
| SL | South Luzon |
| RZL | Rizal |
| BAT | Batangas |
| BUL | Bulacan |
| CEB | Cebu |
| DVO | Davao |
| ILO | Iloilo |
| DGT | Dumaguete |
| COT | Cotabato |
| SUR | Surigao |
| JOL | Jolo |
| BKD / BKN | Bukidnon |
| BCD | Bacolod |
| ILO | Iloilo |
| LEY | Leyte |
| TWI | (unknown) |
| PLW | Pampanga/Palawan |
| MUN | Muntinlupa |
| VIR | (unknown, possibly Virac) |
| DAET | Daet, Camarines Norte |
| SIQ | Siquijor |
| DMT | Dumaguete |

---

## Key Notes for Future Development

1. **Multi-item orders are common** — `OBR/OBBLK` means 2 items in one order. The current website's single `product_model` field won't handle this. Future improvement: allow multiple items per order.
2. **Status field is inconsistent** — values include `Paid`, `paid`, numeric amounts (200–1000), blank, `sold`, `reserved`. Needs normalization before any n8n automation processes it.
3. **Rasta Red (RR) is the best-seller** — appears most frequently across both datasets.
4. **Outback Blue (OBB) is the second most ordered** variant.
5. **Hard case (HC) add-on** is a recurring upsell — customers order sunglasses + case together.
6. **Asterisk (*) in order field** likely means "reserved/pending stock confirmation" — not fulfilled immediately.
7. **Tracking number MU** = likely "meet-up" (personal handoff, no courier).
8. **Tracking number SPDY** = likely SPD courier or speedy delivery.
