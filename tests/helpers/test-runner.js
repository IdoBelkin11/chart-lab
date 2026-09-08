// ---------------------------------------------------------------------------
// Minimal async test runner. No dependencies on purpose — this is a static
// site with a build script, not a project that needs Jest/Mocha for what is
// fundamentally "run some assertions against pure functions and log the
// result." Every test file in this project uses this instead of hand-rolling
// its own forEach/async wrapping, which is exactly what went wrong twice in
// the same afternoon during development: `.forEach(async ...)` does not wait
// for iterations to finish before the summary line prints, silently making a
// broken suite report as passing.
// ---------------------------------------------------------------------------
let suiteResults = [];

async function describe(suiteName, fn){
  const suite = { name: suiteName, passed: 0, failed: 0, failures: [] };
  const ctx = {
    check(label, condition){
      if(condition){ suite.passed++; }
      else { suite.failed++; suite.failures.push(label); }
    },
    equal(label, actual, expected){
      const ok = actual === expected;
      if(!ok) suite.failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      if(ok) suite.passed++; else suite.failed++;
    }
  };
  await fn(ctx);
  suiteResults.push(suite);
  const status = suite.failed === 0 ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${suiteName} — ${suite.passed} passed, ${suite.failed} failed`);
  suite.failures.forEach(f => console.log('   ✗ ' + f));
}

function finalizeSuites(){
  const totalPassed = suiteResults.reduce((a,s) => a + s.passed, 0);
  const totalFailed = suiteResults.reduce((a,s) => a + s.failed, 0);
  console.log(`\n${totalFailed === 0 ? '✓' : '✗'} TOTAL: ${totalPassed} passed, ${totalFailed} failed across ${suiteResults.length} suite(s)`);
  if(totalFailed > 0) process.exitCode = 1;
  const results = suiteResults;
  suiteResults = []; // reset for the next file loaded into the same process
  return results;
}

module.exports = { describe, finalizeSuites };
