// ---------------------------------------------------------------------------
// A tiny order book: what happens to a buy order, layer by layer. Ported from
// the approved prototype (proto-src/sim-order.mjs) so the lesson behaves
// exactly as designed. Pure — the lesson UI only draws what this returns.
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';

/** [price, quantity]; a bid may carry `mine` (an order the learner left in the book). */
export type Level = [number, number];
export interface Book { asks: Level[]; bids: Array<[number, number, boolean?]> }
export type OrderType = 'market' | 'limit';
export type FillKind = 'mkt-one' | 'mkt-multi' | 'lim-rest' | 'lim-part' | 'lim-full' | 'empty';

export interface OrderResult {
  type: OrderType;
  qty: number;
  limit: number | null;
  fills: Level[];
  filled: number;
  cost: number;
  avg: number;
  /** A limit order's unfilled remainder, now waiting in the book as a bid. */
  rest: number;
  /** The best ask before the order — what "the price" looked like. */
  bestBefore: number | null;
  kind: FillKind;
}

export const cloneBook = (b: Book): Book => ({ asks: b.asks.map((a) => [a[0], a[1]] as Level), bids: b.bids.map((x) => [x[0], x[1], x[2]] as [number, number, boolean?]) });

/** Executes a buy order against the asks, cheapest first. */
export function executeBuy(book: Book, type: OrderType, qty: number, limit: number | null = null): { book: Book; result: OrderResult } {
  const asks = book.asks.map((a) => [a[0], a[1]] as Level);
  const bestBefore = asks.length ? asks[0]![0] : null;
  let left = qty;
  const fills: Level[] = [];
  for (const a of asks) {
    if (left <= 0) break;
    if (type === 'limit' && limit !== null && a[0] > limit + 1e-9) break;
    const take = Math.min(a[1], left);
    fills.push([a[0], take]);
    a[1] -= take;
    left -= take;
  }
  const rest = type === 'limit' ? left : 0;
  let bids = book.bids.map((b) => [b[0], b[1], b[2]] as [number, number, boolean?]);
  if (rest > 0 && limit !== null) bids = [...bids, [limit, rest, true] as [number, number, boolean?]].sort((x, y) => y[0] - x[0]);
  const filled = fills.reduce((s, f) => s + f[1], 0);
  const cost = fills.reduce((s, f) => s + f[0] * f[1], 0);
  const kind: FillKind = type === 'market'
    ? (filled === 0 ? 'empty' : fills.length > 1 ? 'mkt-multi' : 'mkt-one')
    : (filled === 0 ? 'lim-rest' : rest > 0 ? 'lim-part' : 'lim-full');
  return {
    book: { asks: asks.filter((a) => a[1] > 0), bids },
    result: { type, qty, limit, fills, filled, cost, avg: filled ? cost / filled : 0, rest, bestBefore, kind }
  };
}

export const bestAsk = (b: Book) => (b.asks.length ? b.asks[0]![0] : null);
export const bestBid = (b: Book) => (b.bids.length ? b.bids[0]![0] : null);

const f2 = (x: number) => x.toFixed(2);
const qty = (x: number) => x.toLocaleString('en-US');

/** Why the order filled the way it did — the lesson's feedback for one order. */
export function explainOrder(r: OrderResult): Localized {
  const p1 = r.fills.length ? f2(r.fills[0]![0]) : '';
  switch (r.kind) {
    case 'mkt-one': return {
      he: `הפקודה נקנתה מהמוכר הזול ביותר בספר: ${qty(r.filled)} מניות ב־${p1}. לא במחיר הקנייה הגבוה ביותר — זה המחיר שקונה אחר מציע. קונים במחיר שמוכר מבקש.`,
      en: `The order bought from the cheapest seller in the book: ${qty(r.filled)} shares at ${p1}. Not at the highest bid — that is what another buyer offers. You buy at the price a seller asks.`
    };
    case 'mkt-multi': return {
      he: `השכבה הזולה לא הספיקה, אז הפקודה המשיכה לשכבות יקרות יותר. המחיר הממוצע יצא ${f2(r.avg)}, כלומר ${f2(r.avg - (r.bestBefore ?? r.avg))} למניה מעל ההיצע הטוב ביותר.`,
      en: `The cheapest layer wasn't enough, so the order kept buying from pricier layers. The average price came out at ${f2(r.avg)} — ${f2(r.avg - (r.bestBefore ?? r.avg))} per share above the best ask.`
    };
    case 'lim-rest': return {
      he: `אף מוכר לא מוכן למכור ב־${f2(r.limit ?? 0)} או פחות, אז הפקודה נכנסה לספר כהצעת קנייה ומחכה. המחיר מובטח — הביצוע לא.`,
      en: `No seller will sell at ${f2(r.limit ?? 0)} or less, so the order joined the book as a bid and waits. The price is guaranteed — the fill is not.`
    };
    case 'lim-part': return {
      he: `בוצע רק מה שהיה זמין עד ${f2(r.limit ?? 0)}. השאר, ${qty(r.rest)} מניות, מחכה בספר כהצעת קנייה.`,
      en: `Only what was available up to ${f2(r.limit ?? 0)} filled. The rest, ${qty(r.rest)} shares, waits in the book as a bid.`
    };
    case 'lim-full': return {
      he: 'המחיר שקבעתם לא נמוך מההיצע, אז הפקודה בוצעה מיד — כמו פקודת שוק, אבל עם תקרה שלא תעברו.',
      en: "Your price was at or above the offer, so the order filled at once — like a market order, but with a ceiling you won't go past."
    };
    default: return { he: 'אין יותר הצעות מכירה בספר. אפסו את הספר כדי להמשיך.', en: 'There are no more sell offers in the book. Reset it to continue.' };
  }
}

/** The three things F5 asks the learner to do, recognised from an order's result. */
export type OrderTask = 'market' | 'limitRest' | 'sweep';
export function tasksMet(r: OrderResult): OrderTask[] {
  const t: OrderTask[] = [];
  if (r.type === 'market' && r.filled > 0) t.push('market');
  if (r.kind === 'mkt-multi') t.push('sweep');
  if (r.type === 'limit' && r.kind === 'lim-rest') t.push('limitRest');
  return t;
}
