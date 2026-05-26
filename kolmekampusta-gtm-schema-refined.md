# kolmekampusta.fi — Refined GTM schema plan (post-audit + investigation)

**Date:** 2026-05-16
**Supersedes:** the relevant sections of `kolmekampusta-gtm-schema.md` (master). Tags not listed here are unchanged from the master.
**Status:** ready for GTM build.

## A. Changes summary

| Tag | Change |
|---|---|
| Constants | Add fallback image; Willba URLs are now per-campus |
| Tag 1 | `sameAs` cleaned up (joint accounts only); Pajulahti contactPoint gains 24/7 hours; **`educationalCredentialAwarded` and `hasOccupationalProgram` removed — invalid on `EducationalOrganization` type per schema.org. Relationship preserved via `provider` on Tags 20–23** |
| Tag 3 (Pajulahti campus) | `addressLocality` → Lahti; precise geo; `containsPlace` adds `#lodging`; per-campus `sameAs` added |
| Tag 3a (Pajulahti accommodation) | `addressLocality` → Lahti; precise geo; `numberOfRooms` → 136 with `unitText: "rooms"`; `availableLanguage` moved into a `contactPoint`; `makesOffer` dropped (no price); Willba URL → per-campus; per-campus `sameAs` |
| Tag 4 (Kisakallio campus) | Precise geo; `containsPlace` adds `#lodging`; per-campus `sameAs` |
| Tag 4a (Kisakallio accommodation) | Precise geo; `availableLanguage` moved into `contactPoint`; `makesOffer` dropped; Willba URL → per-campus; per-campus `sameAs` |
| Tag 5 (Mäkelänrinne) | Precise geo; `EducationalOrganization` typing confirmed (educational content offered here too); enriched with `image`, `email`, `amenityFeature` (16 facilities from analysis), `priceRange`, `currenciesAccepted`, `paymentAccepted` |
| Tag 6 (Smart Content) | Major rewrite: Drupal SmartDate selectors for event start/end, Drupal location field for event venue, fallback image for homepage, articleSection on Article, blog handles both class names, no-op ternary removed, `clean()` drops empty objects/arrays, falls through to WebPage if event location undetectable |
| Tag 7 (Smart Section) | Restaurant branch DELETED (Tag 19 supersedes); sports camps branch DELETED (aggregator pages, not single events); holiday packages branch DELETED (no price extractable); Course fallback emits basic Course (no `hasCourseInstance`); group/youth camps `offers` removed (no price); URL paths now require trailing-segment boundary |
| Tag 8 | Unchanged content; trigger changes to Window Loaded |
| Tags 9–13, 15–17 | Unchanged |
| Tag 14 | `paymentAccepted` updated to full payment list; `makesOffer` dropped (no price) |
| Tag 18 | `offers` dropped (no price) |
| Tag 19 | Drop `hasMenu` from Iso-Kukkanen (was self-referential to landing page); full body with `paymentAccepted` updates per restaurant |
| Tags 20–21 | Unchanged (qualification lists confirmed; application dates kept as Finnish national joint application defaults) |
| Tags 22–23 | `offers` dropped (no price) |
| Triggers | All single-page triggers anchored with `$`; Tag 6/7 reassigned to DOM Ready; Tag 8 reassigned to Window Loaded |

---

## B. Section 6 — Constants (updated)

Create these as GTM User-Defined Variables → Constant.

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

These constants are referenced as `{{const.X}}` inside GTM Custom HTML if you want to template, but the tag code below hardcodes the values for clarity/portability.

---

## C. Section 7 — Revised tag bodies

Each tag is **GTM Custom HTML**, **Consent: No additional consent required**, and uses the trigger named in section D.

### TAG 1 — Organization (sitewide)

**Trigger:** Trigger A — All Pages (Page View)

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

**Trigger:** Trigger A — All Pages (Page View)

Unchanged from master. Code reproduced for completeness:

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

### TAG 3 — LocalBusiness: Pajulahti Campus

**Trigger:** Trigger B — Pajulahti Campus

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
    "addressLocality": "Lahti",
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
}
</script>
```

---

### TAG 3a — Pajulahti Accommodation (Hotel/Resort)

**Trigger:** Trigger E — Pajulahti Accommodation

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
  "image": [
    "https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg"
  ],
  "telephone": "+358-44-7755-313",
  "email": "pajulahti@kolmekampusta.fi",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pajulahdentie 167",
    "addressLocality": "Lahti",
    "addressRegion": "Päijät-Häme",
    "postalCode": "15560",
    "addressCountry": "FI"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 60.969189,
    "longitude": 25.943861
  },
  "hasMap": "https://www.google.com/maps/place/Pajulahdentie+167,+15560+Lahti",
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

### TAG 4 — LocalBusiness: Kisakallio Campus

**Trigger:** Trigger C — Kisakallio Campus

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
}
</script>
```

