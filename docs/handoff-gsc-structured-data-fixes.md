# Handoff: Fix Google Search Console structured-data errors — kolmekampusta.fi

You are picking up a live schema.org / JSON-LD project for **kolmekampusta.fi** (Kolmen kampuksen
urheiluopisto — a Finnish sports institute with three campuses: Pajulahti, Kisakallio,
Mäkelänrinne). The schema is delivered via Google Tag Manager (container `GTM-WD3C92NG`). It was
deployed recently, and Google Search Console has now reported three classes of structured-data
errors. Your job is to **diagnose the true source of each error, then fix the ones that belong to
our GTM tags**, without violating the project's hard constraints.

Repository root: `D:\code_projects\schema-ld-json`
GitHub: https://github.com/KolmeKampusta/JSON-LD-toteutus (remote `origin`, branch `main`)

---

## 0. Orient yourself first (read these before touching anything)

1. `CLAUDE.md` equivalents / global user instructions (the user is Jussi, a Finnish ICT specialist).
2. `gtm-tags-production.md` — the **canonical master** for all 26 tags, 24 triggers, 12 variables.
   Read especially **Tag 6 (Smart Content)** and **Tag 7 (Smart Section)** — these are the dynamic
   JS dispatchers that emit Event / TouristTrip / TouristAttraction / WebPage at runtime.
3. `tags/` — per-tag `.html` files. **Master file and per-tag files MUST always stay in sync.**
   When you change one, change the other.
4. `information-roundup.md` — plain-English inventory of every fact and which tag emits it.
5. `gtm-deployment-guide.md` — how tags are deployed and validated (Phases A–I).
6. `_build_gtm_container.js` → generates `gtm-container-import.json` for one-shot GTM import.
   **If you change any tag, regenerate this file** (`node _build_gtm_container.js`).

How the system works in one paragraph: each page loads GTM, which fires Custom HTML tags that inject
`<script type="application/ld+json">` blocks into the DOM. Static tags (1–5, 9–23) hold fixed JSON.
Dynamic tags (6, 7, 8, 24) read the live DOM and build JSON at runtime. Drupal *also* server-renders
its own JSON-LD (at minimum a `BreadcrumbList`, possibly more) — that output is **off-limits** unless
the user explicitly approves a Drupal change.

---

## 1. The errors reported by Google Search Console

### Error A — Product needs offers/review/aggregateRating (INVALID)
> "Either 'offers', 'review', or 'aggregateRating' should be specified. Items with this issue are
> invalid. Invalid items are not eligible for Google Search's rich results."
- `/fi/ryhmat-ja-leirit/rippileiri`
- `/fi/ryhmat-ja-leirit/luokkaretki`
- `/fi/ryhmat-ja-leirit/leirikoulu`
- …and maybe more

**Likely source:** Tag 7 (Smart Section), the `/ryhmat-ja-leirit/*` → `TouristTrip + Product` branch.
A `Product` requires one of offers/review/aggregateRating.

### Error B — Event missing location/offers/performer
> Missing field "offers", Missing field "performer", Missing field "address" (in "location"),
> Missing field "name" (in "location")
- 27 URLs under `/fi/tapahtumat/*` (full list at bottom of this file).

**Likely source:** Tag 6 (Smart Content), the `SportsEvent` branch.
For Google Event rich results: `name`, `startDate`, `location` are **required**; `location` must
contain `name` + `address`. `offers` and `performer` are **recommended only** (warnings, not errors).

### Error C — Bad escape sequence (UNPARSEABLE, CRITICAL)
> "New Unparsable structured data issues detected … Critical issues: Bad escape sequence in string"
- `/fi/vapaa-aika/aktiviteetit/kisakallion-rantasauna`
- `/fi/urheilu/urheilun-palvelut/taito-360`
- `/fi/vapaa-aika/aktiviteetit/pajulahden-uimahalli`

**Likely source (to confirm):** static Tag 15 (Kisakallio Sauna), Tag 12 (TAITO 360), Tag 11
(Swimming Hall) — OR a dynamic tag (6/7) building a string from DOM content that contains a literal
backslash — OR Drupal's own output. A single bad `\` escape makes the whole JSON-LD block invalid.

---

## 2. STEP 1 — Diagnose provenance (DO NOT EDIT YET)

For at least one representative URL from **each** error class, fetch the live page and extract every
`<script type="application/ld+json">` block. For each erroring page determine:

1. **How many JSON-LD blocks** are on the page.
2. **Which block** contains the error (the `@type`, and whether it is GTM-injected or Drupal-rendered).
   - Drupal blocks are in the server HTML (visible in View Source / a plain fetch).
   - GTM blocks are injected by JavaScript (visible in the rendered DOM, e.g. Rich Results Test URL
     mode, or a JS-rendering fetch — NOT in raw View Source).
3. **Whether there is duplication** (e.g. both a Drupal `Event` and our `SportsEvent`).

Tooling:
- **Google Rich Results Test, URL mode** is the authority: https://search.google.com/test/rich-results
  It renders JS, so it shows exactly what Google parses — including which item is invalid and why.
