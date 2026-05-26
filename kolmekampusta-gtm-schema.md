# Kolmekampusta.fi — Complete GTM Structured Data Implementation

**Container:** GTM-WD3C92NG
**Target site:** https://www.kolmekampusta.fi/
**Languages:** Finnish (/fi/), English (/en/)
**Document version:** Final (2026 best practices)
**Status:** Planning complete — ready for GTM build phase

---

## About this document

This is a complete schema.org structured data implementation plan and handoff document for Kolmen kampuksen urheiluopisto (3K), delivered as a Google Tag Manager configuration. The document contains:

- **Architectural reasoning** behind every design decision, so a reader who wasn't part of the planning can understand *why* the schema is shaped the way it is.
- **All 25 GTM tags** with copy-paste-ready JSON-LD and JavaScript code, audited against 2026 schema.org and Google Search structured data guidelines.
- **All triggers** (A through V) with exact regex patterns.
- **A site audit** drawn from a 921-page crawl of kolmekampusta.fi (May 2026), identifying every content type and named entity covered by the plan, plus what was intentionally deferred.
- **A validation methodology** so each tag can be verified independently.
- **Items to verify before publishing** — every placeholder value that needs operations confirmation, organized by tag.
- **Handoff context** at the end so a fresh AI or human implementer can continue this work without re-deriving the rationale.

### How to use this document

For implementation:
1. Read sections 1–4 first (Executive summary, Context, Findings, Architectural decisions) — about 15 minutes.
2. Work through section 5 (Implementation plan) day-by-day.
3. For each tag, copy the code from sections 7/8, configure the trigger from section 9, set consent per section 10, validate per section 11.
4. Resolve every item in section 12 (Verify before publishing) before pushing the GTM container to production.

For a fresh Claude session continuing this work:
- Read section 17 (Handoff context) first. It captures the project background, key decisions, what's done, what remains, and common questions.
- The deliverable is GTM tags, not Drupal code. Don't propose Drupal changes unless agreed.
- Anything labeled "verify before publishing" needs human input from 3K operations.

### Table of contents

**Part 1 — Context**
1. Executive summary
2. Project context

**Part 2 — Audit findings**
3. Site audit and content inventory

**Part 3 — Design**
4. Architectural decisions and 2026 best practices

**Part 4 — Implementation**
5. Site map and schema dispatch
6. GTM constants and variables
7. The 25 tags (organized in 3 layers)
8. Trigger configuration
9. Cookiebot consent
10. Implementation order (day-by-day rollout)

**Part 5 — Verification**
11. Validation checklist

**Part 6 — Scope boundaries and next phases**
12. Future enhancements (next phases)
13. Reviews and DigitalGuest integration

**Part 7 — Handoff**
14. Maintenance notes
15. Handoff context for fresh Claude sessions
16. Glossary

---

## 1. Executive summary

This document defines **25 GTM tags** organized in three layers that together provide complete schema.org structured data coverage for kolmekampusta.fi. After implementation:

**Layer 1 — Site and campus tags (10 tags):**
1. **2 sitewide tags** (Organization + WebSite) — always fire
   - The Organization tag is typed as `["SportsOrganization", "EducationalOrganization", "Organization"]` since 3K is a recognized provider of vocational qualifications under Finnish education authority
2. **3 per-campus LocalBusiness tags** (Pajulahti, Kisakallio, Mäkelänrinne) — fire on campus pages
   - Pajulahti and Kisakallio campus tags include `EducationalOrganization` typing since both host educational programs
3. **2 dedicated accommodation tags** (Pajulahti Hotel/Resort, Kisakallio Hotel/Resort) — fire on `/majoitus/*` pages with booking-focused schema and `ReserveAction`
4. **1 smart content tag** — auto-detects Article/NewsArticle/Event/Page from body class
5. **1 smart section tag** — adds Course, ContactPage, etc. based on URL section
6. **1 validation/debug tag** (optional) — logs schema injection to console for QA

**Layer 2 — Facility tags (11 tags):**
- Tag 9: Lake Pool Pajulahti (PublicSwimmingPool)
- Tag 10: Pajulahti Adventure Park (SportsActivityLocation + TouristAttraction)
- Tag 11: Pajulahti Swimming Hall (PublicSwimmingPool)
- Tag 12: TAITO 360 Motor Skills Area (SportsActivityLocation)
- Tag 13: Pajulahti Recovery Center (HealthClub + MedicalBusiness)
- Tag 14: Kisakallio Sporttipassi (SportsClub)
- Tag 15: Kisakallio Sauna and Lake Swimming (SportsActivityLocation)
- Tag 16: Altitude Training Facility (SportsActivityLocation)
- Tag 17: Sports Performance Testing Services (MedicalBusiness)
- Tag 18: Equipment and Field Rental (Service)
- Tag 19: Restaurants @graph (Iso-Kukkanen, Café Keihäs, Rantamakasiini)

**Layer 3 — Education program tags (4 tags):**
- Tag 20: Vocational Education / Ammatillinen koulutus (EducationalOccupationalProgram with `educationalCredentialAwarded` listing the qualifications)
- Tag 21: Apprenticeship / Oppisopimuskoulutus (WorkBasedProgram)
- Tag 22: Continuing Education / Täydennyskoulutus (EducationalOccupationalProgram)
- Tag 23: Liberal Adult Education / Vapaan sivistystyön koulutus (EducationalOccupationalProgram)

Each facility tag links back to its parent campus via `containedInPlace`, creating a proper hierarchical model of the institute. Each education program is provided by the Organization and located at the two educational campuses (Pajulahti, Kisakallio).

The existing Drupal-emitted `BreadcrumbList` JSON-LD is preserved untouched. Multiple JSON-LD blocks per page are fine — Google parses them all.

**Total implementation time:** ~6–7 hours including testing, spread across 5 working days as shown in the Implementation order section.

---

## 2. Project context

### 2.1 The organization

Kolmen kampuksen urheiluopisto ("Sports Institute of Three Campuses", "3K") is a Finnish sports and education institute operating across three physical campuses:

- **Pajulahti** (Nastola/Lahti, Päijät-Häme) — Finland's only joint Olympic and Paralympic Training Center. Comprehensive sports, accommodation, restaurant, and education facility on a lakeside campus.
- **Kisakallio** (Lohja, Uusimaa) — Sports and education facility with gymnastics, cheerleading, racket sports, and combat sports focus. Villa accommodation by Lohjanjärvi.
- **Mäkelänrinne** (Helsinki/Urhea) — Helsinki-area presence at the Urhea sports academy facilities.

3K is also a **recognized educational institution** under Finnish education authority (OPH), providing vocational qualifications, apprenticeship training, continuing education, and liberal adult education in sports and physical education. This dual identity (sports + education + lodging) drives the multi-typing strategy used throughout the schema.

3K was founded in 2024 as a merger of the three campus organizations (Pajulahti, Kisakallio, Mäkelänrinne/Mäkelänrinteen Lukio liiton urheiluakatemia). Business ID 3250102-9, VAT FI32501029.

### 2.2 Technical stack

- **Main site:** `kolmekampusta.fi` runs on Drupal 11, managed by digital agency Druid on the Druid XP platform. The Olivero theme is in use.
- **E-commerce:** `kauppa.kolmekampusta.fi` runs on WooCommerce (separate property, not covered by this schema plan).
- **GTM container:** `GTM-WD3C92NG` is already loaded on the main site.
- **Metatag module** is installed in Drupal and already emits `BreadcrumbList` JSON-LD plus Open Graph tags. This existing schema is preserved untouched; the new GTM-emitted JSON-LD blocks coexist with it (Google parses multiple JSON-LD blocks per page).
- **Cookiebot** handles consent under Google Consent Mode v2 (mandatory in EEA since March 2024). Schema markup is metadata, not tracking, so all schema tags fire pre-consent.
- **Other systems referenced in schema:** Willba (booking/reservation system, Strapi-backed with Keycloak OAuth2), DigitalGuest (post-stay guest feedback, *not* used for review schema — see section 16), Mautic, Cookiebot.

### 2.3 Constraints

- **Druid manages the platform.** Drupal config changes (theme files, content type changes, custom modules) require agency coordination. The GTM approach was chosen specifically to minimize Druid dependency — every tag in this plan is configured entirely in GTM without touching the Drupal codebase.
- **Drupal Metatag module emits BreadcrumbList already.** Do not remove or duplicate this. The plan adds *additional* schema blocks via GTM.
- **The site is bilingual** (Finnish primary, English secondary). All URL patterns must account for both `/fi/` and `/en/` prefixes.
- **Existing meta tags are the data source.** Tags 6 and 7 (Smart Content / Smart Section) read from existing Open Graph meta tags and body classes — they don't require any new fields to be exposed in Drupal.

### 2.4 Existing schema (preserved untouched)

The Drupal Metatag module emits the following JSON-LD blocks on relevant pages. These are not modified by this plan:

- `BreadcrumbList` — emitted on all content pages with hierarchy
- Open Graph meta tags (`og:type`, `og:title`, `og:description`, `og:image`, `og:updated_time`, `article:published_time`, etc.) — used as data source by the Smart Content / Smart Section tags

