# GTM Tags — Production-Ready (all 26 tags, final form)

**Date:** 2026-05-17
**Status:** Ready for production paste into GTM container `GTM-WD3C92NG`
**Last updated:** 2026-06-08 — Google Search Console structured-data fixes (Errors A/B/C) + Pajulahti `addressLocality` Lahti→Nastola
**Source files:** `kolmekampusta-gtm-schema.md` (original master) + `kolmekampusta-gtm-schema-refined.md` (audit/refinement record)

This document is the **single canonical source** for the GTM tag bodies, constants, and triggers. Every audit fix from v1.0 through v4 is baked in. Paste these tag bodies directly into GTM.

## Notes baked into this file

- All Pajulahti facility tags use `addressLocality: "Nastola"` (the postal locality / postitoimipaikka, matching Drupal's event address fields) and `addressRegion: "Päijät-Häme"`. The municipality is Lahti (Nastola merged into Lahti in 2016) — kept only in Tag 3's `containedInPlace` AdministrativeArea `"Lahti, Finland"`.
- **GSC Error A fix (2026-06-08)** — Tag 7 `/ryhmat-ja-leirit/*` branch: removed `Product` from `@type` (kept `TouristTrip` alone). A `Product` with no `offers`/`review`/`aggregateRating` is invalid for Google; we can't add a price and review/rating are forbidden (DigitalGuest).
- **GSC Error B fix (2026-06-08)** — Tag 6 `SportsEvent`: the event `location` now inlines the full canonical campus `Place` (name + address) instead of a bare `{"@id": ".../<campus>#location"}`. The campus Place entities (Tags 3/4/5) do not fire on event pages, so the reference resolved to a location with no `name`/`address`. Detection broadened to match inflected forms (Pajulahden, Kisakalliossa, …) via location-name → URL slug → title.
- **GSC Error C fix (2026-06-08)** — Variable `js.og.image.or.fallback` strips the `?h=…&itok=…` query string. GTM JS-escapes `=`/`&` to `\x3d`/`\x26` when injecting the value into a `ld+json` Custom HTML tag, which is invalid JSON ("bad escape sequence"). This affected every static tag using the image variable, not only the three GSC flagged.
- All Kisakallio facility tags use `addressLocality: "Lohja"` and `addressRegion: "Uusimaa"`.
- Tags 14, 18, 22, 23 — `offers`/`makesOffer` blocks removed (no price → incomplete Offer per Google).
- Tag 14 — `@type` simplified to single `"SportsClub"`.
- Tag 1 — `educationalCredentialAwarded` and `hasOccupationalProgram` removed (not valid on Organization).
- Tag 1 / Tag 2 — `alternateName` aligned (no "3K", added "Sports Institute of Three Campuses").
- Tag 5 — fully enriched (image, email, amenityFeature, payment fields).
- Tag 19 — Iso-Kukkanen `hasMenu` dropped; `addressRegion` added to all 3 restaurants.
- All LocalBusiness/Hotel/Restaurant tags — `paymentAccepted: ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"]` (Café Keihäs uses smaller cafe-appropriate subset).
- All Hotel/LodgingBusiness tags — `priceRange: "€€"` (required by Google for LodgingBusiness).
- Tag 6 — uses Drupal SmartDate field selectors for event dates, falls through gracefully if data missing.
- Tag 7 — restaurant branch / sports camps / holiday packages branches all deleted (incomplete entity prevention).
- Tag 24 — JobPosting auto-extract from Drupal DOM for `/fi/meista/avoimet-tyopaikat/{slug}` pages. Always emits all 3 campuses as jobLocation (work campus is negotiable per content team). Graceful degradation: omits validThrough/employmentType if Finnish content patterns don't match.
- Every tag: **Custom HTML**, **Consent: No additional consent required**.

---

## A. Constants (create as GTM User-Defined Variables → Constant)

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

---

## A.1. Custom JavaScript Variable (REQUIRED for dynamic image)

Tags 3, 3a, 4, 4a, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, and the 3 restaurants in Tag 19's `@graph` use `{{js.og.image.or.fallback}}` to dynamically pick up each page's current hero image (`<meta property="og:image">`). The 3 restaurants share the `/ravintolapalvelut` landing page so they all resolve to the same image — Google's own image discovery (Maps, GBP) handles per-restaurant distinction. This means: when 3K updates a page's hero image in Drupal, the schema automatically uses the new image — no GTM redeploy needed.

**Create this variable in GTM → Variables → User-Defined → New → Custom JavaScript:**

- **Variable name:** `js.og.image.or.fallback`
- **Variable type:** Custom JavaScript
- **Code:**

```js
function() {
  var meta = document.querySelector('meta[property="og:image"]');
  if (meta && meta.getAttribute('content')) {
    // Strip the ?h=...&itok=... query string. GTM JS-escapes '=' and '&' to
    // \x3d / \x26 when substituting this value into a Custom HTML
    // <script type="application/ld+json"> tag, which is invalid JSON ("bad
    // escape sequence"). A query-less path yields only \/ which is valid JSON.
    return meta.getAttribute('content').split('?')[0];
  }
  // Fallback when og:image is missing (currently only the homepage on this site)
  return 'https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg';
}
```

**Behavior:**
- On a page with `<meta property="og:image" content="X">` → returns `X` **with any `?…` query string removed** (Drupal image-style derivatives carry a `?h=…&itok=…` token). This stripping is required: GTM JS-escapes `=`/`&` to `\x3d`/`\x26` when substituting the value into a `ld+json` Custom HTML tag, which is **invalid JSON** ("bad escape sequence"). A query-less path only yields `\/`, which is valid JSON. The derivative still resolves (HTTP 200) without the token.
- On a page without that meta → returns the Pajulahti aerial as fallback

**Testing note:** When you paste a tag using `{{js.og.image.or.fallback}}` into validator.schema.org or RRT Code mode, the validator sees the literal `{{js.og.image.or.fallback}}` string as the image value — not a valid URL. Two ways to test:
1. **Pre-publish**: temporarily replace `{{js.og.image.or.fallback}}` with a real URL (e.g. the fallback) in the paste, validate, then revert.
2. **Post-publish**: use RRT in **URL mode** on a live page — RRT executes GTM, sees the substituted real URL, and validates the actual end result.

---

## B. Triggers (24 total)

| # | Trigger name | Type | Condition | Used by |
|---|---|---|---|---|
| A | All Pages — Page View | Page View | All Page Views | Tag 1, Tag 2 |
| AA | All Pages — DOM Ready | DOM Ready | All DOM Ready Events | Tag 6, Tag 7 |
| BB | All Pages — Window Loaded | Window Loaded | All Window Loaded Events | Tag 8 |
| B | Pajulahti Campus | Page View | `Page Path matches RegEx /(pajulahden-kampus\|pajulahti-campus)$` | Tag 3 |
| C | Kisakallio Campus | Page View | `Page Path matches RegEx /(kisakallion-kampus\|kisakallio-campus)$` | Tag 4 |
| D | Mäkelänrinne | Page View | `Page Path matches RegEx /(makelanrinteen-kampus\|makelanrinne-campus\|helsingin-kampus)$` | Tag 5 |
| E | Pajulahti Accommodation | Page View | `Page Path matches RegEx /(majoitus/pajulahti\|accommodation/pajulahti)$` | Tag 3a |
| F | Kisakallio Accommodation | Page View | `Page Path matches RegEx /(majoitus/kisakallio\|accommodation/kisakallio)$` | Tag 4a |
| G | Lake Pool Pajulahti | Page View | `Page Path matches RegEx /aktiviteetit/(lakepoolpajulahti\|lake-pool-pajulahti)$` | Tag 9 |
| H | Adventure Park | Page View | `Page Path matches RegEx /aktiviteetit/(seikkailupuisto\|adventure-park)$` | Tag 10 |
| I | Swimming Hall | Page View | `Page Path matches RegEx /aktiviteetit/pajulahden-uimahalli$` | Tag 11 |
| J | TAITO 360 | Page View | `Page Path matches RegEx /urheilun-palvelut/taito-360$` | Tag 12 |
| K | Recovery Center | Page View | `Page Path matches RegEx /urheilun-palvelut/(pajulahden-palautumiskeskus\|pajulahti-recovery-center)$` | Tag 13 |
| L | Sporttipassi | Page View | `Page Path matches RegEx /aktiviteetit/(kisakallion-sporttipassi\|kisakallio-sport-pass)$` | Tag 14 |
| M | Kisakallio Sauna | Page View | `Page Path matches RegEx /aktiviteetit/(kisakallion-rantasauna\|kisakallio-beach-sauna)$` | Tag 15 |
| N | Altitude Training | Page View | `Page Path matches RegEx /urheilun-palvelut/(korkeanpaikan-harjoittelu\|high-altitude-training)$` | Tag 16 |
| O | Testing Services | Page View | `Page Path matches RegEx /urheilun-palvelut/(testauspalvelut\|testing-services)$` | Tag 17 |
| P | Equipment Rental | Page View | `Page Path matches RegEx /aktiviteetit/(valine-ja-kenttavuokraus\|equipment-and-field-rental)$` | Tag 18 |
| Q | Restaurants | Page View | `Page Path matches RegEx /(ravintolapalvelut\|restaurant-services)$` | Tag 19 |
| R | Vocational Education | Page View | `Page Path matches RegEx /koulutus/koulutukset/ammatillinen-koulutus$` | Tag 20 |
| S | Apprenticeship | Page View | `Page Path matches RegEx /koulutus/koulutukset/oppisopimuskoulutus$` | Tag 21 |
| T | Continuing Education | Page View | `Page Path matches RegEx /koulutus/koulutukset/taydennyskoulutus$` | Tag 22 |
| U | Liberal Adult Education | Page View | `Page Path matches RegEx /koulutus/koulutukset/vapaan-sivistystyon-koulutus$` | Tag 23 |
| V | Avoimet työpaikat (per-job) | DOM Ready | `Page Path matches RegEx ^/fi/meista/avoimet-tyopaikat/[^/]+/?$` | Tag 24 |

---

## C. Tag bodies (final form, paste-ready)

Each tag below: **Tag type = Custom HTML**, **Consent = No additional consent required**.

---

### TAG 1 — Organization (sitewide)

**Trigger:** A — All Pages — Page View

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsOrganization", "EducationalOrganization", "Organization"],
  "@id": "https://www.kolmekampusta.fi/#organization",
  "name": "Kolmen kampuksen urheiluopisto",
  "legalName": "Kolmen kampuksen urheiluopisto Oy",
  "alternateName": ["Kolme kampusta", "Sports Institute of Three Campuses"],
  "url": "https://www.kolmekampusta.fi/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.kolmekampusta.fi/themes/custom/druidxp_demo_olivero/logo.svg",
    "width": 600,
    "height": 60
  },
  "image": "https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg",
  "taxID": "3250102-9",
  "vatID": "FI32501029",
  "foundingDate": "2021",
  "description": "Kolmen kampuksen urheiluopisto on virallinen koulutusorganisaatio, joka tarjoaa ammatillista koulutusta, vapaan sivistystyön koulutusta ja täydennyskoulutusta sekä monipuolisia urheilun, liikunnan ja vapaa-ajan palveluita Lahdessa, Lohjalla ja Helsingissä.",
  "areaServed": { "@type": "Country", "name": "Finland" },
  "knowsLanguage": ["fi", "en"],
  "sport": [
    "Alpine Skiing", "American Football", "Archery", "Athletics", "Badminton",
    "Basketball", "Beach Volleyball", "Biathlon", "Boccia", "Boxing",
    "Brazilian Jiu-Jitsu", "Canoeing", "Cheerleading", "Climbing", "Combat Sports",
    "Cross-Country Skiing", "CrossFit", "Curling", "Cycling", "Dance",
    "Disc Golf", "Diving", "Electric Wheelchair Floorball", "Endurance Sports",
    "Esports", "Figure Skating", "Floorball", "Football", "Goalball", "Golf",
    "Gymnastics", "Handball", "Hiking", "Hokutoryu Jujutsu", "Ice Hockey",
    "Ice Skating", "Ice Swimming", "Judo", "Karate", "Kayaking", "Kickboxing",
    "Kin-Ball", "Lacrosse", "Lifesaving", "Mixed Martial Arts", "Mountain Biking",
    "Muay Thai", "Nordic Combined", "Orienteering", "Padel", "Para Athletics",
    "Para Cycling", "Para Sports", "Para Swimming", "Pesäpallo", "Pickleball",
    "Powerchair Football", "Powerlifting", "Racket Sports", "Rhythmic Gymnastics",
    "Ringette", "Rowing", "Running", "Sailing", "Sitting Volleyball",
    "Ski Jumping", "Skiing", "Snowshoeing", "Speed Skating", "Squash", "Stand Up Paddleboarding",
    "Swimming", "Synchronised Skating", "Table Tennis", "Taekwondo", "Taido",
    "Tennis", "Trail Running", "Trampolining", "Triathlon", "Ultimate Frisbee",
    "Underwater Rugby", "Volleyball", "Water Cycling", "Water Polo",
    "Weight Training", "Wheelchair Basketball", "Wheelchair Rugby",
    "Wheelchair Tennis", "Wrestling"
  ],
  "location": [
    { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio#location" },
    { "@id": "https://www.kolmekampusta.fi/makelanrinne#location" }
  ],
  "sameAs": [
    "https://www.facebook.com/kolmekampusta",
    "https://www.instagram.com/kolmekampusta",
    "https://www.linkedin.com/company/18559086",
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
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
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
      "email": "pajulahti@kolmekampusta.fi",
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      }
    },
    {
      "@type": "ContactPoint",
      "telephone": "+358-44-7755-777",
      "contactType": "sales",
      "areaServed": "FI",
      "availableLanguage": ["Finnish", "English"],
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
        "opens": "09:00",
        "closes": "16:00"
      }
    }
  ]
}
</script>
```

---

### TAG 2 — WebSite (sitewide)

**Trigger:** A — All Pages — Page View

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.kolmekampusta.fi/#website",
  "url": "https://www.kolmekampusta.fi/",
  "name": "Kolmen kampuksen urheiluopisto",
  "alternateName": ["Kolme kampusta", "Sports Institute of Three Campuses"],
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

---

### TAG 3 — Pajulahti Campus (@graph: Place + EducationalOrganization)

**Trigger:** B — Pajulahti Campus

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SportsActivityLocation", "LodgingBusiness"],
      "@id": "https://www.kolmekampusta.fi/pajulahti#location",
      "name": "Pajulahti — Kolmen kampuksen urheiluopisto",
      "alternateName": "Pajulahden kampus",
      "url": "https://www.kolmekampusta.fi/fi/pajulahden-kampus",
      "image": ["{{js.og.image.or.fallback}}"],
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
        "latitude": 60.969189,
        "longitude": 25.943861
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
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
        { "@id": "https://www.kolmekampusta.fi/majoitus/pajulahti#lodging" },
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
        "American Football", "Archery", "Athletics", "Badminton", "Basketball",
        "Beach Volleyball", "Boccia", "Boxing", "Brazilian Jiu-Jitsu", "Canoeing",
        "Cheerleading", "Climbing", "Combat Sports", "Cross-Country Skiing", "CrossFit",
        "Cycling", "Dance", "Disc Golf", "Electric Wheelchair Floorball",
        "Endurance Sports", "Figure Skating", "Floorball", "Football", "Goalball",
        "Gymnastics", "Handball", "Hiking", "Hokutoryu Jujutsu", "Ice Hockey",
        "Ice Skating", "Ice Swimming", "Judo", "Karate", "Kayaking", "Kickboxing",
        "Lacrosse", "Lifesaving", "Mixed Martial Arts", "Mountain Biking", "Muay Thai",
        "Nordic Combined", "Orienteering", "Padel", "Para Athletics", "Para Cycling",
        "Para Sports", "Para Swimming", "Pesäpallo", "Pickleball", "Powerchair Football",
        "Powerlifting", "Racket Sports", "Rhythmic Gymnastics", "Ringette", "Rowing",
        "Running", "Sailing", "Sitting Volleyball", "Ski Jumping", "Skiing",
        "Snowshoeing", "Squash", "Stand Up Paddleboarding", "Swimming",
        "Synchronised Skating", "Table Tennis", "Taekwondo", "Taido", "Tennis",
        "Trail Running", "Trampolining", "Triathlon", "Ultimate Frisbee",
        "Underwater Rugby", "Volleyball", "Water Cycling", "Water Polo",
        "Weight Training", "Wheelchair Basketball", "Wheelchair Rugby",
        "Wheelchair Tennis", "Wrestling"
      ],
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "Lahti, Finland"
      },
      "priceRange": "€€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"],
      "sameAs": [
        "https://www.facebook.com/pajulahti1929",
        "https://www.instagram.com/pajulahti1929/",
        "https://www.youtube.com/@Pajulahti1929"
      ]
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://www.kolmekampusta.fi/pajulahti#educationalOrganization",
      "name": "Pajulahti — Kolmen kampuksen urheiluopisto (koulutusorganisaatio)",
      "alternateName": "Pajulahden koulutus",
      "url": "https://www.kolmekampusta.fi/fi/pajulahden-kampus",
      "description": "Pajulahden kampus toimii virallisena koulutusorganisaationa, joka tarjoaa ammatillista, vapaan sivistystyön ja täydennyskoulutusta liikunta-alalla.",
      "location": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
    }
  ]
}
</script>
```

