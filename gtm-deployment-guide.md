# GTM deployment + indexing — comprehensive step-by-step guide

End-to-end deployment of the schema.org tags to the live GTM container `GTM-WD3C92NG` and subsequent Search Console indexing.

**Estimated total time**: ~3 hours spread across the day (validation 30 min + GTM setup 90 min + preview testing 30 min + publish & verify 15 min + Search Console 15 min + initial monitoring as background).

---

## Prerequisites

- Access to GTM with **publish rights** on container `GTM-WD3C92NG`
- Access to Google Search Console for `kolmekampusta.fi` property
- Python 3.10+ installed (verify with `python --version`)
- Windows PowerShell (or any terminal — examples use PowerShell)
- Two browser windows: one private (for clean live verification), one regular (for GTM Preview)
- Files in place locally:
  - `gtm-tags-production.md` (master)
  - `tags/` folder (26 per-tag files)
  - `scripts/` folder (open-rrt.py, open-validator.py, README.md)

---

# PHASE A — Local validation (30 min)

Test the static-JSON tags against schema.org's strict spec and Google's Rich Results Test before touching GTM. This catches schema errors at zero cost.

## Step A1 — Install Python dependencies

```powershell
cd D:\code_projects\schema-ld-json
python -m pip install pyperclip
```

If `python` isn't found, install from [python.org](https://www.python.org/downloads/) with "Add to PATH" checked, then reopen PowerShell.

## Step A2 — Validate against schema.org (15 min)

```powershell
python scripts/open-validator.py
```

For each of the 22 tags the script handles:

1. Press Enter in PowerShell
2. Browser tab opens validator.schema.org with tag content already on clipboard
3. Click **Code Snippet** tab in validator
4. **IMPORTANT** for tags 3, 3a, 4, 4a, 5, 9–17, 19: the pasted content contains `{{js.og.image.or.fallback}}` — this is a GTM template variable, not a URL. Before clicking "Run Test", manually edit the `image` field in the editor: change `["{{js.og.image.or.fallback}}"]` to `["https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg"]` (any valid URL works for the test).
5. Paste (Ctrl+V), then if needed make the substitution above, then click **Run Test**
6. Read result. Expected outcomes:
   - **Tag 1**: ~180 warnings about `sport` not recognized on EducationalOrganization/Organization — **expected, accepted decision**
   - **All other tags**: 0 errors, 0 warnings (or only image-related warnings if you forgot the URL substitution)
7. Switch back to PowerShell → press Enter for the next tag

If any tag throws unexpected errors, stop and report back — do not deploy a broken tag.

## Step A3 — Validate against Google Rich Results Test (15 min)

```powershell
python scripts/open-rrt.py
```

Same workflow. Same image-variable substitution.

Expected per the audit table:
- ✅ Items detected: Tags 1, 3, 3a, 4, 4a, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19 (16 tags)
- ✗ "No items detected" (expected): Tags 2, 18, 20, 21, 22, 23 (6 tags — these types have no Google rich result feature)

For tags showing "no items detected", that's NORMAL — those types are valid schema but Google doesn't currently surface them as rich results.

## Step A4 — Decision point

**Go to Phase B** if all validations pass (with expected exceptions).

**Stop and fix** if any tag throws unexpected errors. Paste the error to me and I'll patch both the master file and the matching per-tag file atomically.

---

# PHASE B — GTM workspace setup (90 min)

## Step B1 — Open GTM and create a fresh workspace (2 min)