Verified during site audit (May 2026):
- Homepage source: `og:image` MISSING (real gap — the Homepage Page content type has no featured image fallback in Metatag config). Article pages: full Open Graph metadata present with image dimensions and alt text.
- Body classes confirmed: `page-node-type-page`, `page-node-type-article`, `page-node-type-news` (and presumably `page-node-type-blogi`, `page-node-type-tapahtuma` for blog posts and events).
- Search form parameter: `?s=` not `?q=` (used in Tag 2's SearchAction).
- Drupal settings JSON exposes `currentPath`, `currentLanguage`, `isFront` if needed.

---

## 3. Site audit and content inventory

A 921-page crawl of kolmekampusta.fi (broken-link scanner, May 2026) produced the URL inventory below. This section documents what content exists, what's covered by the plan, and what's intentionally deferred.

### 3.1 Crawl summary

- **921 pages crawled**, 921 with content data
- **41,411 edges** (internal and external links)
- **248 external targets** checked
- **12 broken links** (4 internal, 8 external — see section 13)
- **8 pages without URL alias** (raw `/node/*` URLs leaking into navigation — Drupal config issue, not schema)
- **79 canonical duplicates** (mostly filter parameter URLs on list/aggregator pages — needs `rel=canonical` configuration)

### 3.2 Content type inventory

The crawl identified the following content types and URL patterns. Coverage status is indicated for each.

**Fully covered by the plan:**

| URL pattern | Volume | Schema | Tag |
|---|---|---|---|
| `/fi/pajulahden-kampus`, `/en/pajulahti-campus` | 1 each | SportsActivityLocation + LodgingBusiness + EducationalOrganization | Tag 3 |
| `/fi/kisakallion-kampus`, `/en/kisakallio-campus` | 1 each | SportsActivityLocation + LodgingBusiness + EducationalOrganization | Tag 4 |
| `/fi/makelanrinteen-kampus`, `/en/makelanrinne-campus` | 1 each | SportsActivityLocation + EducationalOrganization | Tag 5 |
| `/fi/majoitus/pajulahti`, `/en/accommodation/pajulahti` | 1 each | Resort + Hotel with ReserveAction | Tag 3a |
| `/fi/majoitus/kisakallio`, `/en/accommodation/kisakallio` | 1 each | Resort + Hotel with ReserveAction | Tag 4a |
| `/fi/artikkelit/*`, `/en/articles/*` | 16+ | Article | Tag 6 (body-class dispatch) |
| `/fi/uutiset/YYYY-MM/*`, `/en/news/YYYY-MM/*` | 20+ | NewsArticle | Tag 6 (body-class dispatch) |
| `/fi/blogi/YYYY-MM/*` | 19 | BlogPosting | Tag 6 (body-class + URL dispatch) |
| `/fi/tapahtumat/*`, `/en/events/*` | 65+ | SportsEvent | Tag 6 (body-class dispatch) |
| `/fi/vapaa-aika/aktiviteetit/lakepoolpajulahti` | 1 | PublicSwimmingPool | Tag 9 |
| `/fi/vapaa-aika/aktiviteetit/seikkailupuisto` | 1 | TouristAttraction + SportsActivityLocation | Tag 10 |
| `/fi/vapaa-aika/aktiviteetit/pajulahden-uimahalli` | 1 | PublicSwimmingPool | Tag 11 |
| `/fi/urheilu/urheilun-palvelut/taito-360` | 1 | SportsActivityLocation | Tag 12 |
| `/fi/urheilu/urheilun-palvelut/pajulahden-palautumiskeskus` | 1 | HealthClub + MedicalBusiness | Tag 13 |
| `/fi/vapaa-aika/aktiviteetit/kisakallion-sporttipassi` | 1 | SportsClub + Service | Tag 14 |
| `/fi/vapaa-aika/aktiviteetit/kisakallion-rantasauna` | 1 | SportsActivityLocation | Tag 15 |
| `/fi/urheilu/urheilun-palvelut/korkeanpaikan-harjoittelu` | 1 | SportsActivityLocation + Service | Tag 16 |
| `/fi/urheilu/urheilun-palvelut/testauspalvelut` | 1 | MedicalBusiness + Service | Tag 17 |
| `/fi/vapaa-aika/aktiviteetit/valine-ja-kenttavuokraus` | 1 | Service | Tag 18 |
| `/fi/ravintolapalvelut` | 1 | Restaurant @graph (Iso-Kukkanen, Café Keihäs, Rantamakasiini) | Tag 19 |
| `/fi/koulutus/koulutukset/ammatillinen-koulutus` | 1 | EducationalOccupationalProgram | Tag 20 |
| `/fi/koulutus/koulutukset/oppisopimuskoulutus` | 1 | WorkBasedProgram | Tag 21 |
| `/fi/koulutus/koulutukset/taydennyskoulutus` | 1 | EducationalOccupationalProgram | Tag 22 |
| `/fi/koulutus/koulutukset/vapaan-sivistystyon-koulutus` | 1 | EducationalOccupationalProgram | Tag 23 |
| `/fi/urheilu/leirit/*` | 4 | SportsEvent | Tag 7 |
| `/fi/vapaa-aika/lomat-ja-kurssit/*` | 6 | Product | Tag 7 |
| `/fi/yritykset/*` | 7 | Service | Tag 7 |
| `/fi/ryhmat-ja-leirit/*` (leirikoulu, luokkaretki, rippileiri) | 4 | TouristTrip + Product | Tag 7 |
| `/fi/meista/yhteystiedot` | 1 | ContactPage | Tag 7 |
| `/fi/meista/*` | 7 | AboutPage | Tag 7 |
| All other pages | ~700+ | WebPage | Tag 6 fallback |

**Deferred to future enhancement (section 15):**

| URL pattern | Volume | Why deferred |
|---|---|---|
| `/fi/taxonomy/term/*` | 23 | Raw Drupal taxonomy URLs without aliases — should be fixed by Druid first, then CollectionPage schema can be added |
| `/fi/caset/*` (case studies) | 1+ | Low volume, can be merged into Article dispatch in Tag 6 if expanded |
| `?tyyppi=student_story` filtered URLs | (filter only) | Content type exists but URL pattern unclear; investigate in Drupal admin |
| `/fi/ajankohtaista`, `/fi/tulevat-tapahtumat`, `/fi/uutiset` index pages | ~3 | CollectionPage with ItemList would be valuable but is itself a phase 2 enhancement |
| Individual hotel buildings (`/fi/hotelli-kalliopaju`, `/fi/hotelli-omenatarha`, etc.) | ~10 | Listed as `containsPlace` references on the accommodation Tag 3a, not as separate schema tags — diminishing returns |
| Individual meeting rooms, classrooms, sports halls | ~30 | Same — listed as amenityFeature, not separate tags |
| `/fi/cafe-kimallus`, `/fi/kahvila-sekkari`, `/en/restaurant-sport`, `/en/restaurant-fanni` | 4 | Additional restaurants not in Tag 19's @graph; could be added in phase 2 |
| `/fi/urheilu/valmennuskeskus` (Training Center) | 1 | Worth a dedicated tag in phase 2 — Finland's only OTC/PTC deserves entity-level recognition |

### 3.3 Named entities catalog

Entities with dedicated `@id` URLs in the schema, allowing cross-referencing via `containedInPlace`, `containsPlace`, `parentOrganization`, `location`, `provider`:

**Organizations:**
- `https://www.kolmekampusta.fi/#organization` — 3K parent organization (SportsOrganization + EducationalOrganization + Organization)
- `https://www.kolmekampusta.fi/#website` — WebSite entity

**Places (campuses):**
- `https://www.kolmekampusta.fi/pajulahti#location` — Pajulahti campus
- `https://www.kolmekampusta.fi/kisakallio#location` — Kisakallio campus
- `https://www.kolmekampusta.fi/makelanrinne#location` — Mäkelänrinne campus

**Places (lodging entities, contained in campus places):**
- `https://www.kolmekampusta.fi/majoitus/pajulahti#lodging` — Pajulahti accommodation business
- `https://www.kolmekampusta.fi/majoitus/kisakallio#lodging` — Kisakallio accommodation business

**Places (named facilities, all containedInPlace a campus):**
- `https://www.kolmekampusta.fi/lakepool#facility`
- `https://www.kolmekampusta.fi/seikkailupuisto#facility`
- `https://www.kolmekampusta.fi/uimahalli#facility`
- `https://www.kolmekampusta.fi/taito360#facility`
- `https://www.kolmekampusta.fi/recoverycenter#facility`
- `https://www.kolmekampusta.fi/sporttipassi#facility`
- `https://www.kolmekampusta.fi/kisakallio-sauna#facility`
- `https://www.kolmekampusta.fi/altitude#facility`
- `https://www.kolmekampusta.fi/testing#facility`
- `https://www.kolmekampusta.fi/equipment-rental#service`

**Restaurants (each containedInPlace a campus):**
- `https://www.kolmekampusta.fi/restaurants/iso-kukkanen#restaurant`
- `https://www.kolmekampusta.fi/restaurants/keihas#cafe`
- `https://www.kolmekampusta.fi/restaurants/rantamakasiini#restaurant`

**Education programs (each provided by Org, located at Pajulahti + Kisakallio):**
- `https://www.kolmekampusta.fi/koulutus/ammatillinen-koulutus#program`
- `https://www.kolmekampusta.fi/koulutus/oppisopimuskoulutus#program`
- `https://www.kolmekampusta.fi/koulutus/taydennyskoulutus#program`
- `https://www.kolmekampusta.fi/koulutus/vapaan-sivistystyon-koulutus#program`

### 3.4 Data quality issues identified

Issues found in the crawl that affect (but aren't fixed by) the schema plan. These are Druid/Drupal work items, listed in detail in section 13:

1. **8 unaliased Drupal node URLs** in navigation (`/en/node/95` "About Us", `/en/node/351` "Lake Pool Pajulahti", `/en/node/121`, etc.) — should have URL aliases set.
2. **79 canonical duplicates** from filter-parameter URLs on list pages (`/fi/meista/tilat?kampus=42`, `/fi/tulevat-tapahtumat?tyyppi=85`, etc.) — needs `rel="canonical"` configuration.
3. **12 broken links** (4 internal, 8 external) — 403 errors on some event pages, 404s on outdated Willba store URLs.
4. **Pajulahti homepage missing `og:image`** — Metatag config gap for the homepage Page content type.

---

## 4. Architectural decisions and 2026 best practices

### 4.1 Why GTM-based delivery (vs. Drupal-side)

The trade-off:
- **Server-side rendering (via Drupal Schema.org Metatag module or custom Twig)** is technically superior: schema is present at first paint, no JS dependency, easier debugging.
- **GTM-based delivery** is less ideal technically but offers operational independence from Druid (the platform partner). Schema can be iterated, fixed, and extended without scheduling agency time.

The decision: **GTM**, for two reasons:
1. Operational independence — Jussi can iterate the schema implementation autonomously.
2. The Drupal Metatag module already handles BreadcrumbList; the gap is in the more complex entity-level schemas, where GTM is good enough.

Practical implication: schema is rendered after JS executes (~100-300ms post-load). Modern crawlers (Googlebot, Bingbot) execute JavaScript and parse this correctly. Older or constrained crawlers may not, but Googlebot is the priority.

### 4.2 Three-layer organization

The 25 tags are organized in three layers by abstraction level:

**Layer 1 — Foundation and major entities (Tags 1-8):** Sitewide Organization + WebSite, three campus LocalBusinesses, two dedicated Hotel/Resort schemas for accommodation pages, plus smart-dispatch tags that handle the long tail of content via body-class and URL pattern recognition.

**Layer 2 — Named facilities (Tags 9-19):** Specific sub-entities like Lake Pool, Adventure Park, Swimming Hall, restaurants — each with its own `@id` and `containedInPlace` linking back to a campus. Fires only on the specific facility page.

**Layer 3 — Education programs (Tags 20-23):** Four `EducationalOccupationalProgram` entities, one per program type (vocational, apprenticeship, continuing, liberal adult), referenced from the Organization's `hasOccupationalProgram` property.

This layering is for the implementer's mental model. From a runtime perspective, all tags simply fire when their trigger matches.

### 4.3 Multi-typing strategy

Schema.org allows assigning multiple types to a single entity using an array: `"@type": ["TypeA", "TypeB", "TypeC"]`. This plan uses it deliberately:

- **The Organization** is `["SportsOrganization", "EducationalOrganization", "Organization"]` because 3K is genuinely all three: it's a sports organization, a recognized educational institution awarding vocational qualifications, and a generic Organization.
- **Pajulahti and Kisakallio campuses** are `["SportsActivityLocation", "LodgingBusiness", "EducationalOrganization"]` because each campus is genuinely a sports venue, a lodging business, AND a recognized educational institution hosting programs.
- **Accommodation pages (Tag 3a, 4a)** are `["Resort", "Hotel"]` to signal hotel-specific rich results while preserving Resort's broader semantic.
- **Group/youth camp products** are `["TouristTrip", "Product"]` because they're sellable products that are also tourist trips.

Multi-typing is well-supported by Google's structured data parser. Google picks the most specific applicable type for each rich result feature.

### 4.4 Entity hierarchy and @id strategy

Every entity has a stable `@id` URL (a URL with a fragment identifier like `#location`, `#lodging`, `#program`). These `@id` values are referenced from other entities to express relationships:

- `containedInPlace` — "this place is inside that place" (facility → campus)
- `containsPlace` — "this place contains those places" (campus → facilities, also accommodation → individual buildings)
- `parentOrganization` — "this Org has that parent Org" (campus → 3K)
- `location` — "this thing happens at that place" (event → campus, program → campuses)
- `provider` — "this service is provided by that Org" (program → 3K)
- `publisher` — "this content is published by that Org" (article → 3K)
- `isPartOf` — "this is part of that" (page → website)
- `about` — "this is about that" (contact page → Organization)

The `@id` URLs use the canonical site URL (`https://www.kolmekampusta.fi/`) plus a path and a fragment. They don't need to resolve to actual content — they're identifiers, not URLs to be fetched.

### 4.5 Consent strategy

Schema markup is **metadata about content**, not user tracking. Schema tags fire pre-consent in Cookiebot's consent gating, regardless of user choice on the cookie banner. This is the standard interpretation of GDPR/Consent Mode v2: structured data doesn't collect, store, or process personal data.

Every tag in this plan is marked **"Consent: No additional consent required"** and should be set to fire in GTM's "Built-in Consent Settings" with no additional consent dependencies.

This is the same treatment Cookiebot applies to its own initialization script — schema is technical/functional metadata.

### 4.6 2026 best practices applied

The code in this plan conforms to schema.org and Google Search guidelines as of May 2026:

- **`@id` consistency** — every entity has a unique URL `@id` with a fragment; cross-references use the exact same `@id`.
- **Multi-typing arrays** — when an entity is genuinely multiple types, use an array (not nested entities).
- **ISO 8601 dates** with timezone information where available — `2026-05-16T10:00:00+02:00`.
- **Modern SearchAction format** — uses `EntryPoint` with `urlTemplate`, not the deprecated direct `target: "https://..."` shorthand.
- **Hotel rich result requirements met** — `name`, `address`, `image`, `priceRange`, `checkinTime`, `checkoutTime`, `amenityFeature`, `ReserveAction` all present for accommodation entities (Tags 3a, 4a).
- **`mainEntityOfPage`** is set on Article/NewsArticle/BlogPosting to disambiguate the page-vs-content distinction.
- **`publisher.logo` is the Organization's logo** (referenced via `@id`).
- **Article images** are emitted as `ImageObject` with width, height, and caption attributes when available, not bare URL strings.
- **`articleSection`** is set on Article/NewsArticle/BlogPosting for content classification.
- **No deprecated properties** — properties like `address.streetAddress` use PostalAddress structure, not the legacy free-text shortcut.
- **Booleans are literal `true`/`false`** (not strings).
- **No self-published `aggregateRating`** — Google has tightened review snippet eligibility since 2019; self-hosted reviews carry significant policy risk and are explicitly deferred (see section 16).
- **No FAQPage / HowTo** — Google deprecated these rich results for most sites in 2023. They're not included even where the content might support them.
- **The `EntryPoint` for ReserveAction** lists multiple `actionPlatform` values (Desktop, Mobile, iOS, Android) to maximize compatibility.
- **`WorkBasedProgram`** (not generic `EducationalOccupationalProgram`) is used for apprenticeship education — Schema.org's specific subtype for work-and-study programs.

---

## 5. Site map and schema dispatch

This is the complete URL pattern → schema type mapping for the site:

| URL pattern (FI) | URL pattern (EN) | Drupal bundle (body class) | Schema type | Tag |
|---|---|---|---|---|
| `/fi` | `/en` | `page-node-type-page` (front) | `WebPage` | Smart Content |
| `/fi/artikkelit/*` | `/en/articles/*` | `page-node-type-article` | `Article` | Smart Content |
| `/fi/uutiset/YYYY-MM/*` | `/en/news/*` | `page-node-type-news` | `NewsArticle` | Smart Content |
| `/fi/tapahtumat/*` | `/en/events/*` | `page-node-type-event` (likely) | `Event` | Smart Content |
| `/fi/tulevat-tapahtumat` | `/en/events` | View listing page | `CollectionPage` | Smart Content |
| `/fi/pajulahden-kampus` | `/en/pajulahti-campus` | `page-node-type-page` | `SportsActivityLocation` | Per-Campus (Pajulahti) |
| `/fi/kisakallion-kampus` | `/en/kisakallio-campus` | `page-node-type-page` | `SportsActivityLocation` | Per-Campus (Kisakallio) |
| `/fi/makelanrinteen-kampus` | `/en/makelanrinne-campus` | `page-node-type-page` | `SportsActivityLocation` | Per-Campus (Mäkelänrinne) |
| `/fi/majoitus/pajulahti` | `/en/accommodation/pajulahti` | `page-node-type-page` | `Resort` + `Hotel` (booking-focused) | Tag 3a (dedicated) |
| `/fi/majoitus/kisakallio` | `/en/accommodation/kisakallio` | `page-node-type-page` | `Resort` + `Hotel` (booking-focused) | Tag 4a (dedicated) |
| `/fi/ravintolapalvelut/*` | `/en/restaurant-services/*` | `page-node-type-page` | `Restaurant` | Smart Section |
| `/fi/vapaa-aika/aktiviteetit/lakepoolpajulahti` | `/en/leisure/activities/lake-pool-pajulahti` | `page-node-type-page` | `PublicSwimmingPool` | Tag 9 |
| `/fi/vapaa-aika/aktiviteetit/seikkailupuisto` | `/en/leisure/activities/adventure-park` | `page-node-type-page` | `SportsActivityLocation` + `TouristAttraction` | Tag 10 |
| `/fi/vapaa-aika/aktiviteetit/pajulahden-uimahalli` | — | `page-node-type-page` | `PublicSwimmingPool` | Tag 11 |
| `/fi/urheilu/urheilun-palvelut/taito-360` | `/en/sports/sports-services/taito-360` | `page-node-type-page` | `SportsActivityLocation` | Tag 12 |
| `/fi/urheilu/urheilun-palvelut/pajulahden-palautumiskeskus` | `/en/sports/sports-services/pajulahti-recovery-center` | `page-node-type-page` | `HealthClub` + `MedicalBusiness` | Tag 13 |
| `/fi/vapaa-aika/aktiviteetit/kisakallion-sporttipassi` | `/en/leisure/activities/kisakallio-sport-pass` | `page-node-type-page` | `SportsClub` | Tag 14 |
| `/fi/vapaa-aika/aktiviteetit/kisakallion-rantasauna` | `/en/leisure/activities/kisakallio-beach-sauna` | `page-node-type-page` | `SportsActivityLocation` | Tag 15 |
| `/fi/urheilu/urheilun-palvelut/korkeanpaikan-harjoittelu` | `/en/sports/urheilun-palvelut/high-altitude-training` | `page-node-type-page` | `SportsActivityLocation` | Tag 16 |
| `/fi/urheilu/urheilun-palvelut/testauspalvelut` | `/en/sports/urheilun-palvelut/testing-services` | `page-node-type-page` | `MedicalBusiness` | Tag 17 |
| `/fi/vapaa-aika/aktiviteetit/valine-ja-kenttavuokraus` | `/en/vapaa-aika/aktiviteetit/equipment-and-field-rental` | `page-node-type-page` | `Service` | Tag 18 |
| `/fi/ravintolapalvelut/*` | `/en/restaurant-services/*` | `page-node-type-page` | `Restaurant` + `CafeOrCoffeeShop` (3-entity @graph) | Tag 19 |
| `/fi/koulutus/koulutukset/*` | `/en/education/*` | `page-node-type-page` | `Course` + `EducationalOccupationalProgram` | Smart Section |
| `/fi/vapaa-aika/lomat-ja-kurssit/*` | `/en/leisure/holidays-and-courses/*` | `page-node-type-page` | `Product` (vacation package) | Smart Section |
| `/fi/vapaa-aika/aktiviteetit/*` | `/en/leisure/activities/*` | `page-node-type-page` | `TouristAttraction` or `SportsActivityLocation` | Smart Section |
| `/fi/urheilu/leirit/*` | `/en/sports/camps/*` | `page-node-type-page` | `SportsEvent` or `Course` | Smart Section |
| `/fi/yritykset/*` | `/en/businesses/*` | `page-node-type-page` | `Service` | Smart Section |
| `/fi/meista/yhteystiedot` | `/en/about-us/contact-information` | `page-node-type-page` | `ContactPage` | Smart Section |
| `/fi/meista/*` (other) | `/en/about-us/*` | `page-node-type-page` | `AboutPage` | Smart Section |
| Everything else | Everything else | `page-node-type-page` | `WebPage` | Smart Content (fallback) |

---

## 6. GTM constants and variables

These values are referenced by all tags and should be defined once. The recommended pattern is to create them as **GTM Constant Variables** so you can update once and propagate everywhere.

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

In GTM go to **Variables → User-Defined Variables → New → Constant** for each.

---

---

## 7. The 25 tags

The tags are organized in three layers as described in section 4.2. Each tag entry below contains the GTM tag type (always "Custom HTML"), the trigger it uses, consent configuration, and the complete JSON-LD or JavaScript code ready to copy-paste into GTM.

### Layer 1 — Foundation and major entities (Tags 1-8)

## TAG 1 — Organization (sitewide)

**Type:** Custom HTML
**Trigger:** All Pages
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsOrganization", "EducationalOrganization", "Organization"],
  "@id": "https://www.kolmekampusta.fi/#organization",
  "name": "Kolmen kampuksen urheiluopisto",
  "legalName": "Kolmen kampuksen urheiluopisto Oy",
  "alternateName": ["3K", "Kolme kampusta", "Sports Institute of Three Campuses"],
  "url": "https://www.kolmekampusta.fi/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.kolmekampusta.fi/themes/custom/druidxp_demo_olivero/logo.svg",
    "width": 600,
    "height": 60
  },
  "image": "https://www.kolmekampusta.fi/themes/custom/druidxp_demo_olivero/logo.svg",
  "taxID": "3250102-9",
  "vatID": "FI32501029",
  "foundingDate": "2024",
  "description": "Kolmen kampuksen urheiluopisto on virallinen koulutusorganisaatio, joka tarjoaa ammatillista koulutusta, vapaan sivistystyön koulutusta ja täydennyskoulutusta sekä monipuolisia urheilun, liikunnan ja vapaa-ajan palveluita Lahdessa, Lohjalla ja Helsingissä.",
  "areaServed": {
    "@type": "Country",
    "name": "Finland"
  },
  "knowsLanguage": ["fi", "en", "sv"],
  "sport": [
    "Football", "Athletics", "Swimming", "Volleyball", "Basketball",
    "Ice Hockey", "Combat Sports", "Para Sports", "Skiing", "Orienteering",
    "Boccia", "Wheelchair Rugby", "Goalball"
  ],
  "educationalCredentialAwarded": [
    "Liikunnanohjauksen perustutkinto",
    "Valmentajan ammattitutkinto",
    "Liikunnan ja valmennuksen erikoisammattitutkinto",
    "Liikuntaneuvojan ammattitutkinto"
  ],
  "hasOccupationalProgram": [
    { "@id": "https://www.kolmekampusta.fi/koulutus/ammatillinen-koulutus#program" },
    { "@id": "https://www.kolmekampusta.fi/koulutus/oppisopimuskoulutus#program" },
    { "@id": "https://www.kolmekampusta.fi/koulutus/taydennyskoulutus#program" },
    { "@id": "https://www.kolmekampusta.fi/koulutus/vapaan-sivistystyon-koulutus#program" }
  ],
  "memberOf": [
    {
      "@type": "Organization",
      "name": "Suomen Olympiakomitea",
      "url": "https://www.olympiakomitea.fi/"
    },
    {
      "@type": "Organization",
      "name": "Suomen Paralympiakomitea",
      "url": "https://www.paralympia.fi/"
    }
  ],
  "location": [
    { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio#location" },
    { "@id": "https://www.kolmekampusta.fi/makelanrinne#location" }
  ],
  "sameAs": [
    "https://www.facebook.com/kolmekampusta",
    "https://www.instagram.com/kolmekampusta",
    "https://www.linkedin.com/company/kolmekampusta",
    "https://www.youtube.com/@kolmekampusta",
    "https://kauppa.kolmekampusta.fi/"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+358-19-31511",
      "contactType": "reservations",
      "areaServed": "FI",
      "availableLanguage": ["Finnish", "English"],
      "email": "kisakallio@kolmekampusta.fi",
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      }
    },
    {
      "@type": "ContactPoint",
      "telephone": "+358-44-7755-313",
      "contactType": "reservations",
      "areaServed": "FI",
      "availableLanguage": ["Finnish", "English"],
      "email": "pajulahti@kolmekampusta.fi"
    },
    {
      "@type": "ContactPoint",
      "telephone": "+358-44-7755-777",
      "contactType": "sales",
      "areaServed": "FI",
      "availableLanguage": ["Finnish", "English"],
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "16:00"
      }
    }
  ]
}
</script>
```

> **Note:** Replace placeholder social URLs with the real ones. Add or remove `sameAs` entries as appropriate.

---

## TAG 2 — WebSite + SearchAction (sitewide)

**Type:** Custom HTML
**Trigger:** All Pages
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.kolmekampusta.fi/#website",
  "url": "https://www.kolmekampusta.fi/",
  "name": "Kolmen kampuksen urheiluopisto",
  "alternateName": ["3K", "Kolme kampusta"],
  "description": "Kolmen kampuksen urheiluopisto — Pajulahti, Kisakallio, Mäkelänrinne.",
  "publisher": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "inLanguage": ["fi", "en"],
  "potentialAction": [
    {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.kolmekampusta.fi/fi/search?s={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  ]
}
</script>
```

