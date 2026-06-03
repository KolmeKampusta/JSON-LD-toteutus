// =================================================================
// GTM Container Generator
// =================================================================
//
// Reads all tags from tags/*.html and produces a single JSON file
// (gtm-container-import.json) ready for GTM's "Import Container"
// feature.
//
// Format mirrors the actual GTM export from container GTM-WD3C92NG
// (saved at _audit_html/gtm-export-reference.json).
//
// Usage:
//   node _build_gtm_container.js
//
// Then in GTM:
//   Admin → Container Settings → Import Container
//   → Choose JSON file: gtm-container-import.json
//   → Choose Workspace: "New Workspace" (recommended name: "Schema rollout")
//   → Import Option: "Merge" (safer - keeps existing Cookiebot/GA/Hotjar untouched)
//   → Continue → Review → Confirm
//
// =================================================================

const fs = require('fs');
const path = require('path');

const ACCOUNT_ID    = '6298275043';
const CONTAINER_ID  = '221787341';
const PUBLIC_ID     = 'GTM-WD3C92NG';
const CONTAINER_NAME = 'www.kolmekampusta.fi';
const OUTPUT_FILE   = 'gtm-container-import.json';
const TAGS_DIR      = 'tags';

// =================================================================
// TRIGGERS (24 total)
// =================================================================

const TRIGGERS = [
  // 3 sitewide triggers
  { id: '1001', name: 'All Pages — Page View',     type: 'PAGEVIEW' },
  { id: '1002', name: 'All Pages — DOM Ready',     type: 'DOM_READY' },
  { id: '1003', name: 'All Pages — Window Loaded', type: 'WINDOW_LOADED' },

  // 20 URL-anchored Page View triggers
  { id: '1004', name: 'Pajulahti Campus',         type: 'PAGEVIEW', regex: '/(pajulahden-kampus|pajulahti-campus)$' },
  { id: '1005', name: 'Kisakallio Campus',        type: 'PAGEVIEW', regex: '/(kisakallion-kampus|kisakallio-campus)$' },
  { id: '1006', name: 'Mäkelänrinne',   type: 'PAGEVIEW', regex: '/(makelanrinteen-kampus|makelanrinne-campus|helsingin-kampus)$' },
  { id: '1007', name: 'Pajulahti Accommodation',  type: 'PAGEVIEW', regex: '/(majoitus/pajulahti|accommodation/pajulahti)$' },
  { id: '1008', name: 'Kisakallio Accommodation', type: 'PAGEVIEW', regex: '/(majoitus/kisakallio|accommodation/kisakallio)$' },
  { id: '1009', name: 'Lake Pool Pajulahti',      type: 'PAGEVIEW', regex: '/aktiviteetit/(lakepoolpajulahti|lake-pool-pajulahti)$' },
  { id: '1010', name: 'Adventure Park',           type: 'PAGEVIEW', regex: '/aktiviteetit/(seikkailupuisto|adventure-park)$' },
  { id: '1011', name: 'Swimming Hall',            type: 'PAGEVIEW', regex: '/aktiviteetit/pajulahden-uimahalli$' },
  { id: '1012', name: 'TAITO 360',                type: 'PAGEVIEW', regex: '/urheilun-palvelut/taito-360$' },
  { id: '1013', name: 'Recovery Center',          type: 'PAGEVIEW', regex: '/urheilun-palvelut/(pajulahden-palautumiskeskus|pajulahti-recovery-center)$' },
  { id: '1014', name: 'Sporttipassi',             type: 'PAGEVIEW', regex: '/aktiviteetit/(kisakallion-sporttipassi|kisakallio-sport-pass)$' },
  { id: '1015', name: 'Kisakallio Sauna',         type: 'PAGEVIEW', regex: '/aktiviteetit/(kisakallion-rantasauna|kisakallio-beach-sauna)$' },
  { id: '1016', name: 'Altitude Training',        type: 'PAGEVIEW', regex: '/urheilun-palvelut/(korkeanpaikan-harjoittelu|high-altitude-training)$' },
  { id: '1017', name: 'Testing Services',         type: 'PAGEVIEW', regex: '/urheilun-palvelut/(testauspalvelut|testing-services)$' },
  { id: '1018', name: 'Equipment Rental',         type: 'PAGEVIEW', regex: '/aktiviteetit/(valine-ja-kenttavuokraus|equipment-and-field-rental)$' },
  { id: '1019', name: 'Restaurants',              type: 'PAGEVIEW', regex: '/(ravintolapalvelut|restaurant-services)$' },
  { id: '1020', name: 'Vocational Education',     type: 'PAGEVIEW', regex: '/koulutus/koulutukset/ammatillinen-koulutus$' },
  { id: '1021', name: 'Apprenticeship',           type: 'PAGEVIEW', regex: '/koulutus/koulutukset/oppisopimuskoulutus$' },
  { id: '1022', name: 'Continuing Education',     type: 'PAGEVIEW', regex: '/koulutus/koulutukset/taydennyskoulutus$' },
  { id: '1023', name: 'Liberal Adult Education',  type: 'PAGEVIEW', regex: '/koulutus/koulutukset/vapaan-sivistystyon-koulutus$' },

  // 1 URL-anchored DOM Ready trigger
  { id: '1024', name: 'Avoimet työpaikat (per-job)', type: 'DOM_READY', regex: '^/fi/meista/avoimet-tyopaikat/[^/]+/?$' }
];