---

### TAG 3a — Pajulahti Accommodation (Hotel/Resort)

**Trigger:** E — Pajulahti Accommodation

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["Resort", "Hotel"],
  "@id": "https://www.kolmekampusta.fi/majoitus/pajulahti#lodging",
  "name": "Pajulahti — Majoitus",
  "alternateName": ["Pajulahti Hotel", "Pajulahden majoitus"],
  "url": "https://www.kolmekampusta.fi/fi/majoitus/pajulahti",
  "description": "Pajulahden monipuolinen majoitustarjonta: hotelli, akatemia ja modernit villat järven rannalla. Olympic and Paralympic Training Center. Täyden palvelun urheilu- ja vapaa-ajankeskus Lahdessa.",
  "image": ["{{js.og.image.or.fallback}}"],
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
    "latitude": 60.969189,
    "longitude": 25.943861
  },
  "hasMap": "https://www.google.com/maps/place/Pajulahdentie+167,+15560+Nastola",
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"],
  "checkinTime": "15:00",
  "checkoutTime": "12:00",
  "petsAllowed": true,
  "smokingAllowed": false,
  "isAccessibleForFree": false,
  "publicAccess": true,
  "numberOfRooms": {
    "@type": "QuantitativeValue",
    "value": 136,
    "unitText": "rooms"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+358-44-7755-313",
    "email": "pajulahti@kolmekampusta.fi",
    "contactType": "reservations",
    "availableLanguage": ["Finnish", "English"]
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
  "potentialAction": {
    "@type": "ReserveAction",
    "name": "Varaa majoitus Pajulahdesta",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://kolmekampusta.willba.store/en?locationId=1",
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
  "brand": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "sameAs": [
    "https://www.facebook.com/pajulahti1929",
    "https://www.instagram.com/pajulahti1929/",
    "https://www.youtube.com/@Pajulahti1929"
  ]
}
</script>
```

---

### TAG 4 — Kisakallio Campus (@graph: Place + EducationalOrganization)

**Trigger:** C — Kisakallio Campus

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SportsActivityLocation", "LodgingBusiness"],
      "@id": "https://www.kolmekampusta.fi/kisakallio#location",
      "name": "Kisakallio — Kolmen kampuksen urheiluopisto",
      "alternateName": "Kisakallion kampus",
      "url": "https://www.kolmekampusta.fi/fi/kisakallion-kampus",
      "image": ["{{js.og.image.or.fallback}}"],
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
        "latitude": 60.321419,
        "longitude": 24.042815
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
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
        { "@id": "https://www.kolmekampusta.fi/majoitus/kisakallio#lodging" },
        { "@id": "https://www.kolmekampusta.fi/sporttipassi#facility" },
        { "@id": "https://www.kolmekampusta.fi/kisakallio-sauna#facility" },
        { "@id": "https://www.kolmekampusta.fi/restaurants/rantamakasiini#restaurant" }
      ],
      "sport": [
        "Alpine Skiing", "American Football", "Archery", "Athletics", "Badminton",
        "Basketball", "Beach Volleyball", "Biathlon", "Boccia", "Boxing",
        "Brazilian Jiu-Jitsu", "Canoeing", "Cheerleading", "Climbing", "Combat Sports",
        "Cross-Country Skiing", "CrossFit", "Curling", "Cycling", "Dance", "Disc Golf",
        "Electric Wheelchair Floorball", "Endurance Sports", "Figure Skating",
        "Floorball", "Football", "Goalball", "Gymnastics", "Handball", "Hiking",
        "Hokutoryu Jujutsu", "Ice Hockey", "Ice Skating", "Ice Swimming", "Judo",
        "Karate", "Kayaking", "Kickboxing", "Kin-Ball", "Lacrosse", "Lifesaving",
        "Mixed Martial Arts", "Mountain Biking", "Muay Thai", "Nordic Combined",
        "Orienteering", "Padel", "Para Athletics", "Para Cycling", "Para Sports",
        "Pesäpallo", "Pickleball", "Powerchair Football", "Powerlifting",
        "Racket Sports", "Rhythmic Gymnastics", "Ringette", "Rowing", "Running",
        "Sailing", "Sitting Volleyball", "Ski Jumping", "Skiing", "Snowshoeing",
        "Squash", "Stand Up Paddleboarding", "Synchronised Skating", "Table Tennis",
        "Taekwondo", "Taido", "Tennis", "Trail Running", "Trampolining", "Triathlon",
        "Ultimate Frisbee", "Underwater Rugby", "Volleyball", "Water Cycling",
        "Water Polo", "Weight Training", "Wheelchair Basketball", "Wheelchair Rugby",
        "Wheelchair Tennis", "Wrestling"
      ],
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "Lohja, Finland"
      },
      "priceRange": "€€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"],
      "sameAs": [
        "https://www.facebook.com/Kisakallio/",
        "https://www.instagram.com/kisakallio/",
        "https://www.youtube.com/@kisakalliotv"
      ]
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://www.kolmekampusta.fi/kisakallio#educationalOrganization",
      "name": "Kisakallio — Kolmen kampuksen urheiluopisto (koulutusorganisaatio)",
      "alternateName": "Kisakallion koulutus",
      "url": "https://www.kolmekampusta.fi/fi/kisakallion-kampus",
      "description": "Kisakallion kampus toimii virallisena koulutusorganisaationa, joka tarjoaa ammatillista, vapaan sivistystyön ja täydennyskoulutusta liikunta-alalla.",
      "location": { "@id": "https://www.kolmekampusta.fi/kisakallio#location" },
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
    }
  ]
}
</script>
```

---

### TAG 4a — Kisakallio Accommodation (Hotel/Resort)

**Trigger:** F — Kisakallio Accommodation

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
  "image": ["{{js.og.image.or.fallback}}"],
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
    "latitude": 60.321419,
    "longitude": 24.042815
  },
  "hasMap": "https://www.google.com/maps/place/Kaarina+Karin+tie+4,+08360+Lohja",
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"],
  "checkinTime": "15:00",
  "checkoutTime": "12:00",
  "petsAllowed": true,
  "smokingAllowed": false,
  "isAccessibleForFree": false,
  "publicAccess": true,
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+358-19-31511",
    "email": "kisakallio@kolmekampusta.fi",
    "contactType": "reservations",
    "availableLanguage": ["Finnish", "English"]
  },
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
  "potentialAction": {
    "@type": "ReserveAction",
    "name": "Varaa majoitus Kisakalliosta",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://kolmekampusta.willba.store/?locationId=34",
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
  "brand": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "sameAs": [
    "https://www.facebook.com/Kisakallio/",
    "https://www.instagram.com/kisakallio/",
    "https://www.youtube.com/@kisakalliotv"
  ]
}
</script>
```

---

### TAG 5 — Mäkelänrinne (@graph: Place + EducationalOrganization)

**Trigger:** D — Mäkelänrinne

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SportsActivityLocation",
      "@id": "https://www.kolmekampusta.fi/makelanrinne#location",
      "name": "Mäkelänrinne — Kolmen kampuksen urheiluopisto (Urhea)",
      "alternateName": "Helsingin kampus",
      "url": "https://www.kolmekampusta.fi/fi/makelanrinteen-kampus",
      "image": ["{{js.og.image.or.fallback}}"],
      "description": "Helsingin Mäkelänrinteessä pääkaupunkiseudun urheiluakatemia Urhean tiloissa. Liikunta- ja koulutuspalveluita pääkaupunkiseudun urheilijoille.",
      "telephone": "+358-44-7755-200",
      "email": "viestinta@kolmekampusta.fi",
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
        "latitude": 60.199632,
        "longitude": 24.947058
      },
      "amenityFeature": [
        {"@type": "LocationFeatureSpecification", "name": "Urhea-halli (multi-sport hall)", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Mäkelänrinne Swimming Hall (50m competition pool)", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Separate diving pool", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Public ball hall (floorball, volleyball, badminton, basketball)", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Gymnastics hall", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Combat sports area (judo, wrestling — 920 m²)", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Adjacent football fields (Kumpulanlaakso, Käpylä)", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Helsinki Velodrome (nearby)", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Mäkelänrinne Upper Secondary School (sports school)", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Water exercise classes", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Aquajogging", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Swimming schools", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Public swim hall access", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Public gym access", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Accessible facilities", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Sports school athlete services", "value": true}
      ],
      "sport": [
        "American Football", "Athletics", "Badminton", "Basketball", "Beach Volleyball",
        "Boxing", "Brazilian Jiu-Jitsu", "Climbing", "Combat Sports", "CrossFit",
        "Cycling", "Dance", "Diving", "Figure Skating", "Floorball", "Football", "Golf",
        "Gymnastics", "Handball", "Ice Hockey", "Judo", "Karate", "Kickboxing",
        "Mixed Martial Arts", "Muay Thai", "Orienteering", "Padel", "Pickleball",
        "Powerlifting", "Racket Sports", "Rhythmic Gymnastics", "Sailing",
        "Speed Skating", "Squash", "Swimming", "Synchronised Skating", "Table Tennis",
        "Tennis", "Trampolining", "Volleyball", "Weight Training", "Wrestling"
      ],
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "Helsinki, Finland"
      },
      "priceRange": "€€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"]
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://www.kolmekampusta.fi/makelanrinne#educationalOrganization",
      "name": "Mäkelänrinne — Kolmen kampuksen urheiluopisto (koulutusorganisaatio)",
      "alternateName": "Helsingin koulutus",
      "url": "https://www.kolmekampusta.fi/fi/makelanrinteen-kampus",
      "description": "Mäkelänrinteen kampus toimii pääkaupunkiseudun urheiluakatemia Urhean tiloissa, tarjoten liikunta- ja koulutuspalveluita pääkaupunkiseudun urheilijoille ja koulutettaville.",
      "location": { "@id": "https://www.kolmekampusta.fi/makelanrinne#location" },
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" },
      "memberOf": {
        "@type": "Organization",
        "name": "Pääkaupunkiseudun Urheiluakatemia Urhea",
        "url": "https://urhea.fi/"
      }
    }
  ]
}
</script>
```

