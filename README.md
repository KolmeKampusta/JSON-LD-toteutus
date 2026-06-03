# JSON-LD Toteutus — kolmekampusta.fi

Schema.org-strukturoidun datan toteutus Kolmen kampuksen urheiluopiston (kolmekampusta.fi) verkkosivustolle Google Tag Managerin (GTM) kautta. 26 schema.org-tagia kattaa organisaation, kolme kampusta, majoituspalvelut, liikuntatilat, ravintolat, koulutusohjelmat, avoimet työpaikat (Google for Jobs) ja sivuston yleisen rakenteen.

GTM container: `GTM-WD3C92NG`

## Files

| File / folder | Purpose |
|---|---|
| **`gtm-tags-production.md`** | Master file — all 26 tag bodies + variables + triggers + constants. The canonical source for production. |
| **`tags/`** | Per-tag files (26 × `.html`), one per GTM tag. Paste each into its corresponding GTM Custom HTML tag. |
| **`tags/README.md`** | Tag file index + GTM variable requirement note |
| **`scripts/`** | Python test scripts to speed up validator.schema.org / RRT testing |
| **`scripts/README.md`** | Usage docs for `validate.py`, `open-rrt.py`, `open-validator.py` |
| **`information-roundup.md`** | Fact-check document — every piece of data in the tags, in plain English, organized for verification (narrative format) |
| **`organization-facts-checklist.txt`** | Flat plain-text checklist of every fact in every tag — one line per field with `[ ]` markers for verification. Regenerable via `_build_facts_checklist.js` |
| **`_build_facts_checklist.js`** | Node script that scans `tags/*.html` and outputs the facts checklist |
| **`gtm-deployment-guide.md`** | Comprehensive step-by-step for GTM deployment + Search Console indexing |
| **`seo-yhteenveto-suomeksi.docx`** | Finnish executive summary for non-tech readers |
| **`seo-jatkotehtavat-suomeksi.docx`** | Finnish SEO development roadmap for the next 6–24 months (post-schema work) |
| **`_build_docx.js`** | Node script that builds the Finnish executive summary Word document |
| **`_build_jatkotehtavat_docx.js`** | Node script that builds the Finnish SEO roadmap Word document |
| **`_build_gtm_container.js`** | Node script that builds a GTM Import Container JSON from `tags/*.html` for bulk-deploying all 26 tags, 24 triggers, and 12 variables in one operation |
| `gtm-container-import.json` | Generated GTM container import file (regenerable via `_build_gtm_container.js`). Import via GTM → Admin → Container Settings → Import Container with "Merge" option |
| `kolmekampusta-gtm-schema.md` | Original master plan (frozen, historical) |
| `kolmekampusta-gtm-schema-refined.md` | Audit + refinement record (historical) |

## Quick start — deploy to production

Follow `gtm-deployment-guide.md` end-to-end. Estimated ~3 hours total spread across a day:

1. **Phase A** — Local validation (~30 min): install Python + pyperclip, run `scripts/open-validator.py` and `scripts/open-rrt.py`.
2. **Phase B** — GTM setup (~90 min): create 1 Custom JavaScript variable, 11 constants (optional), 23 triggers, 25 tags.
3. **Phase C** — Preview test (~30 min): 13 representative URLs.
4. **Phase D** — Publish (~5 min).
5. **Phase E** — Live verification (~10 min): RRT URL mode on 5 spot-check pages.
6. **Phase F** — Search Console indexing (~15 min): URL Inspection + Request Indexing on 12 representative URLs.
7. **Phase G** — Monitor (passive, 1–8 weeks): Search Console Enhancements report.

## Key principles

- **Master file (`gtm-tags-production.md`) and per-tag files (`tags/`) must always match.** When one changes, change the other.
- **Image variable `js.og.image.or.fallback`** is REQUIRED before any of Tags 3, 3a, 4, 4a, 5, 9–17, 19 fires correctly. Create it first in GTM.
- **Tag 1's "sport-on-Org" validator warnings are expected** (multi-typing accepted). Google handles it correctly.
- **"No items detected" in RRT** for Tags 2, 18, 20–23 is **normal** — those schema types have no current Google rich result feature. Schema is still valid and goes into the Knowledge Graph.
- **For RRT validation of tags using image variable**: temporarily swap `{{js.og.image.or.fallback}}` for a real URL when pasting into Code mode. Or use RRT URL mode against the published live page.

## Regenerating the Finnish Word documents

```powershell
npm install docx --no-save
node _build_docx.js              # → seo-yhteenveto-suomeksi.docx (schema implementation summary)
node _build_jatkotehtavat_docx.js # → seo-jatkotehtavat-suomeksi.docx (post-schema SEO roadmap)
```

**Warning**: regenerating overwrites any manual edits made in Word. For minor touch-ups, edit Word directly; for major rewrites, edit the corresponding `_build_*.js` and rebuild.

`seo-yhteenveto-suomeksi.docx` covers what the schema implementation does, why, and how to maintain it. `seo-jatkotehtavat-suomeksi.docx` covers the next-phase SEO work (Google Business Profile, Core Web Vitals, content strategy, schema extensions like JobPosting, technical maintenance, AI-search optimisation) — written for the management team and content owners, not just technical staff.

## Contact

- Tekninen ylläpito: Jussi Saarinen, 3K ICT-asiantuntija
- Sivusto: https://www.kolmekampusta.fi/
- Sivuston tekninen toteutus: Druid (Drupal XP -alustalla)

## License

Internal use, Kolmen kampuksen urheiluopisto. Sisältää julkista yritystietoa (osoitteet, puhelinnumerot, kuvaukset) ja julkisia schema.org-merkintöjä.
