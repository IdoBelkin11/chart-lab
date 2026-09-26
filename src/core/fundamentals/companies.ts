// ---------------------------------------------------------------------------
// The Fundamentals track's fictional companies — the one source of every
// number the lessons show (the Fundamentals counterpart of charts/series.js).
// Amounts are in millions; per-share figures in currency units.
//
// From the Artifact (page 09), reconciled into one consistent set:
//   A — the quality company: the income statement of board 09.1, the balance
//       sheet of 09.4 (current ratio 1.4), the margins of 09.3, and the DCF
//       inputs of 09.7 (free cash flow 400, net debt 500, 200M shares).
//       Its balance sheet is set so that its net debt IS the DCF's 500.
//   B — same revenue as A, heavy debt: net income less than half of A's
//       because of 310 of interest (09.1). Its thin equity flatters its ROE.
//   C — loss-making: P/S instead of P/E (09.2).
//   D — the fast grower of the PEG comparison (09.6), and the earnings report.
//   E — profitable and burning cash (09.5; the board called it B, whose
//       income statement it contradicted, so it is its own company here).
// Every ratio is computed below, never typed in; tests check the statements add up.
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';

const L = (he: string, en: string): Localized => ({ he, en });

export interface Statement { rev: number; cogs: number; sm: number; rd: number; ga: number; int: number; tax: number; shares: number }
export interface Balance {
  cash: number; receivables: number; ppe: number; goodwill: number;
  /** Current liabilities: bills due within a year, including short-term debt. */
  currentLiab: number; shortDebt: number; longDebt: number; equity: number;
}
export interface CashFlow { net: number; da: number; workingCap: number; capex: number }

/** The income statement's four profits, and EPS. */
export function income(s: Statement) {
  const gross = s.rev - s.cogs, op = gross - s.sm - s.rd - s.ga, pre = op - s.int, net = pre - s.tax;
  return { ...s, gross, op, pre, net, eps: net / s.shares, taxRate: s.tax / pre };
}
export const totalAssets = (b: Balance) => b.cash + b.receivables + b.ppe + b.goodwill;
export const totalDebt = (b: Balance) => b.shortDebt + b.longDebt;
export const netDebt = (b: Balance) => totalDebt(b) - b.cash;
/** Liabilities other than the current ones and the long-term debt: none in these companies. */
export const balances = (b: Balance) => totalAssets(b) === b.currentLiab + b.longDebt + b.equity;
export const currentRatio = (b: Balance) => (b.cash + b.receivables) / b.currentLiab;
export const operatingCash = (c: CashFlow) => c.net + c.da + c.workingCap;
export const freeCash = (c: CashFlow) => operatingCash(c) + c.capex;

export interface Company {
  name: Localized;
  statement: Statement;
  balance?: Balance;
  cash?: CashFlow;
  price?: number;
  /** Expected yearly earnings growth, %. */
  growth?: number;
  dividend?: number;
}

export const A: Company = {
  name: L('חברה א׳', 'Company A'),
  statement: { rev: 4820, cogs: 2650, sm: 640, rd: 510, ga: 280, int: 45, tax: 155, shares: 200 },
  balance: { cash: 1200, receivables: 1400, ppe: 4100, goodwill: 1700, currentLiab: 1800, shortDebt: 500, longDebt: 1200, equity: 5400 },
  cash: { net: 540, da: 180, workingCap: -60, capex: -260 },
  price: 74, growth: 8, dividend: 1.08
};
export const B: Company = {
  name: L('חברה ב׳', 'Company B'),
  statement: { rev: 4820, cogs: 3370, sm: 420, rd: 180, ga: 210, int: 310, tax: 72, shares: 200 },
  balance: { cash: 300, receivables: 900, ppe: 5200, goodwill: 0, currentLiab: 900, shortDebt: 0, longDebt: 4200, equity: 1300 },
  cash: { net: 258, da: 250, workingCap: -20, capex: -300 },
  price: 25.8, growth: 4, dividend: 1.4
};
export const C: Company = {
  name: L('חברה ג׳', 'Company C'),
  statement: { rev: 1200, cogs: 700, sm: 450, rd: 350, ga: 100, int: 0, tax: -100, shares: 100 },
  price: 60
};
export const D: Company = {
  name: L('חברה ד׳', 'Company D'),
  statement: { rev: 3000, cogs: 1200, sm: 600, rd: 450, ga: 90, int: 20, tax: 140, shares: 100 },
  balance: { cash: 700, receivables: 800, ppe: 1600, goodwill: 0, currentLiab: 500, shortDebt: 100, longDebt: 500, equity: 2100 },
  cash: { net: 500, da: 90, workingCap: -40, capex: -150 },
  price: 160, growth: 20
};
/** E: only a cash flow — the profitable company whose cash went out faster than it came in. */
export const E_CASH: CashFlow = { net: 540, da: 220, workingCap: -380, capex: -520 };