// =================================================================
// TAGS (26 total)
// =================================================================

const TAGS = [
  { id: '2001', name: 'Schema — Tag 1 — Organization',              file: 'tag-01-organization.html',              trigger: 'All Pages — Page View' },
  { id: '2002', name: 'Schema — Tag 2 — WebSite',                    file: 'tag-02-website.html',                   trigger: 'All Pages — Page View' },
  { id: '2003', name: 'Schema — Tag 3 — Pajulahti Campus',           file: 'tag-03-pajulahti-campus.html',          trigger: 'Pajulahti Campus' },
  { id: '2004', name: 'Schema — Tag 3a — Pajulahti Accommodation',   file: 'tag-03a-pajulahti-accommodation.html',  trigger: 'Pajulahti Accommodation' },
  { id: '2005', name: 'Schema — Tag 4 — Kisakallio Campus',          file: 'tag-04-kisakallio-campus.html',         trigger: 'Kisakallio Campus' },
  { id: '2006', name: 'Schema — Tag 4a — Kisakallio Accommodation',  file: 'tag-04a-kisakallio-accommodation.html', trigger: 'Kisakallio Accommodation' },
  { id: '2007', name: 'Schema — Tag 5 — Mäkelänrinne',     file: 'tag-05-makelanrinne.html',              trigger: 'Mäkelänrinne' },
  { id: '2008', name: 'Schema — Tag 6 — Smart Content',              file: 'tag-06-smart-content.html',             trigger: 'All Pages — DOM Ready' },
  { id: '2009', name: 'Schema — Tag 7 — Smart Section',              file: 'tag-07-smart-section.html',             trigger: 'All Pages — DOM Ready' },
  { id: '2010', name: 'Schema — Tag 8 — Debug',                      file: 'tag-08-debug.html',                     trigger: 'All Pages — Window Loaded' },
  { id: '2011', name: 'Schema — Tag 9 — Lake Pool',                  file: 'tag-09-lake-pool.html',                 trigger: 'Lake Pool Pajulahti' },
  { id: '2012', name: 'Schema — Tag 10 — Adventure Park',            file: 'tag-10-adventure-park.html',            trigger: 'Adventure Park' },
  { id: '2013', name: 'Schema — Tag 11 — Swimming Hall',             file: 'tag-11-swimming-hall.html',             trigger: 'Swimming Hall' },
  { id: '2014', name: 'Schema — Tag 12 — TAITO 360',                 file: 'tag-12-taito-360.html',                 trigger: 'TAITO 360' },
  { id: '2015', name: 'Schema — Tag 13 — Recovery Center',           file: 'tag-13-recovery-center.html',           trigger: 'Recovery Center' },
  { id: '2016', name: 'Schema — Tag 14 — Sporttipassi',              file: 'tag-14-sporttipassi.html',              trigger: 'Sporttipassi' },
  { id: '2017', name: 'Schema — Tag 15 — Kisakallio Sauna',          file: 'tag-15-kisakallio-sauna.html',          trigger: 'Kisakallio Sauna' },
  { id: '2018', name: 'Schema — Tag 16 — Altitude Training',         file: 'tag-16-altitude-training.html',         trigger: 'Altitude Training' },
  { id: '2019', name: 'Schema — Tag 17 — Testing Services',          file: 'tag-17-testing-services.html',          trigger: 'Testing Services' },
  { id: '2020', name: 'Schema — Tag 18 — Equipment Rental',          file: 'tag-18-equipment-rental.html',          trigger: 'Equipment Rental' },
  { id: '2021', name: 'Schema — Tag 19 — Restaurants',               file: 'tag-19-restaurants.html',               trigger: 'Restaurants' },
  { id: '2022', name: 'Schema — Tag 20 — Vocational Education',      file: 'tag-20-vocational-education.html',      trigger: 'Vocational Education' },
  { id: '2023', name: 'Schema — Tag 21 — Apprenticeship',            file: 'tag-21-apprenticeship.html',            trigger: 'Apprenticeship' },
  { id: '2024', name: 'Schema — Tag 22 — Continuing Education',      file: 'tag-22-continuing-education.html',      trigger: 'Continuing Education' },
  { id: '2025', name: 'Schema — Tag 23 — Liberal Adult Education',   file: 'tag-23-liberal-adult-education.html',   trigger: 'Liberal Adult Education' },
  { id: '2026', name: 'Schema — Tag 24 — JobPosting',                file: 'tag-24-jobposting.html',                trigger: 'Avoimet työpaikat (per-job)' }
];