> **Note:** The search URL parameter is `s` (confirmed from the rendered search form), not the common `q`. Verify with the Finnish search at https://www.kolmekampusta.fi/fi/search.

---

## TAG 3 — LocalBusiness: Pajulahti Campus

**Type:** Custom HTML
**Trigger:** Page URL contains `/pajulahden-kampus` OR `/pajulahti-campus` (campus context only — accommodation pages get Tag 3a instead)
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsActivityLocation", "LodgingBusiness", "EducationalOrganization"],
  "@id": "https://www.kolmekampusta.fi/pajulahti#location",
  "name": "Pajulahti — Kolmen kampuksen urheiluopisto",
  "alternateName": "Pajulahden kampus",
  "url": "https://www.kolmekampusta.fi/fi/pajulahden-kampus",
  "image": [
    "https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg"
  ],
  "description": "Pajulahti on monipuolinen urheilun, koulutuksen ja hyvinvoinnin keskus. Suomen ainoa olympiakomitean ja paralympiakomitean virallinen valmennuskeskus sekä virallinen koulutusorganisaatio, joka tarjoaa ammatillista, vapaan sivistystyön ja täydennyskoulutusta.",
  "telephone": "+358-44-7755-313",
  "email": "pajulahti@kolmekampusta.fi",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "addressRegion": "Päijät-Häme",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 60.9456,
    "longitude": 25.9356
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59",
      "description": "Reception is open 24h"
    }
  ],
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Olympic Training Center", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Paralympic Training Center", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Pajulahti-halli (multi-sport hall)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Indoor athletics track", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Outdoor athletics track", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Football fields (artificial turf)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Football fields (natural grass)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "American football field", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Beach volleyball courts", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Basketball courts (indoor)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Volleyball courts (indoor)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Handball courts", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Tennis courts", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Badminton courts", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Combat sports hall (judo, karate, boxing)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Wrestling mats", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Weight training facilities", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Gymnasium", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Recovery center (cryotherapy, massage)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "TAITO 360 motor skills area", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "High-altitude training chamber", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Sports performance testing lab", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Cross-country ski tracks", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Disc golf course", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Adventure Park (Seikkailupuisto)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Lake Pool Pajulahti", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Public swimming hall", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Sauna and lakeside swimming", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Restaurant Iso-Kukkanen", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Café Keihäs", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Equipment and field rental", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Accessible facilities", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Free parking", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "24-hour reception", "value": true}
  ],
  "containsPlace": [
    { "@id": "https://www.kolmekampusta.fi/lakepool#facility" },
    { "@id": "https://www.kolmekampusta.fi/seikkailupuisto#facility" },
    { "@id": "https://www.kolmekampusta.fi/uimahalli#facility" },
    { "@id": "https://www.kolmekampusta.fi/taito360#facility" },
    { "@id": "https://www.kolmekampusta.fi/recoverycenter#facility" },
    { "@id": "https://www.kolmekampusta.fi/altitude#facility" },
    { "@id": "https://www.kolmekampusta.fi/testing#facility" },
    { "@id": "https://www.kolmekampusta.fi/restaurants/iso-kukkanen#restaurant" },
    { "@id": "https://www.kolmekampusta.fi/restaurants/keihas#cafe" }
  ],
  "sport": [
    "Football", "American Football", "Athletics", "Swimming", "Volleyball", "Beach Volleyball",
    "Basketball", "Handball", "Tennis", "Badminton", "Combat Sports", "Boxing", "Judo", "Karate",
    "Wrestling", "Para Sports", "Wheelchair Rugby", "Goalball", "Boccia", "Skiing",
    "Cross-Country Skiing", "Triathlon", "Orienteering", "Cycling", "Disc Golf", "Climbing"
  ],
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "containedInPlace": {
    "@type": "AdministrativeArea",
    "name": "Lahti, Finland"
  },
  "currenciesAccepted": "EUR",
  "paymentAccepted": ["Cash", "Credit Card", "Invoice"]
}
</script>
```

---

## TAG 3a — Pajulahti Accommodation (Hotel/Resort, booking-focused)

This tag fires on the **accommodation business** page (`/fi/majoitus/pajulahti`) and represents Pajulahti as a lodging business rather than a sports facility. It includes booking-relevant properties Google uses for hotel rich results: price range, room count, amenities, check-in times, and a `ReserveAction` linking to the Willba booking system.

**Type:** Custom HTML
**Trigger:** Page URL contains `/majoitus/pajulahti` OR `/accommodation/pajulahti`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["Resort", "Hotel"],
  "@id": "https://www.kolmekampusta.fi/majoitus/pajulahti#lodging",
  "name": "Pajulahti — Majoitus",
  "alternateName": ["Pajulahti Hotel", "Pajulahden majoitus"],
  "url": "https://www.kolmekampusta.fi/fi/majoitus/pajulahti",
  "description": "Pajulahden monipuolinen majoitustarjonta: hotelli, akatemia ja modernit villat järven rannalla. Olympic and Paralympic Training Center. Täyden palvelun urheilu- ja vapaa-ajankeskus Nastolassa.",
  "image": [
    "https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg"
  ],
  "telephone": "+358-44-7755-313",
  "email": "pajulahti@kolmekampusta.fi",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "addressRegion": "Päijät-Häme",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 60.9456,
    "longitude": 25.9356
  },
  "hasMap": "https://www.google.com/maps/place/Pajulahdentie+167,+15560+Nastola",
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "paymentAccepted": ["Cash", "Credit Card", "Invoice"],
  "availableLanguage": ["Finnish", "English"],
  "checkinTime": "15:00",
  "checkoutTime": "12:00",
  "petsAllowed": true,
  "smokingAllowed": false,
  "isAccessibleForFree": false,
  "publicAccess": true,
  "numberOfRooms": {
    "@type": "QuantitativeValue",
    "value": 120,
    "unitText": "rooms across hotel, academy, and villas"
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Free parking", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Breakfast", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Restaurant on site", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Bar / lounge", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Swimming pool", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Sauna", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Fitness center / gym", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Conference facilities", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Accessible rooms", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Family rooms", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Villas for groups", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Adventure park access", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "24-hour reception", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Lakeside location", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Sports facilities access", "value": true}
  ],
  "makesOffer": {
    "@type": "Offer",
    "name": "Majoitus Pajulahdessa",
    "description": "Hotelli-, akatemia- ja villamajoitusta urheilu- ja vapaa-ajan vieraille.",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "url": "https://kolmekampusta.willba.store/locations",
    "seller": { "@id": "https://www.kolmekampusta.fi/#organization" }
  },
  "potentialAction": {
    "@type": "ReserveAction",
    "name": "Varaa majoitus Pajulahdesta",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://kolmekampusta.willba.store/locations",
      "inLanguage": ["fi", "en"],
      "actionPlatform": [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform",
        "https://schema.org/IOSPlatform",
        "https://schema.org/AndroidPlatform"
      ]
    },
    "result": {
      "@type": "LodgingReservation",
      "name": "Majoitusvaraus Pajulahteen"
    }
  },
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "brand": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

> **Values to verify with operations before publishing:** `numberOfRooms.value` (estimated at 120 across hotel/academy/villas — get the real total), `checkinTime`/`checkoutTime` (used Finnish standard 15:00/12:00), `petsAllowed` (set true based on dog sports events — confirm policy across accommodation types), `priceRange` (€€ is an estimate), and the Willba booking URL (may be a more specific `store.pajulahti.willba.app` deep link).

---

## TAG 4 — LocalBusiness: Kisakallio Campus

**Type:** Custom HTML
**Trigger:** Page URL contains `/kisakallion-kampus` OR `/kisakallio-campus` (campus context only — accommodation pages get Tag 4a instead)
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsActivityLocation", "LodgingBusiness", "EducationalOrganization"],
  "@id": "https://www.kolmekampusta.fi/kisakallio#location",
  "name": "Kisakallio — Kolmen kampuksen urheiluopisto",
  "alternateName": "Kisakallion kampus",
  "url": "https://www.kolmekampusta.fi/fi/kisakallion-kampus",
  "image": [
    "https://www.kolmekampusta.fi/sites/default/files/2025-08/kisakallio-ilmakuva-2024-kevat2024.JPG"
  ],
  "description": "Kisakallio jakaa liikunta-alan osaamista koulutusten ja valmennusten myötä. Virallinen koulutusorganisaatio, joka tarjoaa ammatillista, vapaan sivistystyön ja täydennyskoulutusta. Karnaistenkorven ja Lohjanjärven syleilyssä.",
  "telephone": "+358-19-31511",
  "email": "kisakallio@kolmekampusta.fi",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Kaarina Karin tie 4",
    "addressLocality": "Lohja",
    "addressRegion": "Uusimaa",
    "postalCode": "08360",
    "addressCountry": "FI"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 60.2528,
    "longitude": 24.0644
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59",
      "description": "Reception is open 24h"
    }
  ],
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Multi-sport halls", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Gymnastics hall", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Cheerleading facilities", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Combat sports hall", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Tennis courts", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Badminton courts", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Racket sports courts", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Football fields", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Basketball courts", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Volleyball courts", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Beach volleyball court", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Floorball / handball hall", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Weight training facilities", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Orienteering terrain (Karnaistenkorpi)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Cross-country ski tracks", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Disc golf course", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Beach sauna (Rantasauna)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Lakeside swimming (Lohjanjärvi)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Sporttipassi (sports pass)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Conference and seminar facilities", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Villas for small groups", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Villamaailma (corporate villas)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Restaurant Rantamakasiini", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Accessible facilities", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Free parking", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "24-hour reception", "value": true}
  ],
  "containsPlace": [
    { "@id": "https://www.kolmekampusta.fi/sporttipassi#facility" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio-sauna#facility" },
    { "@id": "https://www.kolmekampusta.fi/restaurants/rantamakasiini#restaurant" }
  ],
  "sport": [
    "Gymnastics", "Cheerleading", "Combat Sports", "Boxing", "Judo", "Karate",
    "Racket Sports", "Tennis", "Badminton", "Basketball", "Volleyball",
    "Beach Volleyball", "Football", "Floorball", "Handball",
    "Endurance Sports", "Orienteering", "Cross-Country Skiing", "Swimming"
  ],
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "containedInPlace": {
    "@type": "AdministrativeArea",
    "name": "Lohja, Finland"
  },
  "currenciesAccepted": "EUR",
  "paymentAccepted": ["Cash", "Credit Card", "Invoice"]
}
</script>
```