---

### TAG 6 — Smart Content Tag (Article / NewsArticle / BlogPosting / SportsEvent / WebPage)

**Trigger:** AA — All Pages — DOM Ready

```html
<script>
(function() {
  var FALLBACK_IMAGE = "https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg";
  var ORG_ID  = "https://www.kolmekampusta.fi/#organization";
  var SITE_ID = "https://www.kolmekampusta.fi/#website";

  function meta(sel) {
    var el = document.querySelector(sel);
    return el ? el.getAttribute('content') : null;
  }
  function attr(sel, a) {
    var el = document.querySelector(sel);
    return el ? el.getAttribute(a) : null;
  }
  function clean(o) {
    if (Array.isArray(o)) {
      var arr = o.map(clean).filter(function(v){ return v !== null && v !== undefined && v !== ''; });
      return arr.length === 0 ? null : arr;
    }
    if (o && typeof o === 'object') {
      var out = {};
      Object.keys(o).forEach(function(k){
        var v = clean(o[k]);
        if (v !== null && v !== undefined && v !== '') out[k] = v;
      });
      return Object.keys(out).length === 0 ? null : out;
    }
    return o;
  }
  function inject(obj) {
    var cleaned = clean(obj);
    if (!cleaned) return;
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(cleaned);
    document.head.appendChild(s);
  }

  var bodyClass = document.body.className || '';
  var bundle = (bodyClass.match(/page-node-type-(\S+)/) || [])[1] || 'page';
  var isFront = /\bpath-frontpage\b/.test(bodyClass);

  var canonical = attr('link[rel="canonical"]', 'href') || location.href;
  var lang = document.documentElement.lang || 'fi';
  var ogTitle = meta('meta[property="og:title"]') || document.title;
  var ogDescription = meta('meta[property="og:description"]') || meta('meta[name="description"]');
  var ogImage = meta('meta[property="og:image"]');
  var ogImageWidth = meta('meta[property="og:image:width"]');
  var ogImageHeight = meta('meta[property="og:image:height"]');
  var ogImageAlt = meta('meta[property="og:image:alt"]');
  var ogUpdated = meta('meta[property="og:updated_time"]');

  var imageObj = ogImage ? {
    "@type": "ImageObject",
    "url": ogImage,
    "width": ogImageWidth ? parseInt(ogImageWidth, 10) : null,
    "height": ogImageHeight ? parseInt(ogImageHeight, 10) : null,
    "caption": ogImageAlt || null
  } : null;

  if (isFront) {
    inject({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": canonical + "#webpage",
      "url": canonical,
      "name": ogTitle,
      "description": ogDescription,
      "image": imageObj || FALLBACK_IMAGE,
      "inLanguage": lang,
      "isPartOf": { "@id": SITE_ID },
      "about": { "@id": ORG_ID },
      "publisher": { "@id": ORG_ID },
      "dateModified": ogUpdated
    });
    return;
  }

  if (bundle === 'article') {
    inject({
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": canonical + "#article",
      "mainEntityOfPage": canonical,
      "headline": ogTitle,
      "description": ogDescription,
      "image": imageObj,
      "datePublished": ogUpdated,
      "dateModified": ogUpdated,
      "author": { "@id": ORG_ID },
      "publisher": { "@id": ORG_ID },
      "inLanguage": lang,
      "isPartOf": { "@id": SITE_ID },
      "articleSection": "Article"
    });
    return;
  }

  if (bundle === 'news') {
    inject({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "@id": canonical + "#article",
      "mainEntityOfPage": canonical,
      "headline": ogTitle,
      "description": ogDescription,
      "image": imageObj,
      "datePublished": ogUpdated,
      "dateModified": ogUpdated,
      "author": { "@id": ORG_ID },
      "publisher": { "@id": ORG_ID },
      "inLanguage": lang,
      "isPartOf": { "@id": SITE_ID },
      "articleSection": "News"
    });
    return;
  }

  if (bundle === 'blog' || bundle === 'blogi' || /\/blogi\//.test(location.pathname)) {
    inject({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": canonical + "#blogposting",
      "mainEntityOfPage": canonical,
      "headline": ogTitle,
      "description": ogDescription,
      "image": imageObj,
      "datePublished": ogUpdated,
      "dateModified": ogUpdated,
      "author": { "@id": ORG_ID },
      "publisher": { "@id": ORG_ID },
      "inLanguage": lang,
      "isPartOf": { "@id": SITE_ID },
      "articleSection": "Blog"
    });
    return;
  }

  if (bundle === 'event') {
    var dateField = document.querySelector('.field--name-field-event__date');
    var times = dateField ? dateField.querySelectorAll('time[datetime]') : [];
    var timeStart = times[0] ? times[0].getAttribute('datetime') : null;
    var timeEnd = times[1] ? times[1].getAttribute('datetime') : null;

    if (timeStart) {
      var locNameEl = document.querySelector('.field--name-field-event__location-name .field__item');
      var locName = locNameEl ? locNameEl.textContent.trim() : null;

      var addrEl = document.querySelector('.field--name-field-event__location-address');
      var addrObj = null;
      if (addrEl) {
        var streetEl = addrEl.querySelector('.address-line1');
        var postalEl = addrEl.querySelector('.postal-code');
        var localityEl = addrEl.querySelector('.locality');
        if (streetEl && localityEl) {
          addrObj = {
            "@type": "PostalAddress",
            "streetAddress": streetEl.textContent.trim(),
            "postalCode": postalEl ? postalEl.textContent.trim() : null,
            "addressLocality": localityEl.textContent.trim(),
            "addressCountry": "FI"
          };
        }
      }

      // Campus venues are inlined in full (name + canonical address): the campus
      // Place entities (Tags 3/4/5) do NOT fire on event pages, so a bare
      // {"@id": ...} reference would leave Google with no location name/address.
      var CAMPUSES = {
        pajulahti:    { "@type": "Place", "name": "Pajulahti",    "address": { "@type": "PostalAddress", "streetAddress": "Pajulahdentie 167",  "postalCode": "15560", "addressLocality": "Nastola",  "addressRegion": "Päijät-Häme", "addressCountry": "FI" } },
        kisakallio:   { "@type": "Place", "name": "Kisakallio",   "address": { "@type": "PostalAddress", "streetAddress": "Kaarina Karin tie 4", "postalCode": "08360", "addressLocality": "Lohja",    "addressRegion": "Uusimaa",     "addressCountry": "FI" } },
        makelanrinne: { "@type": "Place", "name": "Mäkelänrinne", "address": { "@type": "PostalAddress", "streetAddress": "Mäkelänkatu 47",     "postalCode": "00550", "addressLocality": "Helsinki", "addressRegion": "Uusimaa",     "addressCountry": "FI" } }
      };
      var hay = ((locName || '') + ' ' + location.pathname + ' ' + (ogTitle || '')).toLowerCase();
      var campusKey = null;
      if (/pajulah/.test(hay)) campusKey = 'pajulahti';
      else if (/kisakall/.test(hay)) campusKey = 'kisakallio';
      else if (/m[aä]kel[aä]nrinne|urhea|helsing/.test(hay)) campusKey = 'makelanrinne';

      var eventLocation = null;
      if (campusKey) {
        eventLocation = CAMPUSES[campusKey];
      } else if (locName && addrObj) {
        eventLocation = { "@type": "Place", "name": locName, "address": addrObj };
      } else if (addrObj) {
        eventLocation = { "@type": "Place", "address": addrObj };
      }

      if (eventLocation) {
        inject({
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "@id": canonical + "#event",
          "name": ogTitle,
          "description": ogDescription,
          "image": imageObj,
          "url": canonical,
          "startDate": timeStart,
          "endDate": timeEnd || timeStart,
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "location": eventLocation,
          "organizer": { "@id": ORG_ID },
          "inLanguage": lang
        });
        return;
      }
    }
  }

  inject({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonical + "#webpage",
    "url": canonical,
    "name": ogTitle,
    "description": ogDescription,
    "image": imageObj,
    "inLanguage": lang,
    "isPartOf": { "@id": SITE_ID },
    "publisher": { "@id": ORG_ID },
    "dateModified": ogUpdated
  });
})();
</script>
```

