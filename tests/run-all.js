#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Runs every *.test.js file under tests/, in a fresh process each (each test
// file loads its own copy of the engine via tests/helpers/load-engine.js —
// see that file for why: it must always reflect current src/, never a
// cached/stale build).
//
// Usage: node tests/run-all.js
// ---------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function findTestFiles(dir){
  let results = [];
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()) results = results.concat(findTestFiles(full));
    else if(entry.name.endsWith('.test.js')) results.push(full);
  }
  return results;
}

const testDir = __dirname;
const files = findTestFiles(testDir).sort();
console.log(`Running ${files.length} test files...\n`);

let anyFailed = false;
for(const file of files){
  console.log(`── ${path.relative(process.cwd(), file)} ──`);
  try{
    execFileSync('node', [file], { stdio: 'inherit' });
  }catch(e){
    anyFailed = true;
  }
  console.log('');
}

if(anyFailed){
  console.log('✗ One or more test files reported failures.');
  process.exit(1);
}else{
  console.log('✓ All test files passed.');
}