- A raw fetch (curl / WebFetch) shows only Drupal's server output. Comparing raw vs rendered tells you
  source (if an error block is in BOTH, it's Drupal; if only in rendered, it's GTM).
- Correlate Search Console "first detected" dates with the deployment date. The "New … detected"
  wording on Error C suggests it arrived with our deployment → our tags are the prime suspect, but
  confirm, don't assume.

**Special focus for Error C:** locate the exact offending character. "Bad escape sequence" = a `\`
followed by a character that is not one of `" \ / b f n r t u`. Find which field/string contains it
and in which tag/block.

**Special focus for Error B:** open 3–4 live event pages and inspect the Drupal DOM for the event
location fields Tag 6 was designed to read (`.field--name-field-event__location-name`,
`.field--name-field-event__location-address`). Decide which is true:
- (a) The location data **exists** in the DOM but our selector is wrong/failing → fix the selector.
- (b) The location data is **absent** in Drupal → fall back to detecting the campus from the URL slug
  / title (most slugs end `-pajulahdessa` / `-kisakalliossa`) and inline that campus's name + address.
  For events where the campus **cannot** be determined (e.g. `guttman-games-2026`,
  `ittf-para-future-finland-open-2026`, `susanna-tapanin-...`), do **not** guess — list them for the
  user to fill in Drupal.

---

## 3. STEP 2 — Present findings + fix plan, get approval