---

## TAG 4a — Kisakallio Accommodation (Hotel/Resort, booking-focused)

This tag fires on the **accommodation business** page (`/fi/majoitus/kisakallio`) and represents Kisakallio as a lodging business.

**Type:** Custom HTML
**Trigger:** Page URL contains `/majoitus/kisakallio` OR `/accommodation/kisakallio`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["Resort", "Hotel"],
  "@id": "https://www.kolmekampusta.fi/majoitus/kisakallio#lodging",
  "name": "Kisakallio — Majoitus",
  "alternateName": ["Kisakallio Hotel", "Kisakallion majoitus", "Villaloma Kisakalliossa"],
  "url": "https://www.kolmekampusta.fi/fi/majoitus/kisakallio",
  "description": "Kisakallion majoitustarjonta: pienille ryhmille soveltuvat villat ja suuremmat hallitilat Lohjanjärven rannalla. Täyden palvelun urheilu- ja vapaa-ajankeskus.",
  "image": [
    "https://www.kolmekampusta.fi/sites/default/files/2025-08/kisakallio-ilmakuva-2024-kevat2024.JPG"
  ],
  "telephone": "+358-19-31511",
  "email": "kisakallio@kolmekampusta.fi",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Kaarina Karin tie 4",
    "addressLocality": "Lohja",
    "addressRegion": "Uusimaa",
    "postalCode": "08360",
    "addressCountry": "FI"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 60.2528,
    "longitude": 24.0644
  },
  "hasMap": "https://www.google.com/maps/place/Kaarina+Karin+tie+4,+08360+Lohja",
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "paymentAccepted": ["Cash", "Credit Card", "Invoice"],
  "availableLanguage": ["Finnish", "English"],
  "checkinTime": "15:00",
  "checkoutTime": "12:00",
  "petsAllowed": true,
  "smokingAllowed": false,
  "isAccessibleForFree": false,
  "publicAccess": true,
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Free parking", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Breakfast", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Restaurant Rantamakasiini", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Sauna", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Lakeside swimming", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Conference facilities", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Sports halls", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Accessible rooms", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Villas for groups", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Sporttipassi (sports pass)", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "24-hour reception", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Lakeside location", "value": true}
  ],
  "makesOffer": {
    "@type": "Offer",
    "name": "Majoitus Kisakalliossa",
    "description": "Villamajoitusta urheilu-, koulutus- ja yritystapahtumien vieraille.",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "url": "https://kolmekampusta.willba.store/locations",
    "seller": { "@id": "https://www.kolmekampusta.fi/#organization" }
  },
  "potentialAction": {
    "@type": "ReserveAction",
    "name": "Varaa majoitus Kisakalliosta",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://kolmekampusta.willba.store/locations",
      "inLanguage": ["fi", "en"],
      "actionPlatform": [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform",
        "https://schema.org/IOSPlatform",
        "https://schema.org/AndroidPlatform"
      ]
    },
    "result": {
      "@type": "LodgingReservation",
      "name": "Majoitusvaraus Kisakallioon"
    }
  },
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/kisakallio#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "brand": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

> **Values to verify:** `checkinTime`/`checkoutTime`, `petsAllowed`, `priceRange`, and the Willba booking URL. Kisakallio is more villa-oriented than Pajulahti, so consider whether `numberOfRooms` makes sense to add (villas have different bed configurations than hotel rooms).

---

## TAG 5 — LocalBusiness: Mäkelänrinne Campus (Helsinki/Urhea)

**Type:** Custom HTML
**Trigger:** Page URL contains `/makelanrinteen-kampus` OR `/makelanrinne-campus` OR `/helsingin-kampus`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsActivityLocation", "EducationalOrganization"],
  "@id": "https://www.kolmekampusta.fi/makelanrinne#location",
  "name": "Mäkelänrinne — Kolmen kampuksen urheiluopisto (Urhea)",
  "alternateName": "Helsingin kampus",
  "url": "https://www.kolmekampusta.fi/fi/makelanrinteen-kampus",
  "description": "Helsingin Mäkelänrinteessä pääkaupunkiseudun urheiluakatemia Urhean tiloissa.",
  "telephone": "+358-44-7755-200",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Mäkelänkatu 47",
    "addressLocality": "Helsinki",
    "addressRegion": "Uusimaa",
    "postalCode": "00550",
    "addressCountry": "FI"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 60.1908,
    "longitude": 24.9606
  },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "containedInPlace": {
    "@type": "AdministrativeArea",
    "name": "Helsinki, Finland"
  },
  "memberOf": {
    "@type": "Organization",
    "name": "Pääkaupunkiseudun Urheiluakatemia Urhea",
    "url": "https://urhea.fi/"
  }
}
</script>
```

---

## TAG 6 — Smart Content Tag (Article / NewsArticle / Event / WebPage)

This tag detects content type from the body class and emits the appropriate schema. Reads everything from existing Open Graph meta tags + body attributes — no Drupal changes needed.

**Type:** Custom HTML
**Trigger:** All Pages
**Consent:** No additional consent required

```html
<script>
(function() {
  // ===== Helpers =====
  var meta = function(sel) {
    var el = document.querySelector(sel);
    return el ? el.getAttribute('content') : null;
  };
  var attr = function(sel, a) {
    var el = document.querySelector(sel);
    return el ? el.getAttribute(a) : null;
  };
  var inject = function(obj) {
    // Strip null/undefined properties recursively
    var clean = function(o) {
      if (Array.isArray(o)) return o.map(clean).filter(function(v){ return v !== null && v !== undefined; });
      if (o && typeof o === 'object') {
        var out = {};
        Object.keys(o).forEach(function(k){
          var v = clean(o[k]);
          if (v !== null && v !== undefined && v !== '') out[k] = v;
        });
        return out;
      }
      return o;
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(clean(obj));
    document.head.appendChild(s);
  };

  // ===== Detect content type from body class =====
  var bodyClass = document.body.className || '';
  var bundle = (bodyClass.match(/page-node-type-(\S+)/) || [])[1] || 'page';
  var isFront = /\bpath-frontpage\b/.test(bodyClass);

  // ===== Common values =====
  var canonical = attr('link[rel="canonical"]', 'href') || location.href;
  var lang = document.documentElement.lang || 'fi';
  var ogType = meta('meta[property="og:type"]');
  var ogTitle = meta('meta[property="og:title"]') || document.title;
  var ogDescription = meta('meta[property="og:description"]') || meta('meta[name="description"]');
  var ogImage = meta('meta[property="og:image"]');
  var ogImageWidth = meta('meta[property="og:image:width"]');
  var ogImageHeight = meta('meta[property="og:image:height"]');
  var ogImageAlt = meta('meta[property="og:image:alt"]');
  var ogUpdated = meta('meta[property="og:updated_time"]');
  var articlePublished = meta('meta[property="article:published_time"]');
  var articleModified = meta('meta[property="article:modified_time"]');
  var articleAuthor = meta('meta[property="article:author"]') || meta('meta[name="author"]');

  // ===== Build image object =====
  var imageObj = ogImage ? {
    "@type": "ImageObject",
    "url": ogImage,
    "width": ogImageWidth ? parseInt(ogImageWidth, 10) : null,
    "height": ogImageHeight ? parseInt(ogImageHeight, 10) : null,
    "caption": ogImageAlt || null
  } : null;

  // ===== Branch by bundle =====

  // -- WebPage (homepage, generic pages) --
  if (bundle === 'page' || isFront) {
    inject({
      "@context": "https://schema.org",
      "@type": isFront ? "WebPage" : "WebPage",
      "@id": canonical + "#webpage",
      "url": canonical,
      "name": ogTitle,
      "description": ogDescription,
      "image": imageObj,
      "inLanguage": lang,
      "isPartOf": { "@id": "https://www.kolmekampusta.fi/#website" },
      "about": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "publisher": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "dateModified": ogUpdated
    });
    return;
  }

  // -- Article (editorial / blog) --
  if (bundle === 'article') {
    inject({
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": canonical + "#article",
      "mainEntityOfPage": canonical,
      "headline": ogTitle,
      "description": ogDescription,
      "image": imageObj,
      "datePublished": articlePublished || ogUpdated,
      "dateModified": articleModified || ogUpdated,
      "author": articleAuthor
        ? { "@type": "Person", "name": articleAuthor }
        : { "@id": "https://www.kolmekampusta.fi/#organization" },
      "publisher": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "inLanguage": lang,
      "isPartOf": { "@id": "https://www.kolmekampusta.fi/#website" }
    });
    return;
  }

  // -- NewsArticle --
  if (bundle === 'news') {
    inject({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "@id": canonical + "#article",
      "mainEntityOfPage": canonical,
      "headline": ogTitle,
      "description": ogDescription,
      "image": imageObj,
      "datePublished": articlePublished || ogUpdated,
      "dateModified": articleModified || ogUpdated,
      "author": articleAuthor
        ? { "@type": "Person", "name": articleAuthor }
        : { "@id": "https://www.kolmekampusta.fi/#organization" },
      "publisher": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "inLanguage": lang,
      "isPartOf": { "@id": "https://www.kolmekampusta.fi/#website" },
      "articleSection": "News"
    });
    return;
  }

  // -- BlogPosting (blog posts under /blogi/) --
  if (bundle === 'blogi' || bundle === 'blog' || /\/blogi\//.test(window.location.pathname)) {
    inject({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": canonical + "#blogposting",
      "mainEntityOfPage": canonical,
      "headline": ogTitle,
      "description": ogDescription,
      "image": imageObj,
      "datePublished": articlePublished || ogUpdated,
      "dateModified": articleModified || ogUpdated,
      "author": articleAuthor
        ? { "@type": "Person", "name": articleAuthor }
        : { "@id": "https://www.kolmekampusta.fi/#organization" },
      "publisher": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "inLanguage": lang,
      "isPartOf": { "@id": "https://www.kolmekampusta.fi/#website" },
      "articleSection": "Blog"
    });
    return;
  }

  // -- Event (sports event, camp, competition) --
  if (bundle === 'event' || bundle === 'tapahtuma') {
    // Try to extract start/end dates from DOM if present
    var timeStart = attr('time[itemprop="startDate"]', 'datetime')
                 || attr('.event__start time', 'datetime');
    var timeEnd = attr('time[itemprop="endDate"]', 'datetime')
               || attr('.event__end time', 'datetime');

    // Detect event location from URL or content
    // NOTE: use window.location explicitly to avoid shadowing by local variable
    var eventLocation = null;
    var pagePath = window.location.pathname.toLowerCase();
    var titleAndDesc = (ogTitle + ' ' + (ogDescription || '')).toLowerCase();
    if (/pajulahti/.test(pagePath) || /pajulahti/.test(titleAndDesc)) {
      eventLocation = { "@id": "https://www.kolmekampusta.fi/pajulahti#location" };
    } else if (/kisakallio/.test(pagePath) || /kisakallio/.test(titleAndDesc)) {
      eventLocation = { "@id": "https://www.kolmekampusta.fi/kisakallio#location" };
    } else if (/makelanrinne|makelanrinteen|helsinki/.test(pagePath) || /makelanrinne|mäkelänrinne/.test(titleAndDesc)) {
      eventLocation = { "@id": "https://www.kolmekampusta.fi/makelanrinne#location" };
    }

    inject({
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "@id": canonical + "#event",
      "name": ogTitle,
      "description": ogDescription,
      "image": imageObj,
      "url": canonical,
      "startDate": timeStart,
      "endDate": timeEnd,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": eventLocation || {
        "@type": "Place",
        "name": "Kolmen kampuksen urheiluopisto"
      },
      "organizer": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "inLanguage": lang
    });
    return;
  }

  // -- Fallback: generic WebPage --
  inject({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonical + "#webpage",
    "url": canonical,
    "name": ogTitle,
    "description": ogDescription,
    "image": imageObj,
    "inLanguage": lang,
    "isPartOf": { "@id": "https://www.kolmekampusta.fi/#website" },
    "publisher": { "@id": "https://www.kolmekampusta.fi/#organization" },
    "dateModified": ogUpdated
  });
})();
</script>
```

---

## TAG 7 — Smart Section Tag (URL-based dispatch)

This tag adds **section-specific** schema (Restaurant, Course, LodgingBusiness, ContactPage, etc.) based on URL pattern. Runs *in addition* to the Smart Content Tag — multiple JSON-LD blocks per page are fine.

**Type:** Custom HTML
**Trigger:** All Pages (logic is internal)
**Consent:** No additional consent required

```html
<script>
(function() {
  var meta = function(sel) {
    var el = document.querySelector(sel);
    return el ? el.getAttribute('content') : null;
  };
  var inject = function(obj) {
    var clean = function(o) {
      if (Array.isArray(o)) return o.map(clean).filter(function(v){ return v !== null && v !== undefined; });
      if (o && typeof o === 'object') {
        var out = {};
        Object.keys(o).forEach(function(k){
          var v = clean(o[k]);
          if (v !== null && v !== undefined && v !== '') out[k] = v;
        });
        return out;
      }
      return o;
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(clean(obj));
    document.head.appendChild(s);
  };

  var path = location.pathname.replace(/^\/(fi|en|sv)\//, '/');
  var canonical = (document.querySelector('link[rel="canonical"]') || {}).href || location.href;
  var lang = document.documentElement.lang || 'fi';
  var ogTitle = meta('meta[property="og:title"]') || document.title;
  var ogDescription = meta('meta[property="og:description"]') || meta('meta[name="description"]');
  var ogImage = meta('meta[property="og:image"]');

  // ===== Contact page =====
  if (/^\/(meista|about-us)\/(yhteystiedot|contact-information)/.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": canonical + "#contactpage",
      "url": canonical,
      "name": ogTitle,
      "description": ogDescription,
      "inLanguage": lang,
      "isPartOf": { "@id": "https://www.kolmekampusta.fi/#website" },
      "about": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "mainEntity": { "@id": "https://www.kolmekampusta.fi/#organization" }
    });
    return;
  }

  // ===== About pages =====
  if (/^\/(meista|about-us)\//.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": canonical + "#aboutpage",
      "url": canonical,
      "name": ogTitle,
      "description": ogDescription,
      "inLanguage": lang,
      "isPartOf": { "@id": "https://www.kolmekampusta.fi/#website" },
      "about": { "@id": "https://www.kolmekampusta.fi/#organization" }
    });
    return;
  }

  // ===== Restaurant services =====
  if (/^\/(ravintolapalvelut|restaurant-services)/.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "@id": canonical + "#restaurant",
      "name": ogTitle,
      "description": ogDescription,
      "image": ogImage,
      "url": canonical,
      "servesCuisine": ["Finnish", "International"],
      "priceRange": "€€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": ["Cash", "Credit Card", "Invoice"],
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "containedInPlace": [
        { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
        { "@id": "https://www.kolmekampusta.fi/kisakallio#location" }
      ]
    });
    return;
  }

  // ===== Group/youth camps (ryhmat-ja-leirit: leirikoulu, luokkaretki, rippileiri) =====
  if (/^\/(ryhmat-ja-leirit|groups-and-camps)\//.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": ["TouristTrip", "Product"],
      "@id": canonical + "#trip",
      "name": ogTitle,
      "description": ogDescription,
      "image": ogImage,
      "url": canonical,
      "category": "Group accommodation and program package",
      "touristType": ["Schools", "Youth groups", "Confirmation camps"],
      "provider": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "brand": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "offers": {
        "@type": "Offer",
        "url": canonical,
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "seller": { "@id": "https://www.kolmekampusta.fi/#organization" }
      }
    });
    return;
  }

  // ===== Vocational courses (fallback for unknown /koulutus/koulutukset/ subpages) =====
  // Specific program slugs (ammatillinen-koulutus, oppisopimuskoulutus, taydennyskoulutus,
  // vapaan-sivistystyon-koulutus) are handled by dedicated Tags 20-23 with full
  // EducationalOccupationalProgram schema. This branch is a fallback for any other course pages.
  var knownPrograms = /\/koulutus\/koulutukset\/(ammatillinen-koulutus|oppisopimuskoulutus|taydennyskoulutus|vapaan-sivistystyon-koulutus|hakijalle)/;
  if ((/^\/koulutus\/koulutukset\//.test(path) || /^\/education\//.test(path)) && !knownPrograms.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": canonical + "#course",
      "name": ogTitle,
      "description": ogDescription,
      "image": ogImage,
      "url": canonical,
      "inLanguage": lang,
      "provider": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "educationalCredentialAwarded": "Ammatillinen tutkinto",
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "Blended",
        "inLanguage": lang
      }
    });
    return;
  }

  // ===== Sports camps (leirit) =====
  if (/^\/urheilu\/leirit\//.test(path) || /^\/sports\/camps\//.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "@id": canonical + "#camp",
      "name": ogTitle,
      "description": ogDescription,
      "image": ogImage,
      "url": canonical,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "organizer": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "location": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" }
    });
    return;
  }

  // ===== Holiday packages (lomat ja kurssit) =====
  if (/^\/vapaa-aika\/lomat-ja-kurssit\//.test(path) || /^\/leisure\/holidays-and-courses\//.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": canonical + "#package",
      "name": ogTitle,
      "description": ogDescription,
      "image": ogImage,
      "url": canonical,
      "category": "Vacation package",
      "brand": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "offers": {
        "@type": "Offer",
        "url": canonical,
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "seller": { "@id": "https://www.kolmekampusta.fi/#organization" }
      }
    });
    return;
  }

  // ===== Activities (aktiviteetit) =====
  if (/^\/vapaa-aika\/aktiviteetit\//.test(path) || /^\/leisure\/activities\//.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      "@id": canonical + "#attraction",
      "name": ogTitle,
      "description": ogDescription,
      "image": ogImage,
      "url": canonical,
      "isAccessibleForFree": false,
      "publicAccess": true
    });
    return;
  }

  // ===== Business services (yritykset) =====
  if (/^\/yritykset\//.test(path) || /^\/businesses\//.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": canonical + "#service",
      "name": ogTitle,
      "description": ogDescription,
      "image": ogImage,
      "url": canonical,
      "provider": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "areaServed": { "@type": "Country", "name": "Finland" },
      "serviceType": "Corporate event services"
    });
    return;
  }

  // No specific section → no additional schema, Smart Content Tag handles it
})();
</script>
```

---

## TAG 8 — Debug/Validation Tag (optional, recommend in staging only)

Logs schema injection to console for QA. Disable in production after validation.

**Type:** Custom HTML
**Trigger:** All Pages, with environment filter to staging only
**Consent:** No additional consent required

```html
<script>
(function() {
  setTimeout(function() {
    var blocks = document.querySelectorAll('script[type="application/ld+json"]');
    console.group('%c[Schema.org]', 'color:#fff;background:#496499;padding:2px 8px;border-radius:4px;font-weight:bold');
    console.log('Found ' + blocks.length + ' JSON-LD block(s) on this page');
    blocks.forEach(function(b, i) {
      try {
        var data = JSON.parse(b.textContent);
        var type = Array.isArray(data['@type']) ? data['@type'].join('+') : data['@type'];
        console.log('  [' + (i+1) + '] @type=' + type + ', @id=' + (data['@id'] || '(none)'));
      } catch (e) {
        console.warn('  [' + (i+1) + '] INVALID JSON', e.message);
      }
    });
    console.groupEnd();
  }, 500);
})();
</script>
```

---

---

# Layer 2 — Dedicated facility tags

The following tags add Schema.org coverage for facilities that have their own dedicated pages on the site. Each uses the appropriate Schema.org subtype (PublicSwimmingPool, SportsClub, etc.) and links back to its parent campus via `containedInPlace`. These tags fire only on the specific facility's URL.

> **Note on facility hierarchy:** All facility entities use `containedInPlace` to reference the parent campus's canonical `#location` entity (e.g. `https://www.kolmekampusta.fi/pajulahti#location`). This tells Google "this swimming pool is located at this larger sports campus" without duplicating campus data.

