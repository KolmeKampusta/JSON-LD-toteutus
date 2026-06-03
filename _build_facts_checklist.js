// =================================================================
// Facts Checklist Generator
// =================================================================
//
// Reads all tag files in tags/ and produces a flat, scannable
// plain-text checklist of every factual claim in the schema data.
//
// Output: organization-facts-checklist.txt
//
// Use the output to verify each fact. Mark items:
//   [ ] = unchecked
//   [X] = verified correct
//   [!] = found error (note correction next to it)
//
// For dynamic JS tags (6, 7, 8, 24): the data is read from the live
// page DOM at runtime — there are no hardcoded facts to verify here.
// Those tags are noted but their actual extracted values can only be
// inspected on live pages via browser DevTools.
//
// Usage: node _build_facts_checklist.js
// =================================================================

const fs = require('fs');
const path = require('path');

const TAGS_DIR = 'tags';
const OUTPUT_FILE = 'organization-facts-checklist.txt';

// Dynamic JS tags (no static data to extract — read DOM at runtime)
const DYNAMIC_TAGS = new Set([
  'tag-06-smart-content.html',
  'tag-07-smart-section.html',
  'tag-08-debug.html',
  'tag-24-jobposting.html'
]);

// =================================================================
// Helpers
// =================================================================

function indent(level) {
  return '  '.repeat(level);
}

// Recursively flatten a JSON-LD object into [ ] field: value lines
function flatten(obj, level = 0) {
  const lines = [];
  for (const key of Object.keys(obj)) {
    const val = obj[key];

    // Skip @context everywhere (boilerplate, not a fact)
    if (key === '@context') continue;

    if (val === null || val === undefined) {
      continue;
    }

    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      lines.push(`${indent(level)}[ ] ${key}: ${val}`);
    } else if (Array.isArray(val)) {
      // Array of primitives → one line with count, items below
      if (val.length === 0) {
        lines.push(`${indent(level)}[ ] ${key}: (empty)`);
      } else if (val.every(v => typeof v === 'string' || typeof v === 'number')) {
        lines.push(`${indent(level)}[ ] ${key} (${val.length} items):`);
        val.forEach(v => lines.push(`${indent(level + 2)}- ${v}`));
      } else {
        // Array of objects → number each item
        lines.push(`${indent(level)}${key} (${val.length} items):`);
        val.forEach((item, i) => {
          if (typeof item === 'object' && item !== null) {
            const typeLabel = item['@type'] ? ` (${item['@type']})` : '';
            const idLabel   = item['@id']   ? ` ${item['@id']}` : '';
            lines.push(`${indent(level + 1)}--- item ${i + 1}${typeLabel}${idLabel} ---`);
            lines.push(...flatten(item, level + 1));
          } else {
            lines.push(`${indent(level + 2)}- ${item}`);
          }
        });
      }
    } else if (typeof val === 'object') {
      // For an object reference (just @id) — keep as single line
      const keys = Object.keys(val);
      if (keys.length === 1 && keys[0] === '@id') {
        lines.push(`${indent(level)}[ ] ${key} → ${val['@id']}`);
      } else {
        lines.push(`${indent(level)}${key}:`);
        lines.push(...flatten(val, level + 1));
      }
    }
  }
  return lines;
}

// =================================================================
// Main
// =================================================================

const files = fs.readdirSync(TAGS_DIR)
  .filter(f => f.match(/^tag-\d+/))
  .sort((a, b) => {
    // Natural sort by tag number (so tag-3a comes between tag-03 and tag-04)
    const numA = parseInt(a.match(/^tag-(\d+)/)[1], 10);
    const numB = parseInt(b.match(/^tag-(\d+)/)[1], 10);
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
  });

let output = '';
output += '='.repeat(70) + '\n';
output += 'ORGANIZATION FACTS — CHECK LIST\n';
output += '='.repeat(70) + '\n';
output += '\n';
output += 'Generated from tags/*.html — review each line for accuracy.\n';
output += '\n';
output += 'Marking conventions:\n';
output += '  [ ] = unchecked\n';
output += '  [X] = verified correct\n';
output += '  [!] = found error — write the correction next to it\n';
output += '\n';
output += 'Dynamic JS tags (6, 7, 8, 24): the data is read from the live page\n';
output += 'DOM at runtime — no hardcoded facts to verify here. Test those\n';
output += 'tags on the live site via browser DevTools instead.\n';
output += '\n';
output += 'When you find an error: tell Jussi which tag and which field, with\n';
output += 'the correct value. Both gtm-tags-production.md and the matching\n';
output += 'file in /tags/ will be updated together.\n';
output += '\n';

let totalTags = 0;
let totalFacts = 0;

for (const file of files) {
  totalTags++;

  output += '\n' + '='.repeat(70) + '\n';
  output += file + '\n';
  output += '='.repeat(70) + '\n';

  if (DYNAMIC_TAGS.has(file)) {
    output += '\n(DYNAMIC JS tag — reads data from live page DOM at runtime.)\n';
    output += '(No static facts to verify here. Test on live page with DevTools.)\n';
    continue;
  }

  const content = fs.readFileSync(path.join(TAGS_DIR, file), 'utf8');

  // Extract the JSON-LD block(s) — strip the <script> wrapper
  const matches = [...content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

  if (matches.length === 0) {
    output += '\n(No <script type="application/ld+json"> block found.)\n';
    continue;
  }

  for (const match of matches) {
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch (e) {
      output += '\n(Could not parse JSON-LD: ' + e.message + ')\n';
      continue;
    }

    // If there's an @graph, each entry is a top-level entity
    if (data['@graph'] && Array.isArray(data['@graph'])) {
      data['@graph'].forEach((entity, i) => {
        const type = entity['@type'] || '(no type)';
        const id   = entity['@id']   || '(no id)';
        output += '\n--- @graph entity ' + (i + 1) + ': ' + JSON.stringify(type) + ' ---\n';
        output += '@id: ' + id + '\n';
        const lines = flatten(entity, 0);
        totalFacts += lines.filter(l => l.includes('[ ]')).length;
        output += lines.join('\n') + '\n';
      });
    } else {
      const type = data['@type'] || '(no type)';
      const id   = data['@id']   || '';
      output += '\n@type: ' + JSON.stringify(type) + '\n';
      if (id) output += '@id: ' + id + '\n';
      const lines = flatten(data, 0);
      totalFacts += lines.filter(l => l.includes('[ ]')).length;
      output += lines.join('\n') + '\n';
    }
  }
}

output += '\n' + '='.repeat(70) + '\n';
output += 'TOTAL: ' + totalTags + ' tag files processed, ' + totalFacts + ' facts to verify.\n';
output += '='.repeat(70) + '\n';

fs.writeFileSync(OUTPUT_FILE, output);

console.log('OK: ' + OUTPUT_FILE + ' created');
console.log('  ' + totalTags + ' tag files processed');
console.log('  ' + totalFacts + ' facts extracted for verification');