---

### TAG 4a — Kisakallio Accommodation (Hotel/Resort)

**Trigger:** Trigger F — Kisakallio Accommodation

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

### TAG 5 — LocalBusiness: Mäkelänrinne (Helsinki/Urhea)

**Trigger:** Trigger D — Mäkelänrinne

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["SportsActivityLocation", "EducationalOrganization"],
  "@id": "https://www.kolmekampusta.fi/makelanrinne#location",
  "name": "Mäkelänrinne — Kolmen kampuksen urheiluopisto (Urhea)",
  "alternateName": "Helsingin kampus",
  "url": "https://www.kolmekampusta.fi/fi/makelanrinteen-kampus",
  "image": [
    "https://www.kolmekampusta.fi/sites/default/files/styles/16_7_1800x800_focal_point_webp/public/2025-06/urheakampusilmakuva.webp?h=0472238f&itok=OTge1aZ_"
  ],
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
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"],
  "memberOf": {
    "@type": "Organization",
    "name": "Pääkaupunkiseudun Urheiluakatemia Urhea",
    "url": "https://urhea.fi/"
  }
}
</script>
```

---

### TAG 6 — Smart Content Tag (Article / NewsArticle / BlogPosting / SportsEvent / WebPage)

**Trigger:** Trigger AA — All Pages (DOM Ready)

Detects content type from body class. Uses Drupal SmartDate field (`.field--name-field-event__date`) for event start/end dates and `.field--name-field-event__location-*` for event venue/address. Falls through to WebPage when required fields can't be extracted. Hardcodes a fallback image on the homepage where Drupal Metatag emits no `og:image`.

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
  // Note: Drupal Metatag on this site does not emit article:published_time, article:modified_time,
  // article:author, or event:start_time. og:updated_time is the only date signal available.

  var imageObj = ogImage ? {
    "@type": "ImageObject",
    "url": ogImage,
    "width": ogImageWidth ? parseInt(ogImageWidth, 10) : null,
    "height": ogImageHeight ? parseInt(ogImageHeight, 10) : null,
    "caption": ogImageAlt || null
  } : null;

  // Homepage
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

  // Article
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

  // NewsArticle
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

  // BlogPosting — body class is page-node-type-blog (confirmed); 'blogi' and URL fallback for safety
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

  // SportsEvent — uses Drupal SmartDate field; falls through to WebPage if location can't be resolved
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

      var campusId = null;
      var lowerName = (locName || '').toLowerCase();
      if (/pajulahti/.test(lowerName)) campusId = "https://www.kolmekampusta.fi/pajulahti#location";
      else if (/kisakallio/.test(lowerName)) campusId = "https://www.kolmekampusta.fi/kisakallio#location";
      else if (/(makelanrinne|mäkelänrinne|helsink|urhea)/.test(lowerName)) campusId = "https://www.kolmekampusta.fi/makelanrinne#location";

      var eventLocation = null;
      if (campusId) {
        eventLocation = { "@id": campusId };
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
    // If we get here: required fields could not be extracted → fall through to generic WebPage below
  }

  // Fallback: generic WebPage
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

**Trigger:** Trigger AA — All Pages (DOM Ready)

Quality-over-coverage: branches that previously emitted incomplete entities (Tag 7 restaurant duplicating Tag 19; SportsEvent on Drupal Views aggregators; Product/Course without required pricing/schedule) are now omitted — those URLs fall through to Tag 6's WebPage.

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

  // ===== Contact page (exact) =====
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

  // ===== About pages (other /meista/*) =====
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

  // ===== Restaurant services landing — Tag 19 handles this URL with the proper @graph =====
  // (Restaurant branch deliberately removed. Do not re-add.)

  // ===== Group/youth camps (single-product pages: leirikoulu, luokkaretki, rippileiri) =====
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
      "provider": { "@id": ORG_ID },
      "brand": { "@id": ORG_ID }
    });
    return;
  }

  // ===== Vocational course fallback (for /koulutus/koulutukset/* not handled by Tags 20-23) =====
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

  // ===== Sports camps DELIBERATELY OMITTED =====
  // /fi/urheilu/leirit/* are Drupal Views aggregators listing multiple events as teasers,
  // not single events. No SportsEvent semantics fit. Tag 6 emits WebPage as fallback.

  // ===== Holiday packages DELIBERATELY OMITTED =====
  // /fi/vapaa-aika/lomat-ja-kurssit/* would need price for valid Product/Offer schema.

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
      "provider": { "@id": ORG_ID },
      "areaServed": { "@type": "Country", "name": "Finland" },
      "serviceType": "Corporate event services"
    });
    return;
  }

  // No matching section → Tag 6 handles the page
})();
</script>
```