Before editing, report back to the user with:
- For each error class: the confirmed source block (GTM tag # or Drupal), with evidence.
- Your proposed fix for each (see Section 5 for the recommended approach).
- Any errors that trace to **Drupal** → flag them; do **not** fix without explicit approval.
- Any events whose campus/location cannot be auto-resolved → list them.

Wait for the user's go-ahead before changing files.

---

## 4. STEP 3 — Implement (rules)

- Edit BOTH `gtm-tags-production.md` AND the matching `tags/tag-XX-*.html`. Keep them identical.
- After any tag change, run `node _build_gtm_container.js` to regenerate `gtm-container-import.json`,
  and run `node _build_facts_checklist.js` if static facts changed.
- Preserve each tag's consent setting (`consentStatus: NOT_NEEDED`) and the dynamic image variable
  `{{js.og.image.or.fallback}}`.
- Dynamic tags must build JSON via `JSON.stringify` on an object (never hand-concatenate strings into
  JSON) so DOM content with backslashes/quotes can never break parsing. If you find a dynamic tag
  hand-building JSON, that is very likely the Error C root cause — convert it to object + stringify.
- Keep the existing "incomplete entity prevention" philosophy: never emit an entity that is missing a
  field Google requires. Better to omit the entity (or a recommended field) than to emit an invalid one.

---

## 5. Recommended fix approach (confirm against your diagnosis)

**Error A (Product on `/ryhmat-ja-leirit/*`):** Remove the `Product` type from this branch. We cannot
add `offers` (no reliable price in the DOM, and fabrication is forbidden) and `review`/`aggregateRating`
are forbidden (DigitalGuest compliance). Keep `TouristTrip` alone (valid, no required offers) or drop
the branch entirely so Tag 6's `WebPage` covers the page. Removing the incomplete Product clears the
error.

**Error B (Event location on `/tapahtumat/*`):** The fix that converts events from invalid→valid is a
complete `location`. On event pages the campus Place entities (Tags 3/4/5) do **not** fire, so you
**cannot** use a bare `@id` reference — you must **inline** the location:
```
"location": {
  "@type": "Place",
  "name": "Pajulahti",                // detected campus
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "postalCode": "15560",
    "addressLocality": "Lahti",
    "addressRegion": "Päijät-Häme",
    "addressCountry": "FI"
  }
}
```
Campus addresses (use these exact values — they match Tags 3/4/5):
- **Pajulahti:** Pajulahdentie 167, 15560 Lahti, Päijät-Häme, FI
- **Kisakallio:** Kaarina Karin tie 4, 08360 Lohja, Uusimaa, FI
- **Mäkelänrinne:** Mäkelänkatu 47, 00550 Helsinki, Uusimaa, FI

Campus detection order: (1) the Drupal event location field if populated; (2) the URL slug suffix
(`-pajulahdessa`→Pajulahti, `-kisakalliossa`→Kisakallio); (3) the page title. If none resolve, leave
location off and report the event for manual Drupal entry — do not fabricate.
Leave `offers` and `performer` **omitted** (recommended-only → warnings, not errors). Do not fabricate
them. Do not add review/aggregateRating.
(Optional, discuss with user — not in scope unless they ask: whether camps/courses should be
`EducationalEvent`/`Course` rather than `SportsEvent`. Keep `SportsEvent` for now; it is valid.)

**Error C (Bad escape sequence):** Find the literal `\` in the offending block and fix it.
- If it is a **static** tag (11/12/15): correct the string in master + per-tag file, regenerate the
  container JSON.
- If it is a **dynamic** tag (6/7) hand-building JSON from DOM text: convert to object + `JSON.stringify`.
- If it is **Drupal's** output: stop and report to the user (no Drupal edits without approval).

---

## 6. STEP 4 — Re-validate & redeploy

1. Re-run any local validation scripts in `scripts/` as relevant.
2. Regenerate `gtm-container-import.json` (`node _build_gtm_container.js`) **for repo consistency** —
   but the **deployment method is hand-editing only the changed tags in GTM** (the user has chosen
   this; do NOT do a full container re-import). Concretely:
   - Produce a short, explicit list of exactly which tags changed (e.g. "Tag 6, Tag 7, Tag 12") so the
     user knows precisely what to touch.
   - For each changed tag: in GTM open that tag → replace the HTML field with the corrected content
     from the matching `tags/tag-XX-*.html` file → **preserve its existing trigger and its consent
     setting (No additional consent required)** → Save.
   - Do not create, delete, or re-import other tags. Only the changed ones are edited.
   - Then Preview the affected URLs in GTM, and Publish.
3. Re-test each previously-erroring URL in **Rich Results Test, URL mode** until clean (or
   warnings-only).
4. In Search Console, use **Validate Fix** on each fixed issue so Google re-crawls.
5. Note that GSC clears errors on its own crawl schedule (days–weeks) — RRT URL mode is the immediate
   source of truth.

---

## 7. Hard constraints (non-negotiable)

- **No fabricated/placeholder values.** If data is missing, omit the field or ask the user.
- **Never add `aggregateRating` or `Review`** (Google compliance issue with DigitalGuest).
- **No Drupal code changes without explicit user confirmation.** If an error is in Drupal's output,
  report it; don't fix it.
- **Do not modify or duplicate Drupal's existing BreadcrumbList** (or any Drupal-emitted schema).
- **Master ↔ per-tag sync** always. Regenerate `gtm-container-import.json` after tag changes.
- **Rich Results Test (Google) is the authority**, not schema.org validator. We build for Google.
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Respond to the user in the language they use (they mix Finnish and English). Finnish content must
  follow the `suomen-kieli` skill rules (compound words, no anglicisms, consistent sinuttelu).

---

## 8. First actions

1. Read the orientation files in Section 0.
2. Run STEP 1 diagnosis on one URL per error class (plus 3–4 event pages for the location question).
3. Report findings + a per-class fix plan and **wait for approval** before editing.

---

## Appendix — full event URL list (Error B)
```
/fi/tapahtumat/senioritennis-4-vrk-pajulahdessa-0
/fi/tapahtumat/kesafiilis-pajulahdessa
/fi/tapahtumat/syysloman-tekniikkaleiri-pojille-13-14102026-pajulahdessa
/fi/tapahtumat/luonnon-aarelle-kisakalliossa
/fi/tapahtumat/kesafiilis-kisakalliossa
/fi/tapahtumat/aquafiilis-pajulahdessa-3
/fi/tapahtumat/helsinki-rockettes-esikuvaleiri
/fi/tapahtumat/laura-lepiston-kesaleiri-14-1762026-kisakalliossa
/fi/tapahtumat/crosstraining-viikonloppu-pajulahdessa
/fi/tapahtumat/susanna-tapanin-tyttokiekko-ja-ringetteleiri-2026
/fi/tapahtumat/tyttojen-kamppailuleiri-14-1762026
/fi/tapahtumat/kaj-kunnaksen-kuntofiilis-50
/fi/tapahtumat/makiahon-jaakiekkoleiri-kisakalliossa-10-1272026
/fi/tapahtumat/guttman-games-2026
/fi/tapahtumat/pelileiri-2026
/fi/tapahtumat/pohja-coaching-hybridiharjoittelu-pajulahdessa
/fi/tapahtumat/tenniskurssi-4-vrk-pajulahdessa
/fi/tapahtumat/aquafiilis-pajulahdessa-2
/fi/tapahtumat/mustin-hiihtoleiri-14-1762026-pajulahdessa
/fi/tapahtumat/kesa-pajulahdessa-2-5-vrk-0
/fi/tapahtumat/tenniskurssi-2-vrk-pajulahdessa
/fi/tapahtumat/pajukettuleiri-2-pajulahdessa
/fi/tapahtumat/kesa-pajulahdessa-vkot-28-32-57-78
/fi/tapahtumat/tiina-stenin-tyttokorisleiri-14-1762026-kisakalliossa
/fi/tapahtumat/kesa-pajulahdessa-2-5-vrk
/fi/tapahtumat/ittf-para-future-finland-open-2026
/fi/tapahtumat/berit-kaijomaan-kesaleiri-3
```

## Appendix — bad-escape URLs (Error C)
```
/fi/vapaa-aika/aktiviteetit/kisakallion-rantasauna
/fi/urheilu/urheilun-palvelut/taito-360
/fi/vapaa-aika/aktiviteetit/pajulahden-uimahalli
```

## Appendix — group-trip URLs (Error A)
```
/fi/ryhmat-ja-leirit/rippileiri
/fi/ryhmat-ja-leirit/luokkaretki
/fi/ryhmat-ja-leirit/leirikoulu
(…check for more under /fi/ryhmat-ja-leirit/*)
```
