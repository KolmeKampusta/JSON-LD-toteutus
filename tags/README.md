# GTM tag bodies — per-tag files

This folder contains all 25 schema.org tags as individual files. Each file holds the complete content (including the `<script>` wrapper) that goes into a GTM Custom HTML tag.

## File map

| File | Tag | Type | Trigger |
|---|---|---|---|
| `tag-01-organization.html` | Tag 1 — Organization (sitewide) | static JSON-LD | A — All Pages — Page View |
| `tag-02-website.html` | Tag 2 — WebSite (sitewide) | static JSON-LD | A — All Pages — Page View |
| `tag-03-pajulahti-campus.html` | Tag 3 — Pajulahti Campus | static JSON-LD (@graph: Place + EducationalOrganization) | B — Pajulahti Campus |
| `tag-03a-pajulahti-accommodation.html` | Tag 3a — Pajulahti Accommodation | static JSON-LD (Hotel/Resort) | E — Pajulahti Accommodation |
| `tag-04-kisakallio-campus.html` | Tag 4 — Kisakallio Campus | static JSON-LD (@graph: Place + EducationalOrganization) | C — Kisakallio Campus |
| `tag-04a-kisakallio-accommodation.html` | Tag 4a — Kisakallio Accommodation | static JSON-LD (Hotel/Resort) | F — Kisakallio Accommodation |
| `tag-05-makelanrinne.html` | Tag 5 — Mäkelänrinne | static JSON-LD (@graph: Place + EducationalOrganization) | D — Mäkelänrinne |
| `tag-06-smart-content.html` | Tag 6 — Smart Content dispatcher | **dynamic JS** | AA — All Pages — DOM Ready |
| `tag-07-smart-section.html` | Tag 7 — Smart Section dispatcher | **dynamic JS** | AA — All Pages — DOM Ready |
| `tag-08-debug.html` | Tag 8 — Debug logger | **dynamic JS** | BB — All Pages — Window Loaded |
| `tag-09-lake-pool.html` | Tag 9 — Lake Pool Pajulahti | static JSON-LD | G — Lake Pool Pajulahti |
| `tag-10-adventure-park.html` | Tag 10 — Adventure Park | static JSON-LD | H — Adventure Park |
| `tag-11-swimming-hall.html` | Tag 11 — Swimming Hall | static JSON-LD | I — Swimming Hall |
| `tag-12-taito-360.html` | Tag 12 — TAITO 360 | static JSON-LD | J — TAITO 360 |
| `tag-13-recovery-center.html` | Tag 13 — Recovery Center | static JSON-LD | K — Recovery Center |
| `tag-14-sporttipassi.html` | Tag 14 — Sporttipassi | static JSON-LD | L — Sporttipassi |
| `tag-15-kisakallio-sauna.html` | Tag 15 — Kisakallio Sauna | static JSON-LD | M — Kisakallio Sauna |
| `tag-16-altitude-training.html` | Tag 16 — Altitude Training | static JSON-LD | N — Altitude Training |
| `tag-17-testing-services.html` | Tag 17 — Testing Services | static JSON-LD | O — Testing Services |
| `tag-18-equipment-rental.html` | Tag 18 — Equipment Rental | static JSON-LD | P — Equipment Rental |
| `tag-19-restaurants.html` | Tag 19 — Restaurants @graph | static JSON-LD (3 restaurants) | Q — Restaurants |
| `tag-20-vocational-education.html` | Tag 20 — Vocational Education | static JSON-LD | R — Vocational Education |
| `tag-21-apprenticeship.html` | Tag 21 — Apprenticeship | static JSON-LD | S — Apprenticeship |
| `tag-22-continuing-education.html` | Tag 22 — Continuing Education | static JSON-LD | T — Continuing Education |
| `tag-23-liberal-adult-education.html` | Tag 23 — Liberal Adult Education | static JSON-LD | U — Liberal Adult Education |

## How to use

### To paste into GTM
Each file's full content (including `<script>` tags) goes into the **HTML** field of a Custom HTML tag in GTM. Set the trigger per the table above, and **Consent Settings → No additional consent required** under Advanced Settings.

### REQUIRED — Custom JavaScript Variable
14 tags reference `{{js.og.image.or.fallback}}` for their `image` field. **Before pasting those tags into GTM**, create the variable in GTM → Variables → User-Defined → New → Custom JavaScript. Full code and details in `gtm-tags-production.md` section A.1.

Affected tags: 3, 3a, 4, 4a, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, plus all 3 restaurants in Tag 19's `@graph`.

Why: this lets the schema pull each page's actual hero image dynamically (so changing a hero in Drupal auto-updates the schema, no GTM redeploy needed).

### To test in validator.schema.org
Open [validator.schema.org](https://validator.schema.org/) → **Code Snippet** tab → paste the file content (the validator accepts the `<script>` wrapper). Works for all static JSON-LD tags (everything except Tag 6, 7, 8).

### To test in Rich Results Test
Open [search.google.com/test/rich-results](https://search.google.com/test/rich-results) → **Code** tab → paste the file content. Same caveat: works for static JSON-LD tags only.

### How to test the dynamic dispatchers (Tags 6, 7, 8)
Static validators can't test JS dispatchers because the schema is generated at runtime. Use GTM Preview Mode on representative URLs:

- Tag 6: test on `/fi`, `/fi/artikkelit/*`, `/fi/uutiset/*`, `/fi/blogi/*`, `/fi/tapahtumat/*`
- Tag 7: test on `/fi/meista/yhteystiedot`, `/fi/meista/*`, `/fi/ryhmat-ja-leirit/*`, `/fi/vapaa-aika/aktiviteetit/*`, `/fi/yritykset/*`
- Tag 8: test on any page — check browser Console for `[Schema.org]` group

## Source of truth

This folder is generated from `gtm-tags-production.md` (the master single-file source) which itself supersedes:
- `kolmekampusta-gtm-schema.md` (original master plan, frozen)
- `kolmekampusta-gtm-schema-refined.md` (audit/refinement record)

If you make changes, update both `gtm-tags-production.md` AND the corresponding per-tag file here. The two should always match.

## Cross-reference: which tags fire on which page

A typical page on kolmekampusta.fi will have multiple tags firing simultaneously. Examples:

| Page type | Tags that fire |
|---|---|
| Homepage `/fi` | 1, 2, 6 (WebPage with fallback image), 8 |
| Campus page `/fi/pajulahden-kampus` | 1, 2, 3, 6 (WebPage fallback), 8 |
| Accommodation `/fi/majoitus/pajulahti` | 1, 2, 3a, 6 (WebPage fallback), 8 |
| Article `/fi/artikkelit/*` | 1, 2, 6 (Article), 8 |
| News `/fi/uutiset/*` | 1, 2, 6 (NewsArticle), 8 |
| Blog `/fi/blogi/*` | 1, 2, 6 (BlogPosting), 8 |
| Event `/fi/tapahtumat/*` | 1, 2, 6 (SportsEvent), 8 |
| Restaurant landing `/fi/ravintolapalvelut` | 1, 2, 6, 19, 8 |
| Facility (e.g. Lake Pool) | 1, 2, 6, 7 (TouristAttraction), 9, 8 |
| Contact `/fi/meista/yhteystiedot` | 1, 2, 6, 7 (ContactPage), 8 |
| About `/fi/meista/*` | 1, 2, 6, 7 (AboutPage), 8 |
| Education program (e.g. ammatillinen-koulutus) | 1, 2, 6, 20, 8 |

The existing Drupal Metatag `BreadcrumbList` JSON-LD continues to be emitted server-side on every content node page — it's preserved untouched by this plan.