---

### TAG 8 — Debug / Validation (optional, staging only)

**Trigger:** Trigger BB — All Pages (Window Loaded)

Unchanged content from master. Trigger changes from "All Pages (Page View)" to "Window Loaded" so the debug tag runs after all schema-injecting tags have completed.

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

### Tags 9–18 — Unchanged

Use the bodies from the master plan (`kolmekampusta-gtm-schema.md` section 7) verbatim. Triggers use the anchored regex from section D below.

| Tag | Trigger |
|---|---|
| TAG 9 — Lake Pool Pajulahti | Trigger G |
| TAG 10 — Pajulahti Adventure Park | Trigger H |
| TAG 11 — Pajulahti Swimming Hall | Trigger I |
| TAG 12 — TAITO 360 | Trigger J |
| TAG 13 — Pajulahti Recovery Center | Trigger K |
| TAG 14 — Kisakallio Sporttipassi | Trigger L |
| TAG 15 — Kisakallio Sauna | Trigger M |
| TAG 16 — Altitude Training | Trigger N |
| TAG 17 — Testing Services | Trigger O |
| TAG 18 — Equipment Rental | Trigger P |

---

### TAG 14 — Sporttipassi (three patches vs master)

**Trigger:** Trigger L — Sporttipassi

**Patch 1 — simplify `@type`:**
```json
"@type": ["SportsClub", "Service"],
```
to:
```json
"@type": "SportsClub",
```

**Patch 2 — update `paymentAccepted`:**
```json
"paymentAccepted": ["Cash", "Credit Card", "Invoice"],
```
to:
```json
"paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Invoice", "ePassi"],
```

**Patch 3 — delete the entire `makesOffer` block** (no price → incomplete Offer per Google):
```json
"makesOffer": {
  "@type": "Offer",
  "name": "Sporttipassi-jäsenyys",
  "priceCurrency": "EUR",
  "availability": "https://schema.org/InStock"
}
```
Remove this property and the preceding comma if it leaves a trailing comma in the JSON.

---

### TAG 18 — Equipment Rental (patch vs master)

**Trigger:** Trigger P — Equipment Rental

**Delete the entire `offers` block** (no price → incomplete Offer):
```json
"offers": {
  "@type": "Offer",
  "priceCurrency": "EUR",
  "availability": "https://schema.org/InStock",
  "seller": { "@id": "https://www.kolmekampusta.fi/#organization" }
}
```
Remove this property and fix any trailing comma.

---

### TAG 19 — Restaurants @graph (full revised body)

**Trigger:** Trigger Q — Restaurants

Changes from master: (a) `hasMenu` dropped from Iso-Kukkanen, (b) `paymentAccepted` updated across all 3 restaurants (cafe gets smaller subset), (c) `addressLocality` "Nastola" → "Lahti" for Pajulahti-area restaurants. Use this body verbatim:

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
        "addressLocality": "Lahti",
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
      "description": "Pajulahden päivittäinen kahvila Ravintola Iso-Kukkasen rinnalla. Kahvilatuotteita ja kevyttä syötävää.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Pajulahdentie 167",
        "addressLocality": "Lahti",
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

### Tags 20–21 — Unchanged

Use the bodies from the master plan verbatim. Triggers from section D.

| Tag | Trigger |
|---|---|
| TAG 20 — Vocational Education | Trigger R |
| TAG 21 — Apprenticeship | Trigger S |

Qualification lists confirmed accurate per ops. Application dates retained as Finnish national joint application defaults (2026-02-17 / 2026-03-17).

---

### TAG 22 — Continuing Education (patch vs master)

**Trigger:** Trigger T — Continuing Education

**Delete the entire `offers` block** (no price → incomplete Offer):
```json
"offers": {
  "@type": "Offer",
  "category": "Paid education",
  "priceCurrency": "EUR",
  "availability": "https://schema.org/InStock"
}
```
Everything else unchanged. Remove any trailing comma.

---

### TAG 23 — Liberal Adult Education (patch vs master)

**Trigger:** Trigger U — Liberal Adult Education

**Delete the entire `offers` block** (no price → incomplete Offer):
```json
"offers": {
  "@type": "Offer",
  "category": "Adult education",
  "priceCurrency": "EUR",
  "availability": "https://schema.org/InStock"
}
```
Everything else unchanged. Remove any trailing comma.

---

## D. Section 8 — Triggers (revised)

Create these as GTM Triggers. Single-page triggers are anchored with `$` so subpages don't accidentally fire.

### Trigger A — All Pages (Page View)
- Type: Page View (`gtm.js`)
- Fires on: All Page Views
- Used by: Tag 1, Tag 2