---

### TAG 7 — Smart Section Tag (URL-based dispatch)

**Trigger:** AA — All Pages — DOM Ready

```html
<script>
(function() {
  var ORG_ID  = "https://www.kolmekampusta.fi/#organization";
  var SITE_ID = "https://www.kolmekampusta.fi/#website";

  function meta(sel) {
    var el = document.querySelector(sel);
    return el ? el.getAttribute('content') : null;
  }
  function clean(o) {
    if (Array.isArray(o)) {
      var arr = o.map(clean).filter(function(v){ return v !== null && v !== undefined && v !== ''; });
      return arr.length === 0 ? null : arr;
    }
    if (o && typeof o === 'object') {
      var out = {};
      Object.keys(o).forEach(function(k){
        var v = clean(o[k]);
        if (v !== null && v !== undefined && v !== '') out[k] = v;
      });
      return Object.keys(out).length === 0 ? null : out;
    }
    return o;
  }
  function inject(obj) {
    var cleaned = clean(obj);
    if (!cleaned) return;
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(cleaned);
    document.head.appendChild(s);
  }

  var path = location.pathname.replace(/^\/(fi|en|sv)\//, '/');
  var canonical = (document.querySelector('link[rel="canonical"]') || {}).href || location.href;
  var lang = document.documentElement.lang || 'fi';
  var ogTitle = meta('meta[property="og:title"]') || document.title;
  var ogDescription = meta('meta[property="og:description"]') || meta('meta[name="description"]');
  var ogImage = meta('meta[property="og:image"]');

  if (/^\/(meista|about-us)\/(yhteystiedot|contact-information)$/.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": canonical + "#contactpage",
      "url": canonical,
      "name": ogTitle,
      "description": ogDescription,
      "inLanguage": lang,
      "isPartOf": { "@id": SITE_ID },
      "about": { "@id": ORG_ID },
      "mainEntity": { "@id": ORG_ID }
    });
    return;
  }

  if (/^\/(meista|about-us)\//.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": canonical + "#aboutpage",
      "url": canonical,
      "name": ogTitle,
      "description": ogDescription,
      "inLanguage": lang,
      "isPartOf": { "@id": SITE_ID },
      "about": { "@id": ORG_ID }
    });
    return;
  }

  if (/^\/(ryhmat-ja-leirit|groups-and-camps)\//.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      "@id": canonical + "#trip",
      "name": ogTitle,
      "description": ogDescription,
      "image": ogImage,
      "url": canonical,
      "category": "Group accommodation and program package",
      "touristType": ["Schools", "Youth groups", "Confirmation camps"],
      "provider": { "@id": ORG_ID },
      "brand": { "@id": ORG_ID }
    });
    return;
  }

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
      "provider": { "@id": ORG_ID }
    });
    return;
  }

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

  if (/^\/yritykset\//.test(path) || /^\/businesses\//.test(path)) {
    inject({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": canonical + "#service",
      "name": ogTitle,
      "description": ogDescription,
      "image": ogImage,
      "url": canonical,
      "provider": { "@id": ORG_ID },
      "areaServed": { "@type": "Country", "name": "Finland" },
      "serviceType": "Corporate event services"
    });
    return;
  }
})();
</script>
```

