// Calculator math — pure functions, tested against known correct values
// independently of any UI, per the explicit "test independently from the
// UI" requirement.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  const engine = loadEngine();

  await describe('compound interest', async (t) => {
    // 1000 * 1.07^10 = 1967.15...
    const r = engine.compoundInterest(1000, 7, 10, 0);
    t.check('matches the standard compound interest formula', Math.abs(r.futureValue - 1967.15) < 0.01);
    t.equal('total contributed with no yearly addition is just the principal', r.totalContributed, 1000);
    t.check('growth is future value minus contributed', Math.abs(r.totalGrowth - (r.futureValue - 1000)) < 0.0001);
    t.equal('yearly balances array has one entry per year plus the start', r.yearlyBalances.length, 11);

    const r2 = engine.compoundInterest(1000, 7, 10, 500);
    t.check('regular contributions increase the future value vs. no contributions', r2.futureValue > r.futureValue);
    t.equal('total contributed accounts for yearly additions', r2.totalContributed, 1000 + 500*10);

    const zero = engine.compoundInterest(1000, 0, 10, 0);
    t.equal('0% rate: future value equals principal (no growth)', zero.futureValue, 1000);
  });

  await describe('dollar-cost averaging', async (t) => {
    const r = engine.dollarCostAverage(100, 12, 12, 12); // $100/month, 12 months, 12%/yr annual, monthly compounding
    t.check('future value exceeds total contributed when return is positive', r.futureValue > r.totalContributed);
    t.equal('total contributed is amount x periods', r.totalContributed, 1200);
    t.equal('balances array has one entry per period plus the start (0)', r.balances.length, 13);
    t.equal('starts at zero', r.balances[0], 0);

    const noReturn = engine.dollarCostAverage(100, 12, 0, 12);
    t.equal('0% return: future value equals total contributed exactly', noReturn.futureValue, 1200);
  });

  await describe('percentage return', async (t) => {
    const r = engine.percentageReturn(100, 150);
    t.equal('50 gain on 100 is +50%', r.percentChange, 50);
    t.equal('absolute change is 50', r.absoluteChange, 50);

    const loss = engine.percentageReturn(100, 60);
    t.equal('a loss is negative', loss.percentChange, -40);

    const zero = engine.percentageReturn(0, 100);
    t.equal('a zero starting value is explicitly invalid, not Infinity/NaN', zero.validInput, false);
  });

  await describe('profit/loss on a trade', async (t) => {
    const r = engine.profitLoss(10, 15, 100, 0, 0); // bought 100 shares at $10, sold at $15
    t.equal('total cost', r.totalCost, 1000);
    t.equal('total proceeds', r.totalProceeds, 1500);
    t.equal('net profit', r.netProfitLoss, 500);
    t.equal('percent return', r.percentReturn, 50);

    const withFees = engine.profitLoss(10, 15, 100, 10, 10);
    t.check('fees reduce net profit compared to the no-fee case', withFees.netProfitLoss < r.netProfitLoss);

    const loss = engine.profitLoss(15, 10, 100, 0, 0);
    t.check('a loss is negative', loss.netProfitLoss < 0);
  });

  await describe('P/E and dividend yield (shared with the chat calculator)', async (t) => {
    const pe = engine.peRatio(150, 6);
    t.equal('150 / 6 = 25', pe.pe, 25);
    const badPe = engine.peRatio(150, 0);
    t.equal('zero/negative EPS is explicitly invalid', badPe.validInput, false);

    const dy = engine.dividendYield(100, 4);
    t.equal('4 / 100 = 4%', dy.yieldPct, 4);
  });

  if(require.main === module) finalizeSuites();
})();