### Trigger AA — All Pages (DOM Ready)
- Type: DOM Ready (`gtm.dom`)
- Fires on: All Page Views
- Used by: Tag 6, Tag 7

### Trigger BB — All Pages (Window Loaded)
- Type: Window Loaded (`gtm.load`)
- Fires on: All Page Views
- Used by: Tag 8

### Trigger B — Pajulahti Campus
- Type: Page View
- Condition: `Page Path` `matches RegEx` `/(pajulahden-kampus|pajulahti-campus)$`
- Used by: Tag 3

### Trigger C — Kisakallio Campus
- Type: Page View
- Condition: `Page Path` `matches RegEx` `/(kisakallion-kampus|kisakallio-campus)$`
- Used by: Tag 4

### Trigger D — Mäkelänrinne
- Type: Page View
- Condition: `Page Path` `matches RegEx` `/(makelanrinteen-kampus|makelanrinne-campus|helsingin-kampus)$`
- Used by: Tag 5

### Trigger E — Pajulahti Accommodation
- Type: Page View
- Condition: `Page Path` `matches RegEx` `/(majoitus/pajulahti|accommodation/pajulahti)$`
- Used by: Tag 3a

### Trigger F — Kisakallio Accommodation
- Type: Page View
- Condition: `Page Path` `matches RegEx` `/(majoitus/kisakallio|accommodation/kisakallio)$`
- Used by: Tag 4a

### Trigger G — Lake Pool Pajulahti
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/(lakepoolpajulahti|lake-pool-pajulahti)$`
- Used by: Tag 9

### Trigger H — Adventure Park
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/(seikkailupuisto|adventure-park)$`
- Used by: Tag 10

### Trigger I — Swimming Hall
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/pajulahden-uimahalli$`
- Used by: Tag 11

### Trigger J — TAITO 360
- Condition: `Page Path` `matches RegEx` `/urheilun-palvelut/taito-360$`
- Used by: Tag 12

### Trigger K — Recovery Center
- Condition: `Page Path` `matches RegEx` `/urheilun-palvelut/(pajulahden-palautumiskeskus|pajulahti-recovery-center)$`
- Used by: Tag 13

### Trigger L — Sporttipassi
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/(kisakallion-sporttipassi|kisakallio-sport-pass)$`
- Used by: Tag 14

### Trigger M — Kisakallio Sauna
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/(kisakallion-rantasauna|kisakallio-beach-sauna)$`
- Used by: Tag 15

### Trigger N — Altitude Training
- Condition: `Page Path` `matches RegEx` `/urheilun-palvelut/(korkeanpaikan-harjoittelu|high-altitude-training)$`
- Used by: Tag 16

### Trigger O — Testing Services
- Condition: `Page Path` `matches RegEx` `/urheilun-palvelut/(testauspalvelut|testing-services)$`
- Used by: Tag 17

### Trigger P — Equipment Rental
- Condition: `Page Path` `matches RegEx` `/aktiviteetit/(valine-ja-kenttavuokraus|equipment-and-field-rental)$`
- Used by: Tag 18

### Trigger Q — Restaurants
- Condition: `Page Path` `matches RegEx` `/(ravintolapalvelut|restaurant-services)$`
- Used by: Tag 19

### Trigger R — Vocational Education
- Condition: `Page Path` `matches RegEx` `/koulutus/koulutukset/ammatillinen-koulutus$`
- Used by: Tag 20

### Trigger S — Apprenticeship
- Condition: `Page Path` `matches RegEx` `/koulutus/koulutukset/oppisopimuskoulutus$`
- Used by: Tag 21

### Trigger T — Continuing Education
- Condition: `Page Path` `matches RegEx` `/koulutus/koulutukset/taydennyskoulutus$`
- Used by: Tag 22

### Trigger U — Liberal Adult Education
- Condition: `Page Path` `matches RegEx` `/koulutus/koulutukset/vapaan-sivistystyon-koulutus$`
- Used by: Tag 23

---

## E. Build readiness checklist

Before publishing the GTM container to production:

1. [ ] Create 11 constants per section B
2. [ ] Create 23 triggers per section D (A, AA, BB, B–U)
3. [ ] Create 25 tags (Tags 1–8, 9–18, 19, 20–23) per section C and master plan
4. [ ] Set every tag to "No additional consent required" in Advanced Settings → Consent Settings
5. [ ] Preview-test each tag on at least one representative URL
6. [ ] Run Rich Results Test for each page type
7. [ ] Verify Tag 8 console output shows expected `@type`+`@id` pairs on each test page
8. [ ] Disable Tag 8 (or move to Staging environment only) before publish
9. [ ] Publish container
10. [ ] Submit affected URLs to Search Console URL Inspection for re-crawl
11. [ ] Monitor Search Console Enhancements report over the following 1–2 weeks