1. Go to [tagmanager.google.com](https://tagmanager.google.com/)
2. Select container `GTM-WD3C92NG`
3. Top right → **Workspace switcher** → click **+ New Workspace**
4. Name: `Schema.org full rollout v1.1`
5. Description: `26 schema.org tags + 24 triggers + 1 JS variable + 11 constants (includes JobPosting)`
6. **Create**

Working in a fresh workspace lets you build the entire set without affecting the live container until you publish.

## Step B2 — Create the 1 Custom JavaScript Variable (3 min) — REQUIRED

GTM → left sidebar → **Variables** → scroll to **User-Defined Variables** → **New**.

1. Top: name → `js.og.image.or.fallback`
2. **Variable Configuration** pencil → pick **Custom JavaScript**
3. Paste this exact code:

```js
function() {
  var meta = document.querySelector('meta[property="og:image"]');
  if (meta && meta.getAttribute('content')) {
    return meta.getAttribute('content');
  }
  return 'https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg';
}
```

4. **Save**

**This variable must exist before any tag referencing it fires**, or those tags emit broken JSON-LD with a literal `{{js.og.image.or.fallback}}` string as the image URL.

## Step B3 — Create 11 GTM Constants (5 min — optional but recommended)

For each row below: **Variables → User-Defined → New** → **Constant** → set name and value → **Save**.

| Variable name | Value |
|---|---|
| `const.site.url` | `https://www.kolmekampusta.fi` |
| `const.org.id` | `https://www.kolmekampusta.fi/#organization` |
| `const.website.id` | `https://www.kolmekampusta.fi/#website` |
| `const.org.name` | `Kolmen kampuksen urheiluopisto` |
| `const.org.legalName` | `Kolmen kampuksen urheiluopisto Oy` |
| `const.org.taxID` | `3250102-9` |
| `const.org.logo` | `https://www.kolmekampusta.fi/themes/custom/druidxp_demo_olivero/logo.svg` |
| `const.org.email.general` | `info@kolmekampusta.fi` |
| `const.site.image.fallback` | `https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg` |
| `const.willba.pajulahti` | `https://kolmekampusta.willba.store/en?locationId=1` |
| `const.willba.kisakallio` | `https://kolmekampusta.willba.store/?locationId=34` |

The current tag bodies hardcode values, so these constants are documentation only. Skip if you want to move faster — you can add them later.

## Step B4 — Create 24 GTM Triggers (15 min)

GTM → left sidebar → **Triggers** → for each row: **New** → set name and type and condition → **Save**.

### 3 sitewide triggers

| Name | Type | Conditions |
|---|---|---|
| `All Pages — Page View` | **Page View** | All Page Views (default) |
| `All Pages — DOM Ready` | **DOM Ready** | All DOM Ready Events (default) |
| `All Pages — Window Loaded` | **Window Loaded** | All Window Loaded Events (default) |

### 20 URL-anchored Page View triggers

All are **Page View** type with **Some Page Views** → `Page Path` `matches RegEx` → paste the regex below.

| Name | RegEx |
|---|---|
| `Pajulahti Campus` | `/(pajulahden-kampus\|pajulahti-campus)$` |
| `Kisakallio Campus` | `/(kisakallion-kampus\|kisakallio-campus)$` |
| `Mäkelänrinne` | `/(makelanrinteen-kampus\|makelanrinne-campus\|helsingin-kampus)$` |
| `Pajulahti Accommodation` | `/(majoitus/pajulahti\|accommodation/pajulahti)$` |
| `Kisakallio Accommodation` | `/(majoitus/kisakallio\|accommodation/kisakallio)$` |
| `Lake Pool Pajulahti` | `/aktiviteetit/(lakepoolpajulahti\|lake-pool-pajulahti)$` |
| `Adventure Park` | `/aktiviteetit/(seikkailupuisto\|adventure-park)$` |
| `Swimming Hall` | `/aktiviteetit/pajulahden-uimahalli$` |
| `TAITO 360` | `/urheilun-palvelut/taito-360$` |
| `Recovery Center` | `/urheilun-palvelut/(pajulahden-palautumiskeskus\|pajulahti-recovery-center)$` |
| `Sporttipassi` | `/aktiviteetit/(kisakallion-sporttipassi\|kisakallio-sport-pass)$` |
| `Kisakallio Sauna` | `/aktiviteetit/(kisakallion-rantasauna\|kisakallio-beach-sauna)$` |
| `Altitude Training` | `/urheilun-palvelut/(korkeanpaikan-harjoittelu\|high-altitude-training)$` |
| `Testing Services` | `/urheilun-palvelut/(testauspalvelut\|testing-services)$` |
| `Equipment Rental` | `/aktiviteetit/(valine-ja-kenttavuokraus\|equipment-and-field-rental)$` |
| `Restaurants` | `/(ravintolapalvelut\|restaurant-services)$` |
| `Vocational Education` | `/koulutus/koulutukset/ammatillinen-koulutus$` |
| `Apprenticeship` | `/koulutus/koulutukset/oppisopimuskoulutus$` |
| `Continuing Education` | `/koulutus/koulutukset/taydennyskoulutus$` |
| `Liberal Adult Education` | `/koulutus/koulutukset/vapaan-sivistystyon-koulutus$` |

### 1 URL-anchored DOM Ready trigger

This trigger is **DOM Ready** (not Page View), because Tag 24 needs the DOM populated to read job details from it.

| Name | Type | Conditions |
|---|---|---|
| `Avoimet työpaikat (per-job)` | **DOM Ready** | Some DOM Ready Events → `Page Path` `matches RegEx` → `^/fi/meista/avoimet-tyopaikat/[^/]+/?$` |

The regex matches `/fi/meista/avoimet-tyopaikat/{anything}` but NOT the index page `/fi/meista/avoimet-tyopaikat`.

After creating: verify **24 total triggers** in the Triggers list.

## Step B5 — Create 26 Tags (50–65 min)

For each tag below:

1. GTM → **Tags → New**
2. **Tag Configuration** pencil → **Custom HTML**
3. **HTML** field: open the local file from `D:\code_projects\schema-ld-json\tags\<filename>` → copy entire file content (including `<script>` open and close tags) → paste into HTML field
4. **Triggering** pencil → select the trigger from table
5. **Advanced Settings → Consent Settings → Not set** changes to → **No additional consent required**
6. Top: tag name (exact)
7. **Save**

| # | Tag name | File | Trigger |
|---|---|---|---|
| 1 | `Schema — Tag 1 — Organization` | `tags/tag-01-organization.html` | `All Pages — Page View` |
| 2 | `Schema — Tag 2 — WebSite` | `tags/tag-02-website.html` | `All Pages — Page View` |
| 3 | `Schema — Tag 3 — Pajulahti Campus` | `tags/tag-03-pajulahti-campus.html` | `Pajulahti Campus` |
| 3a | `Schema — Tag 3a — Pajulahti Accommodation` | `tags/tag-03a-pajulahti-accommodation.html` | `Pajulahti Accommodation` |
| 4 | `Schema — Tag 4 — Kisakallio Campus` | `tags/tag-04-kisakallio-campus.html` | `Kisakallio Campus` |
| 4a | `Schema — Tag 4a — Kisakallio Accommodation` | `tags/tag-04a-kisakallio-accommodation.html` | `Kisakallio Accommodation` |
| 5 | `Schema — Tag 5 — Mäkelänrinne` | `tags/tag-05-makelanrinne.html` | `Mäkelänrinne` |
| 6 | `Schema — Tag 6 — Smart Content` | `tags/tag-06-smart-content.html` | `All Pages — DOM Ready` |
| 7 | `Schema — Tag 7 — Smart Section` | `tags/tag-07-smart-section.html` | `All Pages — DOM Ready` |
| 8 | `Schema — Tag 8 — Debug` | `tags/tag-08-debug.html` | `All Pages — Window Loaded` |
| 9 | `Schema — Tag 9 — Lake Pool` | `tags/tag-09-lake-pool.html` | `Lake Pool Pajulahti` |
| 10 | `Schema — Tag 10 — Adventure Park` | `tags/tag-10-adventure-park.html` | `Adventure Park` |
| 11 | `Schema — Tag 11 — Swimming Hall` | `tags/tag-11-swimming-hall.html` | `Swimming Hall` |
| 12 | `Schema — Tag 12 — TAITO 360` | `tags/tag-12-taito-360.html` | `TAITO 360` |
| 13 | `Schema — Tag 13 — Recovery Center` | `tags/tag-13-recovery-center.html` | `Recovery Center` |
| 14 | `Schema — Tag 14 — Sporttipassi` | `tags/tag-14-sporttipassi.html` | `Sporttipassi` |
| 15 | `Schema — Tag 15 — Kisakallio Sauna` | `tags/tag-15-kisakallio-sauna.html` | `Kisakallio Sauna` |
| 16 | `Schema — Tag 16 — Altitude Training` | `tags/tag-16-altitude-training.html` | `Altitude Training` |
| 17 | `Schema — Tag 17 — Testing Services` | `tags/tag-17-testing-services.html` | `Testing Services` |
| 18 | `Schema — Tag 18 — Equipment Rental` | `tags/tag-18-equipment-rental.html` | `Equipment Rental` |
| 19 | `Schema — Tag 19 — Restaurants` | `tags/tag-19-restaurants.html` | `Restaurants` |
| 20 | `Schema — Tag 20 — Vocational Education` | `tags/tag-20-vocational-education.html` | `Vocational Education` |
| 21 | `Schema — Tag 21 — Apprenticeship` | `tags/tag-21-apprenticeship.html` | `Apprenticeship` |
| 22 | `Schema — Tag 22 — Continuing Education` | `tags/tag-22-continuing-education.html` | `Continuing Education` |
| 23 | `Schema — Tag 23 — Liberal Adult Education` | `tags/tag-23-liberal-adult-education.html` | `Liberal Adult Education` |
| 24 | `Schema — Tag 24 — JobPosting` | `tags/tag-24-jobposting.html` | `Avoimet työpaikat (per-job)` |

Tip: GTM has a **Save and continue** shortcut, but if it doesn't appear, just **Save** then **Tags → New** for the next one.

## Step B6 — Sanity check workspace state (2 min)

In GTM workspace, verify:
- **Variables → User-Defined**: 1 Custom JavaScript + 11 Constants = 12 total (or just 1 if you skipped constants)
- **Triggers**: 24 total
- **Tags**: 26 total — all named `Schema — Tag X — Name`, all set to Custom HTML, all with consent "No additional consent required"

---

# PHASE C — Preview testing (30 min)

## Step C1 — Enter Preview Mode

GTM workspace → top right → **Preview** button (blue). Tag Assistant tab opens automatically.

In Tag Assistant: enter `https://www.kolmekampusta.fi/fi` → click **Connect**. A new browser tab opens with the live homepage in debug mode.

## Step C2 — Test 14 representative URLs

For each URL below:

1. In the debug-mode browser tab, type the URL and press Enter
2. Wait for page to load (~2-3s)
3. Switch to **Tag Assistant** tab
4. Click the most recent event in the left rail (typically `Window Loaded` since that's when all tags including Tag 8 have fired)
5. Under **Tags Fired**, verify all expected tags fired
6. Click each fired tag to inspect — confirm there are no errors and the emitted HTML looks right

| # | Test URL | Tags expected to fire |
|---|---|---|
| 1 | `https://www.kolmekampusta.fi/fi` | 1, 2, 6 (WebPage with fallback image), 8 |
| 2 | `https://www.kolmekampusta.fi/fi/pajulahden-kampus` | 1, 2, 3, 6 (WebPage), 8 |
| 3 | `https://www.kolmekampusta.fi/fi/kisakallion-kampus` | 1, 2, 4, 6, 8 |
| 4 | `https://www.kolmekampusta.fi/fi/makelanrinteen-kampus` | 1, 2, 5, 6, 8 |
| 5 | `https://www.kolmekampusta.fi/fi/majoitus/pajulahti` | 1, 2, 3a, 6, 8 |
| 6 | `https://www.kolmekampusta.fi/fi/majoitus/kisakallio` | 1, 2, 4a, 6, 8 |
| 7 | `https://www.kolmekampusta.fi/fi/artikkelit/koe-rippikoulu-urheilun-ytimessa` | 1, 2, 6 (Article), 8 |
| 8 | `https://www.kolmekampusta.fi/fi/uutiset/2026-04/midsummer-dog-sports-festival-2026-majoitusvaraukset-ovat-nyt-avoinna` | 1, 2, 6 (NewsArticle), 8 |
| 9 | `https://www.kolmekampusta.fi/fi/blogi/2025-08/kestavaa-hyvinvointia` | 1, 2, 6 (BlogPosting), 8 |
| 10 | `https://www.kolmekampusta.fi/fi/tapahtumat/guttman-games-2026` | 1, 2, 6 (SportsEvent), 8 |
| 11 | `https://www.kolmekampusta.fi/fi/meista/yhteystiedot` | 1, 2, 6, 7 (ContactPage), 8 |
| 12 | `https://www.kolmekampusta.fi/fi/ravintolapalvelut` | 1, 2, 6, 19, 8 |
| 13 | `https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/lakepoolpajulahti` | 1, 2, 6, 7 (TouristAttraction), 9, 8 |
| 14 | `https://www.kolmekampusta.fi/fi/meista/avoimet-tyopaikat/{any-open-job-slug}` | 1, 2, 6, 8, 24 (JobPosting) — only fires when an actual job page is open; substitute current job slug |

**Important for Tag 24:** Also test the index page `https://www.kolmekampusta.fi/fi/meista/avoimet-tyopaikat` and confirm Tag 24 does **NOT** fire there (only on per-job sub-pages).

## Step C3 — Browser DevTools verification

For 3–5 of the URLs above (especially homepage + a campus + an event + a restaurant):

1. In the debug-mode browser tab, open **DevTools** (F12)
2. **Console** tab → look for `[Schema.org]` group from Tag 8 — verify it lists all expected blocks
3. **Elements** tab → press Ctrl+F → search `application/ld+json` → scroll through the matches in `<head>`

For tags using `{{js.og.image.or.fallback}}`: confirm the `image` field shows a real URL (the page's actual og:image), NOT the literal `{{js.og.image.or.fallback}}` string. If it shows the literal string, the GTM variable isn't working — check that you created it in Step B2.

For the event page test (`/fi/tapahtumat/guttman-games-2026`): in DevTools, find Tag 6's emitted SportsEvent block. Verify:
- `startDate`: `2026-08-17`
- `endDate`: `2026-08-24`
- `location` resolves to the Pajulahti @id

## Step C4 — Fix any failures

If a tag didn't fire when expected, check:
- Trigger regex — does it match the URL exactly?
- Trigger anchored with `$` — does the URL have a trailing slash that broke the match?
- Tag is enabled (not paused)?
- Tag's HTML field is correct (re-paste from local file if unsure)

If a tag fired but emitted broken JSON, re-paste the tag body from the local file.

When all 14 URLs test cleanly, proceed.

---

# PHASE D — Publish to production (5 min)

## Step D1 — Exit Preview

Click the **×** on the orange "Preview" indicator in the GTM workspace toolbar, OR just close the Preview tab.

## Step D2 — Submit + Publish

1. GTM workspace → top right → **Submit** button (blue)
2. **Submission Configuration** screen:
   - **Version Name**: `v1.1 — Complete schema.org coverage (26 tags, includes JobPosting)`
   - **Version Description** (multiline OK):
     ```
     Adds Organization, WebSite, 3 campus + 2 accommodation, 11 facility, 3-restaurant @graph, 4 education program, and JobPosting auto-extract (Google for Jobs). Plus dynamic image dispatching via og:image variable. All compliant with audit findings.
     ```
   - Leave "Environment to publish to" as **Live** (default)
3. **Publish**

GTM creates a version snapshot and pushes to live CDN. Propagation: ~1 minute.

## Step D3 — Note the version number

After publish, the workspace returns to a clean state and the **Versions** tab shows the new version. Note the version number (e.g., "Version 47") in case rollback is needed.

---

# PHASE E — Live verification (10 min)

## Step E1 — Verify in private browser window

Open a **private/incognito window** (no extensions, no cached cookies):

For each of these 5 spot-check URLs, verify Tag 8's console group appears with expected blocks:

| URL | Console should show |
|---|---|
| `/fi` | 3 blocks: Organization, WebSite, WebPage |
| `/fi/pajulahden-kampus` | 5 blocks: Organization, WebSite, Pajulahti @graph (2 entities counted as 1 block), WebPage, BreadcrumbList |
| `/fi/majoitus/pajulahti` | 5 blocks: Organization, WebSite, Hotel/Resort, WebPage, BreadcrumbList |
| `/fi/tapahtumat/[any-event]` | 4 blocks: Organization, WebSite, SportsEvent, BreadcrumbList |
| `/fi/ravintolapalvelut` | 5 blocks: Organization, WebSite, Restaurant @graph, WebPage, BreadcrumbList |

## Step E2 — Rich Results Test on live URLs (5 min)

Open [search.google.com/test/rich-results](https://search.google.com/test/rich-results) in **URL mode** (not Code mode).

Test these 5 live URLs:

| URL | Expected detected items |
|---|---|
| `https://www.kolmekampusta.fi/fi` | Logo + Organization |
| `https://www.kolmekampusta.fi/fi/pajulahden-kampus` | Local business + Organization |
| `https://www.kolmekampusta.fi/fi/majoitus/pajulahti` | Hotel + Local business |
| `https://www.kolmekampusta.fi/fi/artikkelit/koe-rippikoulu-urheilun-ytimessa` | Article |
| `https://www.kolmekampusta.fi/fi/ravintolapalvelut` | 3× Restaurant / Local business |

If any test shows 0 items or errors, stop and diagnose. Most likely cause: tag didn't fire because GTM hadn't yet propagated. Wait 5 more minutes and retest.

---

# PHASE F — Google Search Console indexing (15 min)

This phase pushes the new schema into Google's priority crawl queue so changes appear in search results faster than waiting for organic re-crawls.

## Step F1 — Open Search Console

[search.google.com/search-console](https://search.google.com/search-console)

Select property: `kolmekampusta.fi` (or `https://www.kolmekampusta.fi/` — pick whichever you own).

## Step F2 — Request indexing for 12 representative URLs

For each URL in this list:

1. Top search bar → paste URL → press Enter (this triggers URL Inspection)
2. Wait for current status to load
3. Click **Test Live URL** (top right)
4. Wait ~30s for test to complete
5. Click **Request Indexing**
6. Wait for the "Indexing requested" confirmation (~10s)
7. Close inspection, paste next URL

| # | URL | Reason |
|---|---|---|
| 1 | `https://www.kolmekampusta.fi/fi` | Homepage — entry point for org schema |
| 2 | `https://www.kolmekampusta.fi/fi/pajulahden-kampus` | Pajulahti campus rich entity |
| 3 | `https://www.kolmekampusta.fi/fi/kisakallion-kampus` | Kisakallio campus |
| 4 | `https://www.kolmekampusta.fi/fi/makelanrinteen-kampus` | Mäkelänrinne campus |
| 5 | `https://www.kolmekampusta.fi/fi/majoitus/pajulahti` | Hotel entity |
| 6 | `https://www.kolmekampusta.fi/fi/majoitus/kisakallio` | Hotel entity |
| 7 | `https://www.kolmekampusta.fi/fi/ravintolapalvelut` | 3-restaurant @graph |
| 8 | `https://www.kolmekampusta.fi/fi/artikkelit/koe-rippikoulu-urheilun-ytimessa` | Article rich result |
| 9 | `https://www.kolmekampusta.fi/fi/uutiset/2026-04/midsummer-dog-sports-festival-2026-majoitusvaraukset-ovat-nyt-avoinna` | NewsArticle |
| 10 | `https://www.kolmekampusta.fi/fi/blogi/2025-08/kestavaa-hyvinvointia` | BlogPosting |
| 11 | `https://www.kolmekampusta.fi/fi/tapahtumat/guttman-games-2026` | SportsEvent |
| 12 | `https://www.kolmekampusta.fi/fi/koulutus/koulutukset/ammatillinen-koulutus` | EducationalOccupationalProgram |

After all 12: there's a daily quota (~10/day per property — Google may rate-limit). If hit, wait until the next day and continue.

## Step F3 — (Optional) Submit/refresh sitemap

If you have a sitemap.xml (Drupal usually generates one at `/sitemap.xml`):

1. Search Console → left sidebar → **Sitemaps**
2. Enter `sitemap.xml` → **Submit**

This isn't strictly necessary since Google already knows your URLs, but it's a small extra signal.

---

# PHASE G — Monitoring (passive, 1–8 weeks)

## Step G1 — Daily for first week

- Search Console → **Coverage** report — check for any new "Errors" entries
- Search Console → **Enhancements** report — watch for new types appearing:
  - "Logo" (within 1–2 days)
  - "Organization" (within 1–2 days)
  - "Sitelinks searchbox" — won't appear (deprecated)
  - "Local business" (within 1 week)
  - "Hotel" (informational only; may take longer)
  - "Article" (within 1–2 days for crawled article pages)
  - "Restaurant" (within 1 week)
  - "Breadcrumbs" (should already be present from Drupal Metatag)
  - "Event" (within 1 week)

## Step G2 — Weekly for first month

- Same as daily — but also check **Performance** report
- Look at CTR (click-through rate) for the URLs you requested indexing on — comparing the week before publish vs the week after

## Step G3 — Monthly thereafter

- **Enhancements** report — any new error types?
- **Coverage** report — any new "Not indexed" entries?
- **Performance** report — overall trends

---

# PHASE H — Troubleshooting

## Issue: Tag fires but emits broken JSON-LD with `{{js.og.image.or.fallback}}` visible

**Cause**: GTM Custom JavaScript variable `js.og.image.or.fallback` doesn't exist OR has a syntax error.

**Fix**: GTM → Variables → User-Defined → confirm variable exists with the exact name and exact code from Phase B2.

## Issue: Tag doesn't fire on expected URL

**Causes**:
1. Trigger regex doesn't match — test with Search Console URL Inspection or browser DevTools `location.pathname.match(REGEX)`
2. Tag is paused — Tags → tag → Pause toggle
3. Triggering rule references the wrong trigger — Tags → tag → Triggering → re-select

## Issue: Validator throws unexpected error

**Process**:
1. Check it's not a known acceptable warning (Tag 1 sport warnings, missing image URL on var-using tag, etc.)
2. If genuinely new: capture the exact error text + tag affected
3. Report back — fix in `gtm-tags-production.md` AND `tags/<file>.html` atomically, then re-deploy

## Issue: Rate-limited by Google during URL Inspection

Wait 24 hours and resume from where you left off. Google's quota resets daily.

## Issue: Search Console shows the new schema but no rich results appear in actual search

**Reality check**:
- Rich results take 2–8 weeks to appear in actual SERPs after Google detects them
- Some types (Education, Hotel without Booking Network) never get rich results, only Knowledge Graph entries
- Schema is one of many signals — content quality, page speed, links also matter

---

# PHASE I — Rollback procedure (if needed)

If something breaks live and you need to revert immediately:

1. GTM → top → **Versions** tab
2. Find the previous version (the one before your `v1.1 — Complete schema.org coverage (26 tags, includes JobPosting)`)
3. Right side → **⋮ More** → **Publish to environment** → **Live**
4. Confirm

This reverts the live container to the previous version within ~1 minute. Your changes remain in the workspace; you can fix and re-publish.

For more granular rollback (e.g., disable just one broken tag without reverting the whole release):

1. GTM → Tags → find the tag → click **Pause**
2. Submit + Publish (this creates a new version with that tag paused, but everything else live)

---

# Appendix — Why Tag 8 (Debug) stays in production

Tag 8 logs schema info to the browser console — `[Schema.org] Found N JSON-LD block(s) on this page` followed by each block's `@type` and `@id`. Adds zero user-facing impact (console only) but enormously simplifies ongoing diagnostics.

You can disable it after 4–8 weeks once you're confident in the deployment. To disable: Tags → Tag 8 → Pause → Submit + Publish.

---

# Appendix — When to add new tags

Add a new schema tag when:
- A new content type appears in Drupal (e.g., podcast, case study)
- A new physical facility opens (e.g., new Pajulahti building)
- A new restaurant opens
- A new education program is launched
- A new permanent service is added (e.g., physiotherapy clinic)

Don't add a new tag for:
- One-off promotional pages
- Test/sandbox content
- Pages that already inherit a relevant schema from a parent tag

**Process** for adding a new tag:
1. Open `gtm-tags-production.md` and write the new tag body following the existing patterns
2. Create matching file `tags/tag-XX-name.html`
3. Add trigger to Triggers section
4. Validate in validator.schema.org
5. In GTM workspace: create trigger + tag, set consent, save
6. Preview test
7. Publish

Then update the `information-roundup.md` file with the new tag's information for future fact-checking.

---

# Quick reference — file map

| File | Purpose |
|---|---|
| `gtm-tags-production.md` | Master file — all tag bodies + variables + triggers + constants |
| `tags/tag-XX-name.html` | Per-tag files — ready to copy/paste into GTM |
| `tags/README.md` | Per-tag file index + GTM variable requirement note |
| `scripts/open-validator.py` | Validator.schema.org tab opener + clipboard helper |
| `scripts/open-rrt.py` | Rich Results Test tab opener + clipboard helper |
| `scripts/validate.py` | Playwright-based automation (use sparingly due to rate limits) |
| `scripts/README.md` | Scripts usage docs |
| `information-roundup.md` | Fact-check document — all data in plain English |
| `gtm-deployment-guide.md` | This document |
| `kolmekampusta-gtm-schema.md` | Original master plan (frozen, historical) |
| `kolmekampusta-gtm-schema-refined.md` | Audit + refinement record (historical) |

Always keep `gtm-tags-production.md` and the matching `/tags/*.html` files in sync. When one changes, the other must change too.
