// The drawing primitives are ported JavaScript. These declarations give the
// React layer a typed surface without converting 300 lines of imperative
// canvas code that works and is covered by the lessons themselves.
export declare function chartColors(): Record<string, string>;
export declare function drawChart(
  canvas: HTMLCanvasElement,
  tipEl: HTMLElement | null,
  candles: unknown[],
  opts: Record<string, unknown>
): void;
export declare function drawPriceRSI(
  canvas: HTMLCanvasElement,
  tipEl: HTMLElement | null,
  candles: unknown[],
  opts: Record<string, unknown>
): void;
export declare function drawPriceMACD(
  canvas: HTMLCanvasElement,
  tipEl: HTMLElement | null,
  candles: unknown[],
  opts: Record<string, unknown>
): void;