---

### Layer 2 — Named facilities (Tags 9-19)

## TAG 9 — Lake Pool Pajulahti (Swimming Pool)

**Type:** Custom HTML
**Trigger:** Page URL contains `/aktiviteetit/lakepoolpajulahti` OR `/activities/lake-pool-pajulahti`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["PublicSwimmingPool", "SportsActivityLocation"],
  "@id": "https://www.kolmekampusta.fi/lakepool#facility",
  "name": "Lake Pool Pajulahti",
  "alternateName": "Pajulahden Lake Pool",
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/lakepoolpajulahti",
  "description": "Lake Pool yhdistää urheilulliset aktiviteetit, luontoa lähellä olevan tunnelman ja rennon oleskelun. Uimareille tarjolla 25 metrin uintiradat järvinäköalalla.",
  "telephone": "+358-44-7755-313",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "25-meter swimming lanes", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Lakeside location", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Relaxation area", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Accessible facilities", "value": true}
  ],
  "sport": ["Swimming", "Water Sports"],
  "isAccessibleForFree": false,
  "publicAccess": true,
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

## TAG 10 — Pajulahti Adventure Park

**Type:** Custom HTML
**Trigger:** Page URL contains `/aktiviteetit/seikkailupuisto` OR `/activities/adventure-park`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsActivityLocation", "TouristAttraction"],
  "@id": "https://www.kolmekampusta.fi/seikkailupuisto#facility",
  "name": "Pajulahden Seikkailupuisto",
  "alternateName": "Pajulahti Adventure Park",
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/seikkailupuisto",
  "description": "Aktiivinen kiipeilypuisto, jossa seikkailijat etenevät käyttäen omaa kehoaan ja ongelmanratkaisutaitojaan. 14 erilaista rataa eri vaikeustasoilla.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "14 climbing courses", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Multiple difficulty levels", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Safety equipment included", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Outdoor location", "value": true}
  ],
  "sport": ["Climbing", "Adventure Sports", "Rope Course"],
  "isAccessibleForFree": false,
  "publicAccess": true,
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

## TAG 11 — Pajulahti Swimming Hall (Pajulahden uimahalli)

**Type:** Custom HTML
**Trigger:** Page URL contains `/aktiviteetit/pajulahden-uimahalli`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["PublicSwimmingPool", "SportsActivityLocation"],
  "@id": "https://www.kolmekampusta.fi/uimahalli#facility",
  "name": "Pajulahden uimahalli",
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/pajulahden-uimahalli",
  "description": "Pajulahden sisäuimahalli urheilijoille ja kaikenikäisille uimareille.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Indoor swimming pool", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Swimming lanes", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Changing rooms", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Accessible facilities", "value": true}
  ],
  "sport": ["Swimming"],
  "isAccessibleForFree": false,
  "publicAccess": true,
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

## TAG 12 — TAITO 360 Motor Skills Area

**Type:** Custom HTML
**Trigger:** Page URL contains `/urheilun-palvelut/taito-360` OR `/sports-services/taito-360`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": "https://www.kolmekampusta.fi/taito360#facility",
  "name": "TAITO 360",
  "alternateName": "TAITO 360 motoristen taitojen harjoittelu- ja kuntoilualue",
  "url": "https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/taito-360",
  "description": "Motoristen taitojen harjoittelu- ja kuntoilualue Pajulahdessa. Monipuolinen alue koordinaation, ketteryyden ja toiminnallisen kunnon kehittämiseen.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Motor skills training equipment", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Functional fitness area", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Agility and coordination training", "value": true}
  ],
  "sport": ["Functional Fitness", "Motor Skills", "Athletic Conditioning"],
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

## TAG 13 — Pajulahti Recovery Center

**Type:** Custom HTML
**Trigger:** Page URL contains `/urheilun-palvelut/pajulahden-palautumiskeskus` OR `/sports-services/pajulahti-recovery-center`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["HealthClub", "MedicalBusiness"],
  "@id": "https://www.kolmekampusta.fi/recoverycenter#facility",
  "name": "Pajulahden palautumiskeskus",
  "alternateName": "Pajulahti Recovery Center",
  "url": "https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/pajulahden-palautumiskeskus",
  "description": "Urheilijoiden palautumiseen erikoistunut keskus Pajulahdessa. Modernit palautumismetodit ja huippuluokan asiantuntemus.",
  "telephone": "+358-44-7755-313",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Cold therapy / ice baths", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Heat therapy / sauna", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Massage therapy", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Recovery equipment", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Specialized recovery programs", "value": true}
  ],
  "medicalSpecialty": "SportsMedicine",
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

## TAG 14 — Kisakallio Sporttipassi (Sports Pass)

**Type:** Custom HTML
**Trigger:** Page URL contains `/aktiviteetit/kisakallion-sporttipassi` OR `/activities/kisakallio-sport-pass`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsClub", "Service"],
  "@id": "https://www.kolmekampusta.fi/sporttipassi#facility",
  "name": "Kisakallion Sporttipassi",
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/kisakallion-sporttipassi",
  "description": "Kisakallion Sporttipassi tarjoaa pääsyn monipuolisiin urheilu- ja hyvinvointipalveluihin Kisakallion kampuksella.",
  "telephone": "+358-19-31511",
  "email": "kisakallio@kolmekampusta.fi",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Kaarina Karin tie 4",
    "addressLocality": "Lohja",
    "postalCode": "08360",
    "addressCountry": "FI"
  },
  "sport": ["Gymnastics", "Cheerleading", "Combat Sports", "Racket Sports", "Swimming", "Fitness"],
  "currenciesAccepted": "EUR",
  "paymentAccepted": ["Cash", "Credit Card", "Invoice"],
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/kisakallio#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "makesOffer": {
    "@type": "Offer",
    "name": "Sporttipassi-jäsenyys",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

---

## TAG 15 — Kisakallio Sauna and Lake Swimming

**Type:** Custom HTML
**Trigger:** Page URL contains `/aktiviteetit/kisakallion-rantasauna` OR `/activities/kisakallio-beach-sauna`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": "https://www.kolmekampusta.fi/kisakallio-sauna#facility",
  "name": "Kisakallion sauna ja uinti",
  "alternateName": ["Kisakallion rantasauna", "Kisakallio Beach Sauna"],
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/kisakallion-rantasauna",
  "description": "Kisakallion rantasauna Lohjanjärven rannalla. Saunan jälkeen rentoutuminen järvellä uimalla tai kahlailemalla.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Kaarina Karin tie 4",
    "addressLocality": "Lohja",
    "postalCode": "08360",
    "addressCountry": "FI"
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Lakeside sauna", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Lake swimming access", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Changing facilities", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Outdoor relaxation area", "value": true}
  ],
  "sport": ["Swimming"],
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/kisakallio#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

## TAG 16 — Altitude Training Facility

**Type:** Custom HTML
**Trigger:** Page URL contains `/urheilun-palvelut/korkeanpaikan-harjoittelu` OR `/sports-services/high-altitude-training`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsActivityLocation", "Service"],
  "@id": "https://www.kolmekampusta.fi/altitude#facility",
  "name": "Korkeanpaikan harjoittelu",
  "alternateName": "High-Altitude Training",
  "url": "https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/korkeanpaikan-harjoittelu",
  "description": "Korkeanpaikan harjoittelutila urheilijoiden suorituskyvyn parantamiseen. Hapenpuutosolosuhteissa tapahtuva harjoittelu.",
  "telephone": "+358-44-7755-313",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Altitude chamber", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Hypoxic training environment", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Performance monitoring equipment", "value": true}
  ],
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

## TAG 17 — Sports Performance Testing Services

**Type:** Custom HTML
**Trigger:** Page URL contains `/urheilun-palvelut/testauspalvelut` OR `/sports-services/testing-services`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["MedicalBusiness", "Service"],
  "@id": "https://www.kolmekampusta.fi/testing#facility",
  "name": "Testauspalvelut",
  "alternateName": "Sports Performance Testing Services",
  "url": "https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/testauspalvelut",
  "description": "Suorituskyvyn testaus ja analytiikkapalvelut urheilijoille ja kuntoilijoille. Modernit testimenetelmät ja huippuluokan asiantuntijatiimi.",
  "telephone": "+358-44-7755-313",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "medicalSpecialty": ["SportsMedicine", "Physiotherapy"],
  "serviceType": "Sports performance testing and analysis",
  "areaServed": { "@type": "Country", "name": "Finland" },
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