// =================================================================
// VARIABLES (12 total: 1 Custom JS + 11 Constants)
// =================================================================

const JS_VARIABLE = {
  id: '3001',
  name: 'js.og.image.or.fallback',
  code: "function() {\n  var meta = document.querySelector('meta[property=\"og:image\"]');\n  if (meta && meta.getAttribute('content')) {\n    return meta.getAttribute('content');\n  }\n  // Fallback when og:image is missing (currently only the homepage on this site)\n  return 'https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg';\n}"
};

const CONSTANTS = [
  { id: '3002', name: 'const.site.url',            value: 'https://www.kolmekampusta.fi' },
  { id: '3003', name: 'const.org.id',              value: 'https://www.kolmekampusta.fi/#organization' },
  { id: '3004', name: 'const.website.id',          value: 'https://www.kolmekampusta.fi/#website' },
  { id: '3005', name: 'const.org.name',            value: 'Kolmen kampuksen urheiluopisto' },
  { id: '3006', name: 'const.org.legalName',       value: 'Kolmen kampuksen urheiluopisto Oy' },
  { id: '3007', name: 'const.org.taxID',           value: '3250102-9' },
  { id: '3008', name: 'const.org.logo',            value: 'https://www.kolmekampusta.fi/themes/custom/druidxp_demo_olivero/logo.svg' },
  { id: '3009', name: 'const.org.email.general',   value: 'info@kolmekampusta.fi' },
  { id: '3010', name: 'const.site.image.fallback', value: 'https://www.kolmekampusta.fi/sites/default/files/2025-06/pajulahti_ilmakuva_ns_web_0869.jpg' },
  { id: '3011', name: 'const.willba.pajulahti',    value: 'https://kolmekampusta.willba.store/en?locationId=1' },
  { id: '3012', name: 'const.willba.kisakallio',   value: 'https://kolmekampusta.willba.store/?locationId=34' }
];

// =================================================================
// BUILDERS
// =================================================================

function buildTrigger(t) {
  const trigger = {
    accountId: ACCOUNT_ID,
    containerId: CONTAINER_ID,
    triggerId: t.id,
    name: t.name,
    type: t.type
  };
  if (t.regex) {
    trigger.filter = [
      {
        type: 'MATCH_REGEX',
        parameter: [
          { type: 'TEMPLATE', key: 'arg0', value: '{{Page Path}}' },
          { type: 'TEMPLATE', key: 'arg1', value: t.regex }
        ]
      }
    ];
  }
  return trigger;
}