---

### TAG 8 — Debug / Validation (optional)

**Trigger:** BB — All Pages — Window Loaded

```html
<script>
(function() {
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
})();
</script>
```

---

### TAG 9 — Lake Pool Pajulahti (PublicSwimmingPool)

**Trigger:** G — Lake Pool Pajulahti

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["PublicSwimmingPool", "SportsActivityLocation"],
  "@id": "https://www.kolmekampusta.fi/lakepool#facility",
  "name": "Lake Pool Pajulahti",
  "alternateName": "Pajulahden Lake Pool",
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/lakepoolpajulahti",
  "image": ["{{js.og.image.or.fallback}}"],
  "description": "Lake Pool yhdistää urheilulliset aktiviteetit, luontoa lähellä olevan tunnelman ja rennon oleskelun. Uimareille tarjolla 25 metrin uintiradat järvinäköalalla.",
  "telephone": "+358-44-7755-313",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "addressRegion": "Päijät-Häme",
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
  "priceRange": "€€",
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

### TAG 10 — Pajulahti Adventure Park

**Trigger:** H — Adventure Park

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsActivityLocation", "TouristAttraction"],
  "@id": "https://www.kolmekampusta.fi/seikkailupuisto#facility",
  "name": "Pajulahden Seikkailupuisto",
  "alternateName": "Pajulahti Adventure Park",
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/seikkailupuisto",
  "image": ["{{js.og.image.or.fallback}}"],
  "description": "Aktiivinen kiipeilypuisto, jossa seikkailijat etenevät käyttäen omaa kehoaan ja ongelmanratkaisutaitojaan. 14 erilaista rataa eri vaikeustasoilla.",
  "telephone": "+358-44-7755-810",
  "email": "seikkailupuisto@kolmekampusta.fi",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "addressRegion": "Päijät-Häme",
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
  "priceRange": "€€",
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

