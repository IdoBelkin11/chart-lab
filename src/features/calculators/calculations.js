// ---------------------------------------------------------------------------
// Reusable calculation utilities — pure functions, no UI, no formatting.
//
// Extracted so the chat-based calculator (matching-engine.js's
// tryCalculators, which parses "if I invest $10k at 7% for 20 years" out of
// free text) and the dedicated Calculators view (a real form with inputs)
// share ONE implementation of each formula instead of two that could drift
// apart — the same "one source of truth" principle already applied to
// design tokens and the KB/engine split.
//
// Every function here returns numbers/plain objects only — the caller
// decides how to format or phrase the result, in whichever language.
// ---------------------------------------------------------------------------

// Future value with optional regular contributions, added at the END of
// each year (a conservative, commonly-used convention). With
// contributionPerYear=0 this is plain compound interest.
function compoundInterest(principal, ratePct, years, contributionPerYear){
  contributionPerYear = contributionPerYear || 0;
  const rate = ratePct / 100;
  let balance = principal;
  const yearlyBalances = [balance];
  for(let y = 1; y <= years; y++){
    balance = balance * (1 + rate) + contributionPerYear;
    yearlyBalances.push(balance);
  }
  const totalContributed = principal + contributionPerYear * years;
  return {
    futureValue: balance,
    totalContributed,
    totalGrowth: balance - totalContributed,
    yearlyBalances // for a simple chart/table in the UI
  };
}

// Dollar-cost averaging: investing a fixed amount at regular intervals
// rather than all at once. This is an ILLUSTRATIVE average-return model
// (a constant assumed annual return, compounded per period), not a
// simulation of real historical volatility — the UI must say so; this
// function only does the arithmetic.
function dollarCostAverage(amountPerPeriod, numberOfPeriods, annualReturnPct, periodsPerYear){
  periodsPerYear = periodsPerYear || 12; // default: monthly contributions
  const periodRate = (annualReturnPct / 100) / periodsPerYear;
  let balance = 0;
  const balances = [0];
  for(let p = 1; p <= numberOfPeriods; p++){
    balance = balance * (1 + periodRate) + amountPerPeriod;
    balances.push(balance);
  }
  const totalContributed = amountPerPeriod * numberOfPeriods;
  return {
    futureValue: balance,
    totalContributed,
    totalGrowth: balance - totalContributed,
    balances
  };
}

// Simple percentage return between two values (price, portfolio value,
// anything). Handles a zero/negative starting value explicitly rather than
// returning Infinity/NaN silently.
function percentageReturn(initialValue, finalValue){
  if(initialValue === 0) return { validInput: false, reason: 'zero_initial_value' };
  const absoluteChange = finalValue - initialValue;
  const percentChange = (absoluteChange / Math.abs(initialValue)) * 100;
  return { validInput: true, absoluteChange, percentChange };
}

// Profit/loss on a trade, including optional fees on both legs. Returns
// null-safe zeros rather than throwing on missing fee arguments.
function profitLoss(buyPrice, sellPrice, shares, buyFees, sellFees){
  buyFees = buyFees || 0;
  sellFees = sellFees || 0;
  const totalCost = buyPrice * shares + buyFees;
  const totalProceeds = sellPrice * shares - sellFees;
  const netProfitLoss = totalProceeds - totalCost;
  const percentReturn = totalCost !== 0 ? (netProfitLoss / totalCost) * 100 : null;
  return { totalCost, totalProceeds, netProfitLoss, percentReturn };
}

// P/E ratio and dividend yield — already existed inline in
// matching-engine.js's tryCalculators; extracted here so that code and any
// future Calculators-view "quick metric" tool share one implementation.
function peRatio(price, eps){
  if(eps <= 0 || price <= 0) return { validInput: false };
  return { validInput: true, pe: price / eps };
}
function dividendYield(price, annualDividendPerShare){
  if(price <= 0 || annualDividendPerShare < 0) return { validInput: false };
  return { validInput: true, yieldPct: (annualDividendPerShare / price) * 100 };
}