function buildTag(t, triggerLookup) {
  const filePath = path.join(TAGS_DIR, t.file);
  if (!fs.existsSync(filePath)) {
    throw new Error('Tag file missing: ' + filePath);
  }
  const html = fs.readFileSync(filePath, 'utf8');
  const triggerId = triggerLookup[t.trigger];
  if (!triggerId) {
    throw new Error('Trigger not found in TRIGGERS list: "' + t.trigger + '" (referenced by ' + t.name + ')');
  }
  return {
    accountId: ACCOUNT_ID,
    containerId: CONTAINER_ID,
    tagId: t.id,
    name: t.name,
    type: 'html',
    parameter: [
      { type: 'TEMPLATE', key: 'html', value: html },
      { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }
    ],
    firingTriggerId: [triggerId],
    tagFiringOption: 'ONCE_PER_EVENT',
    monitoringMetadata: { type: 'MAP' },
    consentSettings: { consentStatus: 'NOT_NEEDED' }
  };
}

function buildJsVariable(v) {
  return {
    accountId: ACCOUNT_ID,
    containerId: CONTAINER_ID,
    variableId: v.id,
    name: v.name,
    type: 'jsm',
    parameter: [
      { type: 'TEMPLATE', key: 'javascript', value: v.code }
    ],
    formatValue: {}
  };
}

function buildConstant(v) {
  return {
    accountId: ACCOUNT_ID,
    containerId: CONTAINER_ID,
    variableId: v.id,
    name: v.name,
    type: 'c',
    parameter: [
      { type: 'TEMPLATE', key: 'value', value: v.value }
    ]
  };
}

// =================================================================
// MAIN
// =================================================================

const triggerLookup = {};
TRIGGERS.forEach(t => { triggerLookup[t.name] = t.id; });

const triggers  = TRIGGERS.map(buildTrigger);
const tags      = TAGS.map(t => buildTag(t, triggerLookup));
const variables = [buildJsVariable(JS_VARIABLE)].concat(CONSTANTS.map(buildConstant));

// Preserve built-in variables already enabled in the container
const builtInVariables = [
  { accountId: ACCOUNT_ID, containerId: CONTAINER_ID, type: 'PAGE_URL',      name: 'Page URL' },
  { accountId: ACCOUNT_ID, containerId: CONTAINER_ID, type: 'PAGE_HOSTNAME', name: 'Page Hostname' },
  { accountId: ACCOUNT_ID, containerId: CONTAINER_ID, type: 'PAGE_PATH',     name: 'Page Path' },
  { accountId: ACCOUNT_ID, containerId: CONTAINER_ID, type: 'REFERRER',      name: 'Referrer' },
  { accountId: ACCOUNT_ID, containerId: CONTAINER_ID, type: 'EVENT',         name: 'Event' }
];

const container = {
  exportFormatVersion: 2,
  exportTime: '2026-06-03 12:00:00',
  containerVersion: {
    path: 'accounts/' + ACCOUNT_ID + '/containers/' + CONTAINER_ID + '/versions/0',
    accountId: ACCOUNT_ID,
    containerId: CONTAINER_ID,
    containerVersionId: '0',
    container: {
      path: 'accounts/' + ACCOUNT_ID + '/containers/' + CONTAINER_ID,
      accountId: ACCOUNT_ID,
      containerId: CONTAINER_ID,
      name: CONTAINER_NAME,
      publicId: PUBLIC_ID,
      usageContext: ['WEB'],
      tagIds: [PUBLIC_ID]
    },
    tag: tags,
    trigger: triggers,
    variable: variables,
    builtInVariable: builtInVariables
  }
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(container, null, 4));

console.log('OK: ' + OUTPUT_FILE + ' created');
console.log('  ' + tags.length + ' tags');
console.log('  ' + triggers.length + ' triggers');
console.log('  ' + variables.length + ' variables (1 JS + ' + CONSTANTS.length + ' constants)');
console.log('  ' + builtInVariables.length + ' built-in variables');