### TAG 11 — Pajulahti Swimming Hall

**Trigger:** I — Swimming Hall

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["PublicSwimmingPool", "SportsActivityLocation"],
  "@id": "https://www.kolmekampusta.fi/uimahalli#facility",
  "name": "Pajulahden uimahalli",
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/pajulahden-uimahalli",
  "image": ["{{js.og.image.or.fallback}}"],
  "description": "Pajulahden sisäuimahalli urheilijoille ja kaikenikäisille uimareille.",
  "telephone": "+358-44-7755-313",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "addressRegion": "Päijät-Häme",
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
  "priceRange": "€€",
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

### TAG 12 — TAITO 360 Motor Skills Area

**Trigger:** J — TAITO 360

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": "https://www.kolmekampusta.fi/taito360#facility",
  "name": "TAITO 360",
  "alternateName": "TAITO 360 motoristen taitojen harjoittelu- ja kuntoilualue",
  "url": "https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/taito-360",
  "image": ["{{js.og.image.or.fallback}}"],
  "description": "Motoristen taitojen harjoittelu- ja kuntoilualue Pajulahdessa. Monipuolinen alue koordinaation, ketteryyden ja toiminnallisen kunnon kehittämiseen.",
  "telephone": "+358-44-7755-313",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "addressRegion": "Päijät-Häme",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Motor skills training equipment", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Functional fitness area", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Agility and coordination training", "value": true}
  ],
  "sport": ["Functional Fitness", "Motor Skills", "Athletic Conditioning"],
  "priceRange": "€€",
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

### TAG 13 — Pajulahti Recovery Center

**Trigger:** K — Recovery Center

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["HealthClub", "MedicalBusiness"],
  "@id": "https://www.kolmekampusta.fi/recoverycenter#facility",
  "name": "Pajulahden palautumiskeskus",
  "alternateName": "Pajulahti Recovery Center",
  "url": "https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/pajulahden-palautumiskeskus",
  "image": ["{{js.og.image.or.fallback}}"],
  "description": "Urheilijoiden palautumiseen erikoistunut keskus Pajulahdessa. Modernit palautumismetodit ja huippuluokan asiantuntemus.",
  "telephone": "+358-44-7755-313",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "addressRegion": "Päijät-Häme",
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
  "priceRange": "€€",
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

### TAG 14 — Kisakallio Sporttipassi (SportsClub)

**Trigger:** L — Sporttipassi

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SportsClub",
  "@id": "https://www.kolmekampusta.fi/sporttipassi#facility",
  "name": "Kisakallion Sporttipassi",
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/kisakallion-sporttipassi",
  "image": ["{{js.og.image.or.fallback}}"],
  "description": "Kisakallion Sporttipassi tarjoaa pääsyn monipuolisiin urheilu- ja hyvinvointipalveluihin Kisakallion kampuksella.",
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
  "sport": ["Gymnastics", "Cheerleading", "Combat Sports", "Racket Sports", "Swimming", "Fitness"],
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"],
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/kisakallio#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

### TAG 15 — Kisakallio Sauna and Lake Swimming

**Trigger:** M — Kisakallio Sauna

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": "https://www.kolmekampusta.fi/kisakallio-sauna#facility",
  "name": "Kisakallion sauna ja uinti",
  "alternateName": ["Kisakallion rantasauna", "Kisakallio Beach Sauna"],
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/kisakallion-rantasauna",
  "image": ["{{js.og.image.or.fallback}}"],
  "description": "Kisakallion rantasauna Lohjanjärven rannalla. Saunan jälkeen rentoutuminen järvellä uimalla tai kahlailemalla.",
  "telephone": "+358-19-31511",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Kaarina Karin tie 4",
    "addressLocality": "Lohja",
    "addressRegion": "Uusimaa",
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
  "priceRange": "€€",
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/kisakallio#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