/** Market value, enterprise value and the multiples of P6. */
export function market(c: Company) {
  const i = income(c.statement), mcap = c.price! * c.statement.shares;
  const ev = c.balance ? mcap + netDebt(c.balance) : null;
  const ebitda = c.cash ? i.op + c.cash.da : null;
  return {
    mcap, ev, ebitda,
    pe: i.net > 0 ? mcap / i.net : null,
    ps: mcap / c.statement.rev,
    pb: c.balance ? mcap / c.balance.equity : null,
    evEbitda: ev !== null && ebitda ? ev / ebitda : null,
    peg: i.net > 0 && c.growth ? mcap / i.net / c.growth : null
  };
}

/** Returns on capital (P5), in %: on equity, on assets, and on the capital invested in the business. */
export function returns(c: Company) {
  const i = income(c.statement), b = c.balance!;
  const nopat = i.op * (1 - i.taxRate), invested = b.equity + netDebt(b);
  return { roe: (i.net / b.equity) * 100, roa: (i.net / totalAssets(b)) * 100, roic: (nopat / invested) * 100, nopat, invested };
}

/** Debt and strength (P7). */
export function strength(c: Company) {
  const i = income(c.statement), b = c.balance!;
  return { de: totalDebt(b) / b.equity, coverage: i.op / c.statement.int, current: currentRatio(b) };
}

/** Five years of one company (P1, P4): revenue and the three profits; the last year is its statement. */
export interface History { years: number[]; rev: number[]; gross: number[]; op: number[]; net: number[]; price?: number[] }
export const A_HISTORY: History = {
  years: [2021, 2022, 2023, 2024, 2025],
  rev: [3540, 3830, 4130, 4460, 4820], gross: [1345, 1570, 1776, 1962, 2170], op: [319, 460, 578, 669, 740], net: [212, 306, 413, 491, 540],
  price: [38, 29, 45, 60, 74]
};
export const B_HISTORY: History = {
  years: [2021, 2022, 2023, 2024, 2025],
  rev: [4300, 4450, 4600, 4700, 4820], gross: [1419, 1424, 1426, 1457, 1450], op: [602, 610, 621, 630, 640], net: [301, 294, 285, 273, 258]
};
export const margins = (h: History, k: 'gross' | 'op' | 'net') => h[k].map((v, i) => (v / h.rev[i]!) * 100);

/** D's quarterly report (P8): what analysts expected, what came in, and the new full-year guidance. */
export const D_REPORT = {
  expected: { rev: 780, eps: 1.3 }, actual: { rev: 802, eps: 1.36 }, yearAgoRev: 668,
  guidance: { before: 20, after: 12 }
};

/** A buyback (P8): the same net income over fewer shares. */
export const A_BUYBACK = { sharesBought: 10 };

/** P7: the rate B would pay if it refinanced all its debt today, %. */
export const B_REFI_RATE = 10;

/** P9: the DCF's assumptions for A (Artifact 09.7) — growth is A's own expected growth. */
export const A_DCF = { discountPct: 10, terminalPct: 2.5 };