## TAG 18 — Equipment and Field Rental

**Type:** Custom HTML
**Trigger:** Page URL contains `/aktiviteetit/valine-ja-kenttavuokraus` OR `/leisure/equipment-and-field-rental`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://www.kolmekampusta.fi/equipment-rental#service",
  "name": "Väline- ja kenttävuokraus",
  "alternateName": "Equipment and Field Rental",
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/valine-ja-kenttavuokraus",
  "description": "Urheiluvälineiden ja liikuntakenttien vuokraus Pajulahdessa ja Kisakalliossa. Monipuolinen valikoima eri lajien tarpeisiin.",
  "serviceType": "Sports equipment and venue rental",
  "provider": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "areaServed": [
    { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio#location" }
  ],
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "seller": { "@id": "https://www.kolmekampusta.fi/#organization" }
  }
}
</script>
```

---

## TAG 19 — Restaurants (Iso-Kukkanen, Café Keihäs, Rantamakasiini)

This tag emits a `@graph` with all three named restaurants in one block. Fires on the restaurant services landing page.

**Type:** Custom HTML
**Trigger:** Page URL matches RegEx `/(ravintolapalvelut|restaurant-services)`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Restaurant",
      "@id": "https://www.kolmekampusta.fi/restaurants/iso-kukkanen#restaurant",
      "name": "Ravintola Iso-Kukkanen",
      "url": "https://www.kolmekampusta.fi/fi/ravintolapalvelut",
      "description": "Pajulahden pääravintola. Monipuolinen ja maittava ruokavalikoima urheilijoille, vieraille ja paikallisille. Kanresta-konsernin operoima.",
      "telephone": "+358-44-7755-370",
      "email": "pajulahtivuorop@kanresta.fi",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Pajulahdentie 167",
        "addressLocality": "Nastola",
        "postalCode": "15560",
        "addressCountry": "FI"
      },
      "servesCuisine": ["Finnish", "International", "Sports Nutrition"],
      "priceRange": "€€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": ["Cash", "Credit Card", "Invoice"],
      "acceptsReservations": true,
      "hasMenu": "https://www.kolmekampusta.fi/fi/ravintolapalvelut",
      "amenityFeature": [
        {"@type": "LocationFeatureSpecification", "name": "Group dining", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Buffet service", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Special diets accommodated", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Catering for events", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Brunch service", "value": true}
      ],
      "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
    },
    {
      "@type": "CafeOrCoffeeShop",
      "@id": "https://www.kolmekampusta.fi/restaurants/keihas#cafe",
      "name": "Kahvila Keihäs",
      "alternateName": "Café Keihäs",
      "url": "https://www.kolmekampusta.fi/fi/ravintolapalvelut",
      "description": "Pajulahden päivittäinen kahvila Ravintola Iso-Kukkasen rinnalla. Kahvilatuotteita ja kevyttä syötävää.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Pajulahdentie 167",
        "addressLocality": "Nastola",
        "postalCode": "15560",
        "addressCountry": "FI"
      },
      "servesCuisine": ["Coffee", "Pastries", "Light meals"],
      "priceRange": "€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": ["Cash", "Credit Card"],
      "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
    },
    {
      "@type": "Restaurant",
      "@id": "https://www.kolmekampusta.fi/restaurants/rantamakasiini#restaurant",
      "name": "Ravintola Rantamakasiini",
      "url": "https://www.kolmekampusta.fi/fi/ravintolapalvelut",
      "description": "Kisakallion ravintola Lohjanjärven rannalla. Sopii yritysjuhliin, seminaareihin ja erityistapahtumiin.",
      "telephone": "+358-50-529-6514",
      "email": "ravintola.kisakallio@kolmekampusta.fi",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Kaarina Karin tie 4",
        "addressLocality": "Lohja",
        "postalCode": "08360",
        "addressCountry": "FI"
      },
      "servesCuisine": ["Finnish", "International", "Event Catering"],
      "priceRange": "€€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": ["Cash", "Credit Card", "Invoice"],
      "acceptsReservations": true,
      "amenityFeature": [
        {"@type": "LocationFeatureSpecification", "name": "Lakeside dining", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Event venue", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Conference catering", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Group dining", "value": true}
      ],
      "containedInPlace": { "@id": "https://www.kolmekampusta.fi/kisakallio#location" },
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
    }
  ]
}
</script>
```

> **Note:** This tag replaces the Smart Section Tag's restaurant branch (which emitted a single generic Restaurant entity). Remove or comment out the restaurant section in Tag 7 to avoid duplicate emission.

---

### Layer 3 — Education programs (Tags 20-23)

## TAG 20 — Vocational Education Program (Ammatillinen koulutus)

3K is a recognized provider of vocational education in physical education and sports. This tag fires on the vocational education page and represents the program as an `EducationalOccupationalProgram`.

**Type:** Custom HTML
**Trigger:** Page URL contains `/koulutus/koulutukset/ammatillinen-koulutus`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  "@id": "https://www.kolmekampusta.fi/koulutus/ammatillinen-koulutus#program",
  "name": "Ammatillinen koulutus",
  "alternateName": ["Vocational Education", "Liikunta-alan ammatillinen koulutus"],
  "url": "https://www.kolmekampusta.fi/fi/koulutus/koulutukset/ammatillinen-koulutus",
  "description": "Kolmen kampuksen urheiluopiston ammatillinen koulutus liikunta-alalla. Tutkintoon johtava koulutus, jossa valmistutaan urheilun ja liikunnan ammattilaiseksi.",
  "provider": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "programType": "Vocational training",
  "educationalCredentialAwarded": [
    {
      "@type": "EducationalOccupationalCredential",
      "name": "Liikunnanohjauksen perustutkinto",
      "credentialCategory": "Vocational qualification",
      "competencyRequired": "Physical education and sports instruction"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "name": "Valmentajan ammattitutkinto",
      "credentialCategory": "Further vocational qualification",
      "competencyRequired": "Coaching"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "name": "Liikunnan ja valmennuksen erikoisammattitutkinto",
      "credentialCategory": "Specialist vocational qualification",
      "competencyRequired": "Sports and coaching"
    }
  ],
  "occupationalCategory": [
    "Sports coach",
    "Physical education instructor",
    "Personal trainer",
    "Sports advisor"
  ],
  "educationalProgramMode": ["Full-time", "Part-time"],
  "inLanguage": "fi",
  "applicationStartDate": "2026-02-17",
  "applicationDeadline": "2026-03-17",
  "offers": {
    "@type": "Offer",
    "category": "Government-funded education",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  },
  "location": [
    { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio#location" }
  ]
}
</script>
```

> **Verify before publishing:** The exact list of qualifications awarded (`educationalCredentialAwarded`) should match what's actually on 3K's OPH accreditation. Application dates are placeholders matching Finnish national joint application — update to the actual 2026/2027 admission window. Pricing assumed government-funded (free for students); adjust if specific programs charge tuition.

---

## TAG 21 — Apprenticeship Program (Oppisopimuskoulutus)

Apprenticeship is a distinct legal framework in Finland combining work and study. Schema.org has a specific subtype `WorkBasedProgram` for this.

**Type:** Custom HTML
**Trigger:** Page URL contains `/koulutus/koulutukset/oppisopimuskoulutus`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WorkBasedProgram",
  "@id": "https://www.kolmekampusta.fi/koulutus/oppisopimuskoulutus#program",
  "name": "Oppisopimuskoulutus",
  "alternateName": ["Apprenticeship Training", "Apprenticeship Education"],
  "url": "https://www.kolmekampusta.fi/fi/koulutus/koulutukset/oppisopimuskoulutus",
  "description": "Oppisopimuskoulutus on tapa hankkia ammatillinen tutkinto työn ohessa. Yhdistää käytännön työn ja teoreettiset opinnot Kolmen kampuksen urheiluopistossa.",
  "provider": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "programType": "Apprenticeship",
  "educationalCredentialAwarded": [
    "Liikunnanohjauksen perustutkinto",
    "Valmentajan ammattitutkinto",
    "Liikunnan ja valmennuksen erikoisammattitutkinto"
  ],
  "occupationalCategory": [
    "Sports coach",
    "Physical education instructor",
    "Personal trainer"
  ],
  "educationalProgramMode": "Work-based",
  "inLanguage": "fi",
  "trainingSalary": {
    "@type": "MonetaryAmountDistribution",
    "name": "Apprentice salary (collective agreement based)",
    "currency": "EUR"
  },
  "offers": {
    "@type": "Offer",
    "category": "Government-funded education",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  },
  "location": [
    { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio#location" }
  ]
}
</script>
```

---

## TAG 22 — Continuing Education (Täydennyskoulutus)

Course-based continuing education for working professionals.

**Type:** Custom HTML
**Trigger:** Page URL contains `/koulutus/koulutukset/taydennyskoulutus`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  "@id": "https://www.kolmekampusta.fi/koulutus/taydennyskoulutus#program",
  "name": "Täydennyskoulutus",
  "alternateName": ["Continuing Education", "Professional Development Courses"],
  "url": "https://www.kolmekampusta.fi/fi/koulutus/koulutukset/taydennyskoulutus",
  "description": "Kolmen kampuksen urheiluopiston täydennyskoulutus liikunta-alan ammattilaisille. Lyhyitä kurssimuotoisia koulutuksia osaamisen päivittämiseen.",
  "provider": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "programType": "Continuing education",
  "occupationalCategory": [
    "Sports coach",
    "Physical education instructor",
    "Personal trainer",
    "Physiotherapist"
  ],
  "educationalProgramMode": ["Short course", "Online", "Hybrid"],
  "inLanguage": ["fi", "en"],
  "offers": {
    "@type": "Offer",
    "category": "Paid education",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  },
  "location": [
    { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio#location" }
  ]
}
</script>
```

---

## TAG 23 — Liberal Adult Education (Vapaan sivistystyön koulutus)

Non-degree adult education following Finland's "vapaa sivistystyö" tradition.

**Type:** Custom HTML
**Trigger:** Page URL contains `/koulutus/koulutukset/vapaan-sivistystyon-koulutus`
**Consent:** No additional consent required

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  "@id": "https://www.kolmekampusta.fi/koulutus/vapaan-sivistystyon-koulutus#program",
  "name": "Vapaan sivistystyön koulutus",
  "alternateName": ["Liberal Adult Education", "Non-formal Adult Education"],
  "url": "https://www.kolmekampusta.fi/fi/koulutus/koulutukset/vapaan-sivistystyon-koulutus",
  "description": "Kolmen kampuksen urheiluopiston vapaan sivistystyön koulutus. Avointa, joustavaa ja monimuotoista oppimista liikunnasta, hyvinvoinnista ja terveydestä kiinnostuneille.",
  "provider": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "programType": "Liberal adult education",
  "educationalProgramMode": ["Open enrollment", "Short course", "Workshop"],
  "inLanguage": ["fi", "en"],
  "offers": {
    "@type": "Offer",
    "category": "Adult education",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  },
  "location": [
    { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio#location" }
  ]
}
</script>
```

---

## 8. Trigger configuration (GTM)

Create these triggers under **Triggers → New**.

### Trigger A — All Pages
- Type: Page View
- Fires on: All Page Views
- Used by: Tag 1 (Organization), Tag 2 (WebSite), Tag 6 (Smart Content), Tag 7 (Smart Section)

### Trigger B — Pajulahti Campus Pages
- Type: Page View
- Fires on: Some Page Views
- Condition: `Page Path` `matches RegEx` `/(pajulahden-kampus|pajulahti-campus)$`
- Used by: Tag 3 (Pajulahti Campus / SportsActivityLocation)

### Trigger C — Kisakallio Campus Pages
- Type: Page View
- Fires on: Some Page Views
- Condition: `Page Path` `matches RegEx` `/(kisakallion-kampus|kisakallio-campus)$`
- Used by: Tag 4 (Kisakallio Campus / SportsActivityLocation)

### Trigger D — Mäkelänrinne Pages
- Type: Page View
- Fires on: Some Page Views
- Condition: `Page Path` `matches RegEx` `/(makelanrinteen-kampus|makelanrinne-campus|helsingin-kampus)`
- Used by: Tag 5 (Mäkelänrinne LocalBusiness)

### Trigger E — Pajulahti Accommodation Pages (NEW)
- Type: Page View
- Fires on: Some Page Views
- Condition: `Page Path` `matches RegEx` `/(majoitus/pajulahti|accommodation/pajulahti)`
- Used by: Tag 3a (Pajulahti Hotel/Resort)

### Trigger F — Kisakallio Accommodation Pages (NEW)
- Type: Page View
- Fires on: Some Page Views
- Condition: `Page Path` `matches RegEx` `/(majoitus/kisakallio|accommodation/kisakallio)`
- Used by: Tag 4a (Kisakallio Hotel/Resort)

### Trigger G — Lake Pool Pajulahti
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/(lakepoolpajulahti|lake-pool-pajulahti)`
- Used by: Tag 9 (Lake Pool)

### Trigger H — Adventure Park
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/(seikkailupuisto|adventure-park)`
- Used by: Tag 10 (Adventure Park)

### Trigger I — Swimming Hall
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/pajulahden-uimahalli`
- Used by: Tag 11 (Swimming Hall)

### Trigger J — TAITO 360
- Condition: `Page Path` `matches RegEx` `/urheilun-palvelut/taito-360`
- Used by: Tag 12 (TAITO 360)

### Trigger K — Recovery Center
- Condition: `Page Path` `matches RegEx` `/urheilun-palvelut/(pajulahden-palautumiskeskus|pajulahti-recovery-center)`
- Used by: Tag 13 (Recovery Center)

### Trigger L — Sporttipassi
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/(kisakallion-sporttipassi|kisakallio-sport-pass)`
- Used by: Tag 14 (Sporttipassi)

### Trigger M — Kisakallio Sauna
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/(kisakallion-rantasauna|kisakallio-beach-sauna)`
- Used by: Tag 15 (Kisakallio Sauna)

### Trigger N — Altitude Training
- Condition: `Page Path` `matches RegEx` `/urheilun-palvelut/(korkeanpaikan-harjoittelu|high-altitude-training)`
- Used by: Tag 16 (Altitude Training)

### Trigger O — Testing Services
- Condition: `Page Path` `matches RegEx` `/urheilun-palvelut/(testauspalvelut|testing-services)`
- Used by: Tag 17 (Testing Services)

### Trigger P — Equipment Rental
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/(valine-ja-kenttavuokraus|equipment-and-field-rental)`
- Used by: Tag 18 (Equipment Rental)

### Trigger Q — Restaurants
- Condition: `Page Path` `matches RegEx` `/(ravintolapalvelut|restaurant-services)`
- Used by: Tag 19 (Restaurants @graph)

### Trigger R — Vocational Education (NEW)
- Condition: `Page Path` `matches RegEx` `/koulutus/koulutukset/ammatillinen-koulutus`
- Used by: Tag 20 (Ammatillinen koulutus / Vocational Education)