### TAG 16 — Altitude Training Facility

**Trigger:** N — Altitude Training

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsActivityLocation", "Service"],
  "@id": "https://www.kolmekampusta.fi/altitude#facility",
  "name": "Korkeanpaikan harjoittelu",
  "alternateName": "High-Altitude Training",
  "url": "https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/korkeanpaikan-harjoittelu",
  "image": ["{{js.og.image.or.fallback}}"],
  "description": "Korkeanpaikan harjoittelutila urheilijoiden suorituskyvyn parantamiseen. Hapenpuutosolosuhteissa tapahtuva harjoittelu.",
  "telephone": "+358-44-7755-313",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "addressRegion": "Päijät-Häme",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Altitude chamber", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Hypoxic training environment", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Performance monitoring equipment", "value": true}
  ],
  "priceRange": "€€",
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

### TAG 17 — Sports Performance Testing Services

**Trigger:** O — Testing Services

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["MedicalBusiness", "Service"],
  "@id": "https://www.kolmekampusta.fi/testing#facility",
  "name": "Testauspalvelut",
  "alternateName": "Sports Performance Testing Services",
  "url": "https://www.kolmekampusta.fi/fi/urheilu/urheilun-palvelut/testauspalvelut",
  "image": ["{{js.og.image.or.fallback}}"],
  "description": "Suorituskyvyn testaus ja analytiikkapalvelut urheilijoille ja kuntoilijoille. Modernit testimenetelmät ja huippuluokan asiantuntijatiimi.",
  "telephone": "+358-44-7755-313",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Nastola",
    "addressRegion": "Päijät-Häme",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "medicalSpecialty": ["SportsMedicine", "Physiotherapy"],
  "serviceType": "Sports performance testing and analysis",
  "areaServed": { "@type": "Country", "name": "Finland" },
  "priceRange": "€€",
  "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
  "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
</script>
```

---

### TAG 18 — Equipment and Field Rental

**Trigger:** P — Equipment Rental

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://www.kolmekampusta.fi/equipment-rental#service",
  "name": "Väline- ja kenttävuokraus",
  "alternateName": "Equipment and Field Rental",
  "url": "https://www.kolmekampusta.fi/fi/vapaa-aika/aktiviteetit/valine-ja-kenttavuokraus",
  "description": "Urheiluvälineiden ja liikuntakenttien vuokraus Pajulahdessa ja Kisakalliossa. Vuokrattavia kenttiä: tennis, sulkapallo, jalkapallo, koripallo, lentopallo, salibandy, käsipallo ja beach volley. Välineitä: tennis-, sulkapallo- ja padelmailoja sekä eri lajien palloja, verkkoja, mattoja ja harjoitusvälineitä. Lake Pool ja Lohjanjärvi: kajakit, kanootit, SUP-laudat, vesipyörät ja soutuveneet. Talvikaudella maastosukset, fatbiket ja lumikengät. Lisäksi polkupyörät, kickbiket ja frisbeegolfkiekot vapaa-ajan käyttöön.",
  "serviceType": "Sports equipment and venue rental",
  "provider": { "@id": "https://www.kolmekampusta.fi/#organization" },
  "areaServed": [
    { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio#location" }
  ]
}
</script>
```

---

### TAG 19 — Restaurants @graph (Iso-Kukkanen, Café Keihäs, Rantamakasiini)

**Trigger:** Q — Restaurants

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
      "image": ["{{js.og.image.or.fallback}}"],
      "description": "Pajulahden pääravintola. Monipuolinen ja maittava ruokavalikoima urheilijoille, vieraille ja paikallisille. Kanresta-konsernin operoima.",
      "telephone": "+358-44-7755-370",
      "email": "pajulahtivuorop@kanresta.fi",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Pajulahdentie 167",
        "addressLocality": "Nastola",
        "addressRegion": "Päijät-Häme",
        "postalCode": "15560",
        "addressCountry": "FI"
      },
      "servesCuisine": ["Finnish", "International", "Sports Nutrition"],
      "priceRange": "€€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"],
      "acceptsReservations": true,
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
      "image": ["{{js.og.image.or.fallback}}"],
      "description": "Pajulahden päivittäinen kahvila Ravintola Iso-Kukkasen rinnalla. Kahvilatuotteita ja kevyttä syötävää.",
      "telephone": "+358-44-7755-370",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Pajulahdentie 167",
        "addressLocality": "Nastola",
        "addressRegion": "Päijät-Häme",
        "postalCode": "15560",
        "addressCountry": "FI"
      },
      "servesCuisine": ["Coffee", "Pastries", "Light meals"],
      "priceRange": "€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "ePassi"],
      "containedInPlace": { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
      "parentOrganization": { "@id": "https://www.kolmekampusta.fi/#organization" }
    },
    {
      "@type": "Restaurant",
      "@id": "https://www.kolmekampusta.fi/restaurants/rantamakasiini#restaurant",
      "name": "Ravintola Rantamakasiini",
      "url": "https://www.kolmekampusta.fi/fi/ravintolapalvelut",
      "image": ["{{js.og.image.or.fallback}}"],
      "description": "Kisakallion ravintola Lohjanjärven rannalla. Sopii yritysjuhliin, seminaareihin ja erityistapahtumiin.",
      "telephone": "+358-50-529-6514",
      "email": "ravintola.kisakallio@kolmekampusta.fi",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Kaarina Karin tie 4",
        "addressLocality": "Lohja",
        "addressRegion": "Uusimaa",
        "postalCode": "08360",
        "addressCountry": "FI"
      },
      "servesCuisine": ["Finnish", "International", "Event Catering"],
      "priceRange": "€€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"],
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

---

### TAG 20 — Vocational Education Program (Ammatillinen koulutus)

**Trigger:** R — Vocational Education

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

---

### TAG 21 — Apprenticeship Program (Oppisopimuskoulutus)

**Trigger:** S — Apprenticeship

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

### TAG 22 — Continuing Education (Täydennyskoulutus)

**Trigger:** T — Continuing Education

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
  "location": [
    { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio#location" }
  ]
}
</script>
```

---

### TAG 23 — Liberal Adult Education (Vapaan sivistystyön koulutus)

**Trigger:** U — Liberal Adult Education

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
  "location": [
    { "@id": "https://www.kolmekampusta.fi/pajulahti#location" },
    { "@id": "https://www.kolmekampusta.fi/kisakallio#location" }
  ]
}
</script>
```

---

### TAG 24 — JobPosting auto-extract (Google for Jobs)

**Trigger:** V — Avoimet työpaikat (per-job)

This tag fires on every per-job page under `/fi/meista/avoimet-tyopaikat/{slug}` (but not the index page). It auto-extracts JobPosting fields from the Drupal DOM and emits JSON-LD only when all of Google's required fields (title, description, datePosted, hiringOrganization, jobLocation) succeed. Optional fields (validThrough, employmentType, image) are omitted gracefully if not detected.

**jobLocation strategy:** Always emits all 3 campuses (Pajulahti, Kisakallio, Mäkelänrinne) as the job location array, because the actual work campus is negotiable or unknown at posting time per content team. Inline addresses match Tags 3, 4 and 5 exactly; `@id` references link the JobPosting into the existing schema graph.

**Content-author conventions required for full extraction:**