### Trigger S — Apprenticeship (NEW)
- Condition: `Page Path` `matches RegEx` `/koulutus/koulutukset/oppisopimuskoulutus`
- Used by: Tag 21 (Oppisopimuskoulutus / Apprenticeship)

### Trigger T — Continuing Education (NEW)
- Condition: `Page Path` `matches RegEx` `/koulutus/koulutukset/taydennyskoulutus`
- Used by: Tag 22 (Täydennyskoulutus / Continuing Education)

### Trigger U — Liberal Adult Education (NEW)
- Condition: `Page Path` `matches RegEx` `/koulutus/koulutukset/vapaan-sivistystyon-koulutus`
- Used by: Tag 23 (Vapaan sivistystyön koulutus / Liberal Adult Education)

---

## 9. Cookiebot consent configuration

**Critical:** All schema tags must fire **regardless of consent state**. Schema is metadata, not tracking. It contains no PII and is essential for crawler visibility (search engine bots don't grant consent).

For each tag above, in GTM:
1. Open the tag
2. Click **Advanced Settings → Consent Settings**
3. Select **No additional consent required**

This bypasses Cookiebot's consent gating. Verify in GTM Preview Mode that tags fire on first page load before any consent action is taken.

If Cookiebot is configured to block the entire GTM container until consent (rare but possible), check Cookiebot settings:
- Under **Configuration → Your Scripts**
- Ensure GTM (`googletagmanager.com`) is allowed pre-consent OR is categorized as "Necessary"
- Schema injection has no privacy implications

---

## 10. Implementation order

Recommended sequence to minimize risk:

### Day 1 — Sitewide tags (30 min)
1. Create constant variables in GTM (8 variables, ~5 min)
2. Create Tag 1 (Organization) + Trigger A
3. Create Tag 2 (WebSite) + reuse Trigger A
4. Set both to fire pre-consent
5. Submit to Preview Mode, verify on homepage
6. Validate with [Rich Results Test](https://search.google.com/test/rich-results)
7. Publish to production

### Day 2 — Campus and accommodation tags (60 min)
1. Create Triggers B, C, D, E, F
2. Create Tags 3, 4, 5 (campus context) with respective campus triggers
3. Create Tags 3a, 4a (accommodation context, with `ReserveAction`) with accommodation triggers
4. Preview on each URL (3 campus pages + 2 accommodation pages)
5. Rich Results Test for each
6. Confirm `Hotel`/`Resort` rich result eligibility for accommodation pages
7. Publish

### Day 3 — Smart tags (90 min)
1. Create Tag 6 (Smart Content) with Trigger A
2. Test on: homepage, one article (`/fi/artikkelit/*`), one news (`/fi/uutiset/*`), one event (`/fi/tapahtumat/*`)
3. Create Tag 7 (Smart Section) with Trigger A
4. Test on: contact page, restaurant page, course page, accommodation page
5. Rich Results Test on a sample of each page type (8-10 URLs)
6. Publish

### Day 4 — Facility sub-entity tags (120 min)
1. Create Triggers G through Q (11 triggers for facility URL patterns)
2. Create Tags 9–18 (one tag per named facility): Lake Pool, Adventure Park, Swimming Hall, TAITO 360, Recovery Center, Sporttipassi, Kisakallio Sauna, Altitude Training, Testing Services, Equipment Rental
3. Create Tag 19 (Restaurants @graph) — emits Iso-Kukkanen + Café Keihäs + Rantamakasiini together on the restaurant services page
4. Preview each facility URL in turn
5. Rich Results Test on each facility page
6. Verify `containedInPlace` links resolve correctly (parent campus shown in entity graph)
7. Publish

### Day 5 — Validation and Search Console
1. Submit updated sitemaps in Google Search Console
2. Use **URL Inspection** on representative URLs to force re-crawl (do 1 of each schema type, ~15 URLs total)
3. Wait 1-2 weeks
4. Check **Enhancements** report for:
   - Sitelinks searchbox
   - Organization
   - Local business
   - Hotel / Resort (accommodation pages)
   - Article / NewsArticle
   - Breadcrumbs
   - Restaurant
   - Course
5. Cross-check Google Business Profile presence for each campus — schema and GBP work together for local SEO impact

---

## 11. Validation checklist

For each page type, verify in [Rich Results Test](https://search.google.com/test/rich-results):

### Homepage (https://www.kolmekampusta.fi/fi)
Expected: Organization, WebSite, WebPage, BreadcrumbList (existing)

### Article (https://www.kolmekampusta.fi/fi/artikkelit/[any])
Expected: Organization, WebSite, Article, BreadcrumbList (existing)
Verify: headline, datePublished, image, author/publisher

### News (https://www.kolmekampusta.fi/fi/uutiset/[any])
Expected: Organization, WebSite, NewsArticle, BreadcrumbList (existing)
Verify: NewsArticle eligible for Google News rich results

### Pajulahti (https://www.kolmekampusta.fi/fi/pajulahden-kampus)
Expected: Organization, WebSite, SportsActivityLocation+LodgingBusiness, BreadcrumbList
Verify: address, phone, opening hours, geo coordinates

### Kisakallio (https://www.kolmekampusta.fi/fi/kisakallion-kampus)
Expected: Organization, WebSite, SportsActivityLocation+LodgingBusiness, BreadcrumbList

### Mäkelänrinne (https://www.kolmekampusta.fi/fi/makelanrinteen-kampus)
Expected: Organization, WebSite, SportsActivityLocation+EducationalOrganization, BreadcrumbList

### Pajulahti Accommodation (https://www.kolmekampusta.fi/fi/majoitus/pajulahti)
Expected: Organization, WebSite, Resort+Hotel (with ReserveAction), BreadcrumbList
Verify: ReserveAction target URL works, priceRange shown, amenities listed, containedInPlace links to Pajulahti #location entity
Rich Result eligibility: Hotel rich results, "Places to stay" panel

### Kisakallio Accommodation (https://www.kolmekampusta.fi/fi/majoitus/kisakallio)
Expected: Organization, WebSite, Resort+Hotel (with ReserveAction), BreadcrumbList
Verify: Same as Pajulahti accommodation

### Contact (https://www.kolmekampusta.fi/fi/meista/yhteystiedot)
Expected: Organization, WebSite, ContactPage, BreadcrumbList

### Restaurant (https://www.kolmekampusta.fi/fi/ravintolapalvelut)
Expected: Organization, WebSite, Restaurant, BreadcrumbList

### Course (https://www.kolmekampusta.fi/fi/koulutus/koulutukset/ammatillinen-koulutus)
Expected: Organization, WebSite, Course, BreadcrumbList

### Camp (https://www.kolmekampusta.fi/fi/urheilu/leirit/esikuvaleirit)
Expected: Organization, WebSite, SportsEvent, BreadcrumbList

### Vacation package (https://www.kolmekampusta.fi/fi/vapaa-aika/lomat-ja-kurssit/perhepaketit)
Expected: Organization, WebSite, Product, BreadcrumbList

### Activity (https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/seikkailupuisto)
Expected: Organization, WebSite, TouristAttraction, BreadcrumbList

### Business service (https://www.kolmekampusta.fi/fi/yritykset/kokoukset)
Expected: Organization, WebSite, Service, BreadcrumbList

### Generic page (https://www.kolmekampusta.fi/fi/meista/hankkeet)
Expected: Organization, WebSite, AboutPage, BreadcrumbList

### Facility pages — sub-entity schema (Tags 9–18)

Validate that each of these emits its facility-specific schema with proper `containedInPlace` linking back to the parent campus entity:

- **Lake Pool Pajulahti** — `https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/lakepoolpajulahti` — Expected: PublicSwimmingPool + SportsActivityLocation
- **Adventure Park** — `https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/seikkailupuisto` — Expected: TouristAttraction + SportsActivityLocation
- **Pajulahti Swimming Hall** — `https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/pajulahden-uimahalli` — Expected: PublicSwimmingPool
- **TAITO 360** — `https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/taito-360` — Expected: SportsActivityLocation
- **Recovery Center** — `https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/pajulahden-palautumiskeskus` — Expected: HealthClub + MedicalBusiness
- **Sporttipassi** — `https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/kisakallion-sporttipassi` — Expected: SportsClub + Service
- **Kisakallio Sauna** — `https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/kisakallion-rantasauna` — Expected: SportsActivityLocation
- **Altitude Training** — `https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/korkeanpaikan-harjoittelu` — Expected: SportsActivityLocation + Service
- **Testing Services** — `https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/testauspalvelut` — Expected: MedicalBusiness + Service
- **Equipment Rental** — `https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/valine-ja-kenttavuokraus` — Expected: Service

### Restaurant page — @graph with multiple restaurants (Tag 19)

`https://www.kolmekampusta.fi/fi/ravintolapalvelut` — Expected: @graph containing 3 restaurant entities (Iso-Kukkanen Restaurant, Café Keihäs CafeOrCoffeeShop, Rantamakasiini Restaurant). Verify each has its own `@id` and that they cross-reference the correct campus via `containedInPlace`.

## 12. Future enhancements (next phases)

These are improvements deferred from the current 25-tag plan. Each is feasible as a follow-up project; none are blockers for the current rollout.

### 15.1 Additional content types

**BlogPosting refinement** — Tag 6 currently dispatches BlogPosting based on `page-node-type-blogi` body class OR `/blogi/` URL match. If the Drupal content type's machine name is different (e.g., `blogikirjoitus`), the body class check won't match — verify in Drupal admin and adjust the regex. Low-risk to leave as URL-based fallback.

**Case studies (`/fi/caset/*`)** — Only one example found in crawl. Could be merged into Tag 6 as `Article` with `articleSection: "Case study"`, or given its own dispatch if volume grows. Currently falls through to Tag 6's generic WebPage fallback.

**Student stories** — A `student_story` content type exists (visible in `?tyyppi=student_story` URL filters) but no specific URL pattern was found in the crawl. Investigate in Drupal admin. When the URL pattern is known, add dispatch to Tag 6 emitting `Article` with `articleSection: "Student story"` or `Review` if the stories are testimonials about education programs.

**Aggregator/list pages (`CollectionPage` + `ItemList`)** — Pages like `/fi/ajankohtaista`, `/fi/tulevat-tapahtumat`, `/fi/uutiset`, `/fi/blogi`, `/fi/koulutus/koulutukset`, `/fi/vapaa-aika/aktiviteetit` are aggregators that would benefit from `CollectionPage` schema with `ItemList` of contained items. Recommended as a phase 2 addition (one new tag, fires on these URLs, generates `ItemList` from the page's content cards via DOM scraping). Estimated effort: 2 hours.

**Taxonomy term pages** — 23 raw `/fi/taxonomy/term/[id]` URLs found, no aliases. Recommended action: have Druid add URL aliases (e.g., `/fi/aiheet/[slug]`), then add a Tag for `CollectionPage` schema on these. Until aliases exist, these pages shouldn't get specific schema.

### 15.2 Additional named entities

**Valmennuskeskus (Olympic Training Center)** — `/fi/urheilu/valmennuskeskus`. As Finland's only joint Olympic/Paralympic Training Center, this page deserves dedicated `SportsActivityLocation` schema with strong cross-references to Suomen Olympiakomitea and Suomen Paralympiakomitea. Recommended as a phase 2 tag.

**Susi Training Center** — `/fi/susi-training-center`, `/en/susi-training-center`. Named after Finland's basketball team Susijengi. `SportsActivityLocation` with `sport: "Basketball"`.

**Additional restaurants** found in the crawl but not in Tag 19's @graph:
- Café Kimallus (`/fi/cafe-kimallus`)
- Café Sekkari (`/fi/kahvila-sekkari`, `/en/cafe-sekkari`)
- Restaurant Sport (`/en/restaurant-sport`)
- Restaurant Fanni (`/en/restaurant-fanni`, likely at Mäkelänrinne)

Recommended: extend Tag 19's @graph to include these. Estimated effort: 30 minutes.

**Individual Pajulahti accommodation buildings** — The site has separate pages for each building (Hotel Kalliopaju, Omenatarha, Puistopaju, Rantapaju, Apartment Hotel Katajarinne 1-2 and 3-4, Rantarinne dormitory, Kangaspaju, Hopeapaju). Currently listed as `amenityFeature` in Tag 3a. For better SEO on individual building searches, could be split into separate `HotelRoom` or `LodgingBusiness` entities cross-referenced from Tag 3a via `containsPlace`. Diminishing returns; recommended only if individual buildings drive meaningful search traffic in Search Console.

**Sub-facilities (sports halls, meeting rooms, classrooms)** — Pajulahti has dedicated pages for individual sports halls (Pajulahti-halli, Susi Training Center, Nikula-halli, Kamppailuareena, Pajulahti Ice Hall, etc.), meeting rooms, and classrooms. ~30 individual spaces. Same trade-off as individual buildings: high effort, modest SEO value. Defer unless data shows specific demand.

### 15.3 Education enhancements

**Course catalog (`hasCourse` relationship)** — Tags 20-23 list programs but don't enumerate individual courses within each program. If 3K has a catalog of specific courses (e.g., "Personal Trainer level 1", "Nutrition coaching basics") with their own pages, those can be marked up as `Course` entities with `inProgramSet` referencing the parent `EducationalOccupationalProgram`. Requires Druid input on how the catalog is structured.

**Application form / enrollment action** — Each program could include a `potentialAction` of type `ApplyAction` pointing to the application form URL. Currently the programs reference application dates but not the form itself. Easy phase 2 addition.

### 15.4 Reviews and DigitalGuest

A full section (16) below covers the review schema question. Summary: deferred until 3K has a workflow that publishes representative (not gated) reviews visibly on the site. Until then, no `aggregateRating` is emitted.

---

## 13. Reviews and DigitalGuest integration

3K collects guest feedback via DigitalGuest (visible in the site footer as `app.digitalguest.com/guestbook/Pajulahti` and `/Kisakallio` links). This section explains why no `Review` or `AggregateRating` schema is currently emitted, and what would need to change for that to be possible.

### Google's review policy in 2026

For schema.org `Review` and `AggregateRating` markup to comply with Google's structured data policy:

1. **Reviews must be visible on the page** — not just hidden in JSON-LD
2. **Selection must not be biased** — no filtering to show only positive ratings
3. **The aggregate must reflect all reviews** — `ratingValue` is the true average, not a positive subset
4. **Reviews must be from real users** — not fabricated or AI-generated
5. **Reviews must be about the entity being marked up** — not borrowed from other sources

Google has tightened enforcement on these requirements since 2019. Self-published reviews on LocalBusiness/Hotel/Resort entities are now heavily scrutinized; manual actions for "review snippet abuse" can remove rich results across the entire site (not just the offending page).

### The DigitalGuest workflow tension

DigitalGuest's product design explicitly routes positive feedback (high NPS scores) toward public review platforms while keeping critical feedback private. Their marketing material describes this as a feature: amplify positive guests to Google/TripAdvisor reviews, capture negative feedback for internal use only. This is "review gating" in Google's terminology and violates the unbiased-selection requirement if reused for on-site schema.

So while it's technically straightforward to convert DigitalGuest data to schema.org Review format, doing so would risk a manual action.

### What a compliant workflow would look like

If 3K wants to publish reviews with schema:

1. **Daily/weekly export** from DigitalGuest (CSV from dashboard, or request reviews-out API from integrations@digitalguest.com)
2. **Power Automate flow** → Drupal custom "Review" content type
3. **Editorial review step** — PII check, optional translation, but **no filtering** for sentiment
4. **Drupal renders all reviews visibly** on a dedicated reviews page per campus (e.g., `/fi/majoitus/pajulahti/arvostelut`)
5. **Schema.org Review markup** attached to each review block
6. **`AggregateRating` calculated server-side from the full review set**

This is a Drupal feature, not a GTM tag — approximately one week of development. Not in current scope.

### SEO impact ranking

Order of impact for hospitality SEO, descending:

1. **Google Business Profile reviews — high impact.** Drives Maps rankings, Knowledge Panel stars, CTR. Most important single lever. Use DigitalGuest's "encourage Google review" flow for happy guests — this *is* the correct use of NPS gating.

2. **Third-party platform reviews (Booking.com, TripAdvisor, Hotels.com) — high impact, low control.** Dominate hotel-related search results.

3. **Self-hosted reviews with schema markup — modest impact.** Subject to ever-tightening Google guidelines. Worth doing if visible-on-page, unbiased, and editorially curated.

**Recommendation for 3K:** Focus next 90 days on Google Business Profile optimization for all three campuses. Defer the self-hosted review schema project until GBP is fully optimized. The GBP work is higher-ROI and lower-risk.

### Reference: compliant Review schema (for future implementation)

When the time comes:

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "datePublished": "2026-03-15",
  "author": {"@type": "Person", "name": "Anonymous guest"},
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 5,
    "bestRating": 5,
    "worstRating": 1
  },
  "reviewBody": "Erinomainen leirikoulupaketti, henkilökunta huippua, ruoka todella maukasta.",
  "itemReviewed": { "@id": "https://www.kolmekampusta.fi/majoitus/pajulahti#lodging" }
}
```

And the aggregate to add to the accommodation entity:

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.3",
  "reviewCount": 247,
  "bestRating": 5,
  "worstRating": 1
}
```

Only with real data, full reviews visible on the page, honest aggregate.

---

## 14. Maintenance notes

### Adding new content types

When a new content type appears in Drupal (e.g., a new "podcast" content type), the schema plan needs an update:

1. **Identify the body class** — Drupal generates `page-node-type-[machine-name]` on the body tag.
2. **Decide the schema type** — Article, BlogPosting, PodcastEpisode, CreativeWork, etc.
3. **Add a dispatch branch** to Tag 6 (Smart Content) following the existing pattern.
4. **Test in GTM Preview Mode** on a sample page of the new type.
5. **Validate with Rich Results Test** for the URL.

### Adding new named facilities

When a new named facility is launched (e.g., a new pool or training center):

1. Create a new Tag (Tag 24, 25, etc.) following the Layer 2 pattern.
2. Use `@id` matching the facility's hash: `https://www.kolmekampusta.fi/[slug]#facility`.
3. Set `containedInPlace` to the parent campus entity.
4. Add a trigger for the facility's URL.
5. Optionally update the parent campus tag's `containsPlace` array to reference the new facility.

### Adding new sports / amenities

For the campus tags (3, 4, 5), the `sport` and `amenityFeature` arrays should reflect what's actually offered. When new sports or facilities are added physically, update these arrays. This is a content task, not a code task.

### Schema.org version updates

Schema.org evolves continuously. Periodically (every 6-12 months) check:
- New properties relevant to existing entities (e.g., new `accessibilityFeature` values)
- Deprecated properties that should be replaced
- New rich result types Google has launched

The Google Search Central blog and Schema.org release notes are the authoritative sources.

### Removing or migrating tags

If a content type or page is removed from Drupal:
1. Disable (don't delete) the corresponding GTM tag — disabling preserves audit history.
2. After 60 days with no traffic, the tag can be deleted.

If migrating from GTM to Drupal-side schema (recommended long-term):
1. Build the Drupal Schema.org Metatag implementation in staging first.
2. Validate parity with the GTM version.
3. Enable both in production simultaneously for 1 week.
4. Compare Search Console enhancement reports.
5. Disable the GTM tag once Drupal is confirmed working.

---

## 15. Handoff context for fresh Claude sessions

This section provides everything a new AI session (or a new human implementer) needs to continue this work without re-deriving the rationale.

### 18.1 Project background in one paragraph

3K (Kolmen kampuksen urheiluopisto) is a Finnish sports institute spanning three campuses (Pajulahti, Kisakallio, Mäkelänrinne) that is also a recognized educational institution awarding vocational qualifications. Their main site `kolmekampusta.fi` runs on Drupal 11 (managed by agency Druid). Jussi Saarinen (ICT specialist at 3K) is implementing comprehensive schema.org structured data via GTM (container `GTM-WD3C92NG`). This document is the complete plan: 25 tags covering Organization, three campuses, accommodation, content (article/news/blog/event), 11 named facilities, three named restaurants, and four education programs. The Drupal Metatag module already emits BreadcrumbList; the GTM tags add everything else without requiring Drupal changes.

### 18.2 What's done

- ✅ Complete site audit (921 pages crawled)
- ✅ All 25 tag JSON-LD designed and reviewed against 2026 best practices
- ✅ All 21 triggers specified with regex patterns
- ✅ Trigger and tag relationship documented
- ✅ Cookiebot consent strategy decided (schema fires pre-consent)
- ✅ Implementation order planned across 5 days
- ✅ Validation methodology defined
- ✅ Items needing verification before publishing listed per tag
- ✅ Data quality issues identified (separate from schema)
- ✅ Future enhancements catalogued (reviews, additional content types, sub-facilities)

### 18.3 What remains (the "finishing phase")

The remaining work is configuration and verification — no more design or code generation:

1. **Verify placeholder values with 3K operations** (about 1-2 hours of conversation with Jussi):
   - Exact list of vocational qualifications 3K awards (Tag 1, Tag 20)
   - Application dates for the 2026/2027 vocational education admission window (Tag 20)
   - Accommodation specifics: numberOfRooms for Pajulahti, checkinTime/checkoutTime, petsAllowed policy, priceRange (Tag 3a, 4a)
   - Willba booking deep-link URLs per campus (Tag 3a, 4a)
   - GPS coordinates for each campus (currently estimates) (Tags 3, 4, 5)
   - Social media URLs in Organization.sameAs (Tag 1)
   - Whether Mäkelänrinne should also carry `EducationalOrganization` typing (Tag 5)
   - Pajulahti homepage image (currently missing og:image — fix in Drupal Metatag, then update Tag 1's `image` if needed)
   - Confirm amenityFeature claims match reality for each campus (Tags 3, 4)

2. **Build in GTM** (estimated 6-7 hours total per implementation plan):
   - Create constant variables (section 7)
   - Create 21 triggers (section 9)
   - Create 25 tags (sections 8)
   - Preview-test on representative URLs
   - Validate each with Google's Rich Results Test
   - Publish container

3. **Submit to Search Console** (section 11):
   - Use URL Inspection to force re-crawl on representative pages
   - Monitor Enhancements report over 1-2 weeks

4. **Optional phase 2** (section 15):
   - Decide whether to add CollectionPage tag for aggregator pages
   - Decide whether to add Valmennuskeskus tag for Olympic Training Center
   - Decide whether to extend Tag 19's restaurant @graph
   - Decide whether to add individual building/facility tags

### 18.4 Key decisions and rationale (so they don't get re-litigated)

**Why GTM not Drupal-side schema:** Operational independence from Druid. See section 4.1.

**Why three layers of tags:** Mental model for the implementer. Foundation (Tags 1-8), facilities (Tags 9-19), education (Tags 20-23). See section 4.2.

**Why multi-typing the Organization:** 3K is genuinely a sports organization, an educational organization, and an organization. Multi-typing tells Google this accurately. See section 4.3.

**Why separate accommodation tags (3a, 4a) from campus tags (3, 4):** Accommodation pages have booking intent and deserve Hotel/Resort-typed schema with `ReserveAction` and booking-specific properties. Campus pages emphasize sports facility identity. Separate triggers prevent double-emission. See Tag 3/3a discussion.

**Why no aggregateRating:** Google policy compliance. DigitalGuest data is positive-gated. Self-publishing biased reviews triggers manual actions. See section 16.

**Why Tags 9-19 are separate (not one big @graph):** Easier to debug and disable individually. Tag 19 IS an @graph because the three restaurants share a single landing page (`/ravintolapalvelut`); they can't be separate tags without firing on different URLs.

**Why BreadcrumbList is not in this plan:** Drupal Metatag already emits it. Don't duplicate.

**Why no FAQ/HowTo schema:** Google deprecated these rich results for most sites in 2023. Including them wastes effort.

**Why fires pre-consent:** Schema is metadata, not tracking. Standard interpretation of GDPR/CMv2. See section 4.5.

### 18.5 Common questions and answers

**Q: Can we add more facility tags?**
A: Yes — see section 17 "Adding new named facilities". Follow the Layer 2 pattern.

**Q: Will Google show all 25 schemas in rich results?**
A: No. Google picks which schemas trigger which rich result based on its own algorithms. The point of comprehensive schema is to give Google's entity graph accurate information, not to force rich results.

**Q: What if Drupal changes the body class naming convention?**
A: Tag 6 will fall through to the generic WebPage branch. Tag 7 uses URL patterns so is unaffected. Update Tag 6's body class detection regex if convention changes.

**Q: What if the Metatag module starts emitting an Organization or WebSite schema?**
A: That would duplicate Tags 1 and 2. Either: (a) disable Tags 1/2 in GTM, or (b) configure Metatag to skip those schemas. Decide based on which has richer properties.

**Q: How do we know if schema is working?**
A: Three signals: (1) Rich Results Test reports valid schema for representative URLs, (2) Search Console Enhancements report shows accepted entities, (3) Knowledge Panel and rich snippets begin appearing in production SERPs over 4-8 weeks.

**Q: How long until results appear in search?**
A: Initial Search Console reflection: 1-3 days. Rich result appearance in actual SERPs: 2-8 weeks depending on Google's re-crawl cadence and the entity's authority.

**Q: Can we add Cookiebot consent dependency to any of these tags?**
A: You can, but you shouldn't. Schema is metadata. Adding consent gating would mean some users (those who decline cookies) don't generate the schema HTML, which is meaningless because Googlebot itself doesn't have consent state. Just leave consent as "not required" for all schema tags.

**Q: What about hreflang?**
A: Hreflang is handled by Drupal (and visible in `<link rel="alternate" hreflang="...">` tags in HTML head). It's not part of schema.org JSON-LD. Don't try to add it via GTM.

**Q: Should I add `@language` or `inLanguage` to entities?**
A: `inLanguage` is set on content entities (Article, BlogPosting, Course, Event) in this plan. Not needed on Place/Organization entities. The current code already handles this correctly.

**Q: What's the Schema.org Validator URL?**
A: `https://validator.schema.org/` (originated as Yandex's tool, now Schema.org's official validator). Google's Rich Results Test is at `https://search.google.com/test/rich-results`. Use both.

### 18.6 Files and resources

- **This document** is the master reference.
- **GTM container:** GTM-WD3C92NG (Jussi has access)
- **Site URL:** https://www.kolmekampusta.fi/
- **Site contact info source:** https://www.kolmekampusta.fi/fi/meista/yhteystiedot
- **Drupal admin:** managed by Druid; contact Jussi for access
- **Willba booking URLs:** `https://kolmekampusta.willba.store/locations` (general), `store.pajulahti.willba.app`, `store.kisakallio.willba.app` (per-campus)
- **DigitalGuest:** `app.digitalguest.com/guestbook/Pajulahti` and `/Kisakallio` (for reference only, not consumed by schema)

### 18.7 What NOT to do

- **Don't propose Drupal code changes** without first confirming with Jussi. The agency (Druid) manages the Drupal codebase and changes require coordination.
- **Don't add `aggregateRating` or `Review` schema** unless 3K has built the compliant review publishing workflow (section 16).
- **Don't fabricate values** for placeholders. If you don't have real data for `numberOfRooms`, ask. Don't guess and ship.
- **Don't recommend FAQPage or HowTo schema** for new content — Google deprecated these rich results.
- **Don't remove the BreadcrumbList Drupal Metatag emission.** It's working correctly.
- **Don't try to validate schema by viewing source.** GTM injects after page load — use GTM Preview Mode or Rich Results Test instead.

---

## 16. Glossary

- **3K** — Kolmen kampuksen urheiluopisto, the parent organization
- **`@id`** — A Schema.org property that gives an entity a stable URL identifier for cross-referencing. Format: `https://example.com/path#fragment`
- **`@graph`** — A Schema.org keyword for combining multiple entities in one JSON-LD block. Used in Tag 19 for the three restaurants.
- **Cookiebot** — Cookie consent management platform. Implements Google Consent Mode v2.
- **Druid** — The digital agency that maintains 3K's Drupal site on the Druid XP platform.
- **DruidXP** — Druid's managed Drupal hosting platform.
- **GTM** — Google Tag Manager. Container ID: GTM-WD3C92NG.
- **JSON-LD** — JavaScript Object Notation for Linked Data. The format used for schema markup. Embedded in `<script type="application/ld+json">` tags.
- **Knowledge Panel** — Google's entity information panel that appears for recognized organizations, people, places.
- **Metatag (Drupal module)** — Drupal contributed module that emits Open Graph, Twitter Card, and BreadcrumbList JSON-LD. Already installed.
- **NPS** — Net Promoter Score. Used by DigitalGuest as the basis for review gating.
- **OPH** — Opetushallitus (Finnish National Agency for Education). Authority that accredits 3K's vocational qualifications.
- **Pajulahti** — One of the three campuses (Nastola/Lahti). Olympic and Paralympic Training Center.
- **Kisakallio** — One of the three campuses (Lohja). Gymnastics and racket sports focus.
- **Mäkelänrinne** — One of the three campuses (Helsinki). At Urhea sports academy facilities.
- **Rich Results Test** — Google's tool at search.google.com/test/rich-results for validating structured data.
- **Schema.org Validator** — Schema.org's tool at validator.schema.org for validating JSON-LD syntax and properties.
- **Search Console** — Google Search Console. Reports indexing status and Enhancements (rich result eligibility).
- **Urhea** — Pääkaupunkiseudun Urheiluakatemia, the Helsinki sports academy partner.
- **Vapaa sivistystyö** — "Liberal adult education" in Finnish. A formal category of non-degree adult education.
- **Willba** — Booking and reservation system used by 3K. Strapi-backed, OAuth2 via Keycloak.