| Field | Pattern expected in content | Example |
|---|---|---|
| title | Page title prefixed with "Avoin työpaikka: " (prefix is stripped) | "Avoin työpaikka: Valmennuskeskuspäällikkö" |
| validThrough | "viimeistään DD.MM.YYYY" anywhere in description | "viimeistään 15.6.2026" |
| employmentType | One of: "Määräaikainen", "Vakituinen", "Toistaiseksi", "Osa-aikainen", "Harjoittel-" | "Määräaikainen tehtävä 31.12.2028 saakka" |

If a convention is not met, the corresponding field is omitted but the tag still emits (graceful degradation). The JobPosting will still validate in Rich Results Test, but Google may show a warning for missing validThrough.

```html
<script>
(function() {
  // Tag 24 - JobPosting (Google for Jobs)
  //
  // Fires on per-job pages matching /fi/meista/avoimet-tyopaikat/{slug}
  // Auto-extracts JobPosting fields from Drupal DOM. Fields embedded in
  // the description text (validThrough, employmentType) are detected via
  // Finnish regex patterns.
  //
  // jobLocation: always lists all 3 campuses, because the actual work
  // campus is typically negotiable or not known at posting time.
  //
  // Emits JSON-LD only if Google's required fields (title, description,
  // datePosted) all succeed. Optional fields (validThrough,
  // employmentType, image) are omitted gracefully when not detected.

  var ORG_ID = "https://www.kolmekampusta.fi/#organization";
  var ORG_NAME_FALLBACK = "Kolmen kampuksen urheiluopisto Oy";
  var ORG_URL = "https://www.kolmekampusta.fi/";

  var CAMPUSES = [
    {
      "@id": "https://www.kolmekampusta.fi/pajulahti#location",
      "@type": "Place",
      "name": "Pajulahti",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Pajulahdentie 167",
        "postalCode": "15560",
        "addressLocality": "Nastola",
        "addressRegion": "Päijät-Häme",
        "addressCountry": "FI"
      }
    },
    {
      "@id": "https://www.kolmekampusta.fi/kisakallio#location",
      "@type": "Place",
      "name": "Kisakallio",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Kaarina Karin tie 4",
        "postalCode": "08360",
        "addressLocality": "Lohja",
        "addressRegion": "Uusimaa",
        "addressCountry": "FI"
      }
    },
    {
      "@id": "https://www.kolmekampusta.fi/makelanrinne#location",
      "@type": "Place",
      "name": "Mäkelänrinne",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Mäkelänkatu 47",
        "postalCode": "00550",
        "addressLocality": "Helsinki",
        "addressRegion": "Uusimaa",
        "addressCountry": "FI"
      }
    }
  ];

  var MONTHS_FI = {
    'tammikuu': '01', 'tammikuuta': '01',
    'helmikuu': '02', 'helmikuuta': '02',
    'maaliskuu': '03', 'maaliskuuta': '03',
    'huhtikuu': '04', 'huhtikuuta': '04',
    'toukokuu': '05', 'toukokuuta': '05',
    'kesäkuu': '06', 'kesäkuuta': '06',
    'heinäkuu': '07', 'heinäkuuta': '07',
    'elokuu': '08', 'elokuuta': '08',
    'syyskuu': '09', 'syyskuuta': '09',
    'lokakuu': '10', 'lokakuuta': '10',
    'marraskuu': '11', 'marraskuuta': '11',
    'joulukuu': '12', 'joulukuuta': '12'
  };

  function pad2(n) { return String(n).length === 1 ? '0' + n : String(n); }

  // === Required: title ===
  var titleEl = document.querySelector('h1.node__title');
  if (!titleEl) return;
  var titleText = titleEl.textContent.trim();
  var title = titleText.replace(/^\s*Avoin\s+työpaikka\s*[:\-–—]?\s*/i, '').trim();
  if (!title) return;

  // === Required: description ===
  var descEl = document.querySelector('.field--name-field-content');
  if (!descEl) return;
  var descriptionHtml = descEl.innerHTML.trim();
  var descriptionText = descEl.textContent;
  if (!descriptionHtml) return;

  // === Required: datePosted ===
  var dateEl = document.querySelector('.node__meta span');
  var datePosted = null;
  if (dateEl) {
    var dateText = dateEl.textContent.trim();
    var dm = dateText.match(/(\d{1,2})\s+([a-zäöA-ZÄÖ]+)\s+(\d{4})/);
    if (dm) {
      var month = MONTHS_FI[dm[2].toLowerCase()];
      if (month) datePosted = dm[3] + '-' + month + '-' + pad2(dm[1]);
    }
    if (!datePosted) {
      var dn = dateText.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (dn) datePosted = dn[3] + '-' + pad2(dn[2]) + '-' + pad2(dn[1]);
    }
  }
  if (!datePosted) return;

  // === Required: hiringOrganization ===
  var orgEl = document.querySelector('.field--name-field-description');
  var orgName = (orgEl && orgEl.textContent.trim()) || ORG_NAME_FALLBACK;

  // === Optional: image ===
  var imageUrl = null;
  var imageEl = document.querySelector('.field--name-field-media-image img');
  if (imageEl) {
    var src = imageEl.getAttribute('src');
    if (src) {
      try { imageUrl = new URL(src, location.origin).href; } catch (e) {}
    }
  }

  // === Optional: validThrough — pattern "viimeistään DD.MM.YYYY" ===
  var validThrough = null;
  var vm = descriptionText.match(/viimeist[äa]{1,2}n\s+(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
  if (vm) {
    validThrough = vm[3] + '-' + pad2(vm[2]) + '-' + pad2(vm[1]) + 'T23:59:59+03:00';
  }

  // === Optional: employmentType — Finnish keywords ===
  var employmentType = null;
  if (/m[äa]{1,2}r[äa]{1,2}aikai/i.test(descriptionText)) employmentType = 'TEMPORARY';
  else if (/vakituin|toistaiseksi/i.test(descriptionText)) employmentType = 'FULL_TIME';
  else if (/osa[-\s]?aikai/i.test(descriptionText)) employmentType = 'PART_TIME';
  else if (/harjoittel/i.test(descriptionText)) employmentType = 'INTERN';

  // === Build schema ===
  var schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": title,
    "description": descriptionHtml,
    "datePosted": datePosted,
    "url": location.href,
    "hiringOrganization": {
      "@id": ORG_ID,
      "@type": "Organization",
      "name": orgName,
      "url": ORG_URL
    },
    "jobLocation": CAMPUSES,
    "directApply": false
  };

  if (validThrough) schema.validThrough = validThrough;
  if (employmentType) schema.employmentType = employmentType;
  if (imageUrl) schema.image = imageUrl;

  // === Emit ===
  var s = document.createElement('script');
  s.type = 'application/ld+json';
  s.text = JSON.stringify(schema);
  document.head.appendChild(s);
})();
</script>
```

---

## D. Cookiebot consent configuration

For every tag in this document: in GTM → Tag → **Advanced Settings → Consent Settings → No additional consent required**. Schema markup is metadata (not tracking), so it fires regardless of cookie consent state.

If Cookiebot is configured to block the GTM container until consent (rare), check Cookiebot settings → Configuration → Your Scripts → ensure `googletagmanager.com` is allowed pre-consent OR categorized as "Necessary".

---

## E. Final note

This file is the production source of truth. The original master plan (`kolmekampusta-gtm-schema.md`) and the change record (`kolmekampusta-gtm-schema-refined.md`) remain for historical reference but should not be used for paste-into-GTM operations.
