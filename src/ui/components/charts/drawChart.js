// ---------------------------------------------------------------------------
// Canvas chart rendering.
//
// This lives in @ui, not @core, and that placement is deliberate: it draws to
// a CanvasRenderingContext2D, which is a renderer capability. Under React
// Native the same charts would be drawn with Skia, and this file is exactly
// the part that would be rewritten — while the series data in
// @core/charts/series.js would move across untouched.
//
// Two primitives cover all 19 lesson charts:
//   drawChart    — candles, volume, moving averages, annotated zones
//   drawPriceRSI — price with an RSI sub-panel
//
// The palette is the design system's (tokens.css / the approved Artifact),
// one set per theme, mirrored here because a canvas cannot read CSS
// custom properties by name.
// ---------------------------------------------------------------------------

export function chartColors(){
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  return {
    grid: light ? '#e6e2d9' : '#1c2835',
    text: light ? '#5d6672' : '#8391a0',
    // The lesson captions name these two lines by colour — "20 average
    // (orange) vs 150 average (teal)" (LESSON_CHARTS in
    // @core/charts/lessonCharts.ts) — so they take the palette's orange
    // (--risk) and teal (--adv). Change a hue and its caption together.
    ema20: light ? '#a94a0c' : '#ff9150',
    sma50: light ? '#2f5fd0' : '#7aa7ff',
    sma150: light ? '#0b7f70' : '#34c6b0',
    // The neutral highlight ("look here"): the learning gold.
    gold: light ? '#8a6100' : '#f5c542',
    goldDim: light ? 'rgba(242,183,5,0.16)' : 'rgba(245,197,66,0.14)',
    // Candles use the market-direction pair (--up / --down).
    bull: light ? '#0f8a51' : '#3fcf8e',
    bear: light ? '#c4283b' : '#ff5c6c',
    // Zone fills reuse the success/error hues at low alpha, so a zone reads
    // as "the same idea, softened" rather than a third colour to learn.
    supportDim: light ? 'rgba(15,122,69,0.10)' : 'rgba(78,209,138,0.14)',
    resistanceDim: light ? 'rgba(196,40,59,0.10)' : 'rgba(255,92,108,0.14)',
    // The matching LINE colours. Without these, a 'support' or 'resistance'
    // tone resolved its fill correctly but fell through to another colour
    // for its border and label.
    support: light ? '#0f7a45' : '#4ed18a',
    resistance: light ? '#c4283b' : '#ff5c6c',
    // Backing plate for annotation labels: the chart well's own colour, so a
    // label reads as sitting IN the chart, not floating over it.
    plate: light ? '#fbfaf7' : '#05090e'
  };
}

/* ---------- annotation label helper ----------
   Annotation text sits ON the price action, so without a backing plate it
   competes with candles and grid lines for the same pixels — which is exactly
   what made the breakout/retest labels hard to read. Every annotation label
   goes through here: a rounded plate in the canvas background colour, then
   the text. `place: 'below'` puts the plate under the candle instead of
   above it, which is how two markers close together stop colliding. */
function labelPlate(ctx, text, x, y, color, align, bg){
  ctx.font = "600 11.5px 'Rubik',sans-serif";
  const w = ctx.measureText(text).width;
  const padX = 6, padY = 4, h = 18;
  let left = x;
  if(align === 'right') left = x - w;
  else if(align === 'center') left = x - w/2;
  // Keep the plate inside the canvas: a label near the edge would otherwise be clipped mid-word.
  const cssW = ctx.canvas.width / (window.devicePixelRatio || 1);
  left = Math.max(padX + 2, Math.min(left, cssW - w - padX - 2));
  const plateX = left - padX, plateY = y - h + padY;
  ctx.fillStyle = bg;
  ctx.globalAlpha = 0.82;
  if(ctx.roundRect){
    ctx.beginPath(); ctx.roundRect(plateX, plateY, w + padX*2, h, 5); ctx.fill();
  } else {
    ctx.fillRect(plateX, plateY, w + padX*2, h);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.fillText(text, left, y - padY - 1);
}

/* ---------- generic candlestick renderer ---------- */
export function drawChart(canvas, tipEl, candles, opts){
  opts = opts||{};
  const CC = chartColors();
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio||1;
  // The canvas's RENDERED box is the source of truth for both dimensions.
  //
  // This used to force `canvas.height = (opts.height || 440)` and write that
  // onto style.height as well, so the chart drew at a fixed 440px no matter
  // what size the card gave it. Once the lesson cards started sizing
  // themselves — half a row or a whole one, with the height following an
  // aspect ratio — every chart overflowed its well and was clipped: a 292px
  // card cut 172px off the bottom of the drawing, taking the volume bars and
  // part of the price action with it.
  //
  // Reading the box instead means the renderer draws exactly what is visible,
  // and `opts.height` is no longer a size at all — only the fallback used when
  // the element has not been laid out (a detached canvas, or jsdom).
  const cssW = canvas.clientWidth || opts.width || 800;
  const cssH = canvas.clientHeight || opts.height || 440;
  const W = canvas.width = Math.round(cssW*dpr);
  const H = canvas.height = Math.round(cssH*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.direction='ltr';
  const w=cssW, h=cssH;
  ctx.clearRect(0,0,w,h);

  const padL=54, padR=16, padT=16;
  const showVol = opts.showVolume;
  const volH = showVol? h*0.16 : 0;
  const padB = 24 + volH;
  const chartH = h-padT-padB;
  const n=candles.length;
  const candleW = (w-padL-padR)/n;

  let lo=Infinity, hi=-Infinity;
  candles.forEach(c=>{lo=Math.min(lo,c.l); hi=Math.max(hi,c.h);});
  if(opts.extraLines){opts.extraLines.forEach(line=>line.forEach(v=>{if(v!=null){lo=Math.min(lo,v);hi=Math.max(hi,v);}}));}
  const pad=(hi-lo)*0.08; lo-=pad; hi+=pad;

  const xFor = i => padL + i*candleW + candleW/2;
  const yFor = p => padT + (1-(p-lo)/(hi-lo))*chartH;

  // grid
  ctx.strokeStyle=CC.grid; ctx.lineWidth=1; ctx.font="11px 'Rubik',system-ui,sans-serif"; ctx.fillStyle=CC.text;
  for(let g=0; g<=4; g++){
    const p = lo + (hi-lo)*g/4;
    const y = yFor(p);
    ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke();
    ctx.fillText('$'+p.toFixed(0), 6, y+4);
  }

  // zones
  if(opts.zones){
    opts.zones.forEach(z=>{
      const y1=yFor(z.range[1]), y2=yFor(z.range[0]);
      ctx.fillStyle=z.color;
      ctx.fillRect(padL, y1, w-padL-padR, y2-y1);
      if(opts.showAnnotations!==false){
        ctx.setLineDash([4,4]); ctx.strokeStyle=z.line;
        ctx.beginPath(); ctx.moveTo(padL,y1); ctx.lineTo(w-padR,y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(padL,y2); ctx.lineTo(w-padR,y2); ctx.stroke();
        ctx.setLineDash([]);
        labelPlate(ctx, z.label, padL+10, y1-4, z.line, 'left', CC.plate);
      }
    });
  }

  // candles
  for(let i=0;i<n;i++){
    const c=candles[i]; const x=xFor(i);
    const up = c.c>=c.o;
    ctx.strokeStyle = up? chartColors().bull:chartColors().bear;
    ctx.fillStyle = up? chartColors().bull:chartColors().bear;
    ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x,yFor(c.h)); ctx.lineTo(x,yFor(c.l)); ctx.stroke();
    const bw=Math.max(candleW*0.55,1.5);
    const yO=yFor(c.o), yC=yFor(c.c);
    ctx.fillRect(x-bw/2, Math.min(yO,yC), bw, Math.max(Math.abs(yC-yO),1));
  }

  // extra lines (moving averages)
  if(opts.extraLines){
    opts.extraLines.forEach((line,li)=>{
      ctx.strokeStyle=opts.extraColors[li]; ctx.lineWidth=1.8; ctx.beginPath();
      let started=false;
      line.forEach((v,i)=>{
        if(v==null) return;
        const x=xFor(i), y=yFor(v);
        if(!started){ctx.moveTo(x,y); started=true;} else ctx.lineTo(x,y);
      });
      ctx.stroke();
    });
  }

  // highlight boxes (candlestick pattern focus)
  if(opts.highlights){
    opts.highlights.forEach(hlt=>{
      const x1=xFor(hlt.i1)-candleW*0.5-3, x2=xFor(hlt.i2!=null?hlt.i2:hlt.i1)+candleW*0.5+3;
      ctx.setLineDash([4,3]); ctx.strokeStyle=hlt.color; ctx.lineWidth=1.5;
      ctx.strokeRect(x1, padT+2, x2-x1, chartH-4);
      ctx.setLineDash([]);
      labelPlate(ctx, hlt.label, x1, padT-2>12? padT-2: 12, hlt.color, 'left', CC.plate);
    });
  }

  // arbitrary line segments (trendlines, necklines, fib levels)
  if(opts.segments && opts.showAnnotations!==false){
    opts.segments.forEach(seg=>{
      const x1=xFor(seg.x1), y1=yFor(seg.y1), x2=xFor(seg.x2), y2=yFor(seg.y2);
      ctx.strokeStyle=seg.color; ctx.lineWidth=seg.width||1.6;
      if(seg.dash) ctx.setLineDash(seg.dash); else ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.setLineDash([]);
      if(seg.label){
        const lx = seg.labelAt==='start'? x1 : x2;
        const ly = (seg.labelAt==='start'? y1 : y2) + (seg.labelDy!=null?seg.labelDy:-3);
        labelPlate(ctx, seg.label, lx + (seg.labelDx||0), ly, seg.color, seg.labelAlign||'left', CC.plate);
        ctx.textAlign='left';
      }
    });
  }

  // point dots (pattern extremes)
  if(opts.dots && opts.showAnnotations!==false){
    opts.dots.forEach(d=>{
      const x=xFor(d.idx), y=yFor(d.price);
      ctx.fillStyle=d.color;
      ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fill();
      if(d.label){
        labelPlate(ctx, d.label, x+(d.labelDx||0), y+(d.labelDy!=null?d.labelDy:-8), d.color, d.labelAlign||'center', CC.plate);
        ctx.textAlign='left';
      }
    });
  }

  // point markers (breakout / retest)
  if(opts.points && opts.showAnnotations!==false){
    opts.points.forEach(pt=>{
      const c=candles[pt.idx]; if(!c) return;
      const x=xFor(pt.idx);
      // `place: 'below'` anchors the marker under the candle's low. Two
      // markers a few candles apart — a breakout and the retest that
      // follows it — otherwise stack in the same band of pixels and sit
      // on top of the price action.
      const below = pt.place === 'below';
      const dotY = below ? yFor(c.l) + 10 : yFor(c.h) - 8;
      const textY = below ? dotY + 22 : dotY - 6;
      ctx.fillStyle=pt.color;
      ctx.beginPath(); ctx.arc(x, dotY, 4, 0, Math.PI*2); ctx.fill();
      // A leader line ties the label to its candle once the label is
      // offset far enough that the pairing is no longer obvious.
      ctx.strokeStyle=pt.color; ctx.lineWidth=1; ctx.globalAlpha=0.5;
      ctx.beginPath();
      ctx.moveTo(x, below ? yFor(c.l)+2 : yFor(c.h)-2);
      ctx.lineTo(x, dotY);
      ctx.stroke(); ctx.globalAlpha=1;
      labelPlate(ctx, pt.label, x, textY, pt.color, pt.align||'center', CC.plate);
      ctx.textAlign='left';
    });
  }

  // volume
  if(showVol){
    const volTop = h-volH-2;
    let maxV=0; candles.forEach(c=>maxV=Math.max(maxV,c.v));
    for(let i=0;i<n;i++){
      const c=candles[i]; const x=xFor(i);
      const up = c.c>=c.o;
      const bh = (c.v/maxV)*volH;
      ctx.fillStyle = up? CC.bull : CC.bear;
      ctx.globalAlpha = 0.45;
      const bw=Math.max(candleW*0.55,1.5);
      ctx.fillRect(x-bw/2, h-bh-2, bw, bh);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle=CC.grid; ctx.beginPath(); ctx.moveTo(padL,volTop); ctx.lineTo(w-padR,volTop); ctx.stroke();
  }

  // hover
  canvas.onmousemove = function(ev){
    if(!tipEl) return;
    const rect=canvas.getBoundingClientRect();
    const mx=ev.clientX-rect.left;
    let idx=Math.round((mx-padL-candleW/2)/candleW);
    idx=Math.max(0,Math.min(n-1,idx));
    const c=candles[idx];
    if(!c){tipEl.style.opacity=0; return;}
    const dateStr=c.t.toISOString().slice(0,10);
    tipEl.innerHTML = dateStr+'<br>O '+c.o.toFixed(2)+' H '+c.h.toFixed(2)+'<br>L '+c.l.toFixed(2)+' C '+c.c.toFixed(2)+'<br>V '+(c.v/1e6).toFixed(1)+'M';
    tipEl.style.left=Math.min(mx+14, w-140)+'px';
    tipEl.style.top='10px';
    tipEl.style.opacity=1;
  };
  canvas.onmouseleave = function(){ if(tipEl) tipEl.style.opacity=0; };

  // click handler for try-it-yourself
  if(opts.onClick){
    canvas.onclick = function(ev){
      const rect=canvas.getBoundingClientRect();
      const my=ev.clientY-rect.top, mx=ev.clientX-rect.left;
      const price = lo + (1-(my-padT)/chartH)*(hi-lo);
      // The candle under the pointer, for exercises that ask for a moment rather than a price.
      const index = Math.max(0, Math.min(n-1, Math.floor((mx-padL)/candleW)));
      opts.onClick(price, index);
    };
  }
}

/* ---------- price + RSI combo chart renderer (Lesson 6) ---------- */
export function drawPriceRSI(canvas, tipEl, candles, opts){
  opts = opts || {};
  const CC = chartColors();
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio||1;
  // Same rule as drawChart above: the rendered box decides, not opts.height.
  // This one additionally wrote style.height, so a price+RSI chart forced its
  // own 320px into whatever card it was in — leaving a 460px well with 140px
  // of empty space under the drawing.
  const cssW = canvas.clientWidth || opts.width || 800;
  const H = canvas.clientHeight || opts.height || 320;
  canvas.width = Math.round(cssW*dpr); canvas.height = Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.direction='ltr';
  const w=cssW, h=H;
  ctx.clearRect(0,0,w,h);

  const padL=54, padR=16, padT=14, gap=14, padB=20;
  const rsiH = h*0.28;
  const priceH = h - padT - gap - rsiH - padB;
  const n = candles.length;
  const candleW = (w-padL-padR)/n;

  let lo=Infinity, hi=-Infinity;
  candles.forEach(c=>{lo=Math.min(lo,c.l); hi=Math.max(hi,c.h);});
  // Lines on the price panel (an average, a target) stay inside its scale, as in drawChart.
  (opts.extraLines || []).forEach(line=>line.forEach(v=>{if(v!=null){lo=Math.min(lo,v);hi=Math.max(hi,v);}}));
  const padPrice=(hi-lo)*0.08; lo-=padPrice; hi+=padPrice;

  const xFor = i => padL + i*candleW + candleW/2;
  const yForPrice = p => padT + (1-(p-lo)/(hi-lo))*priceH;
  const rsiTop = padT+priceH+gap;
  const yForRsi = v => rsiTop + (1-v/100)*rsiH;

  ctx.strokeStyle=CC.grid; ctx.lineWidth=1; ctx.font="11px 'Rubik',system-ui,sans-serif"; ctx.fillStyle=CC.text;
  for(let g=0; g<=3; g++){
    const p = lo + (hi-lo)*g/3;
    const y = yForPrice(p);
    ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke();
    ctx.fillText('$'+p.toFixed(0), 6, y+4);
  }

  for(let i=0;i<n;i++){
    const c=candles[i]; const x=xFor(i);
    const up = c.c>=c.o;
    ctx.strokeStyle = up? chartColors().bull:chartColors().bear;
    ctx.fillStyle = up? chartColors().bull:chartColors().bear;
    ctx.beginPath(); ctx.moveTo(x,yForPrice(c.h)); ctx.lineTo(x,yForPrice(c.l)); ctx.stroke();
    const bw=Math.max(candleW*0.55,1.5);
    const yO=yForPrice(c.o), yC=yForPrice(c.c);
    ctx.fillRect(x-bw/2, Math.min(yO,yC), bw, Math.max(Math.abs(yC-yO),1));
  }
  drawPriceExtras(ctx, CC, opts, xFor, yForPrice, padL, w-padR);

  ctx.fillStyle=CC.resistanceDim;
  ctx.fillRect(padL, yForRsi(100), w-padL-padR, yForRsi(70)-yForRsi(100));
  ctx.fillStyle=CC.supportDim;
  ctx.fillRect(padL, yForRsi(30), w-padL-padR, yForRsi(0)-yForRsi(30));
  ctx.setLineDash([3,3]); ctx.strokeStyle=CC.grid; ctx.lineWidth=1;
  [30,70].forEach(v=>{
    const y=yForRsi(v);
    ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.font="10.5px 'Rubik',system-ui,sans-serif"; ctx.fillStyle=CC.text;
  ctx.fillText('70', 6, yForRsi(70)+4);
  ctx.fillText('30', 6, yForRsi(30)+4);

  ctx.strokeStyle=CC.ema20; ctx.lineWidth=1.8; ctx.beginPath();
  let started=false;
  candles.rsi.forEach((v,i)=>{
    if(v==null) return;
    const x=xFor(i), y=yForRsi(v);
    if(!started){ ctx.moveTo(x,y); started=true; } else ctx.lineTo(x,y);
  });
  ctx.stroke();

  drawPanelMarks(ctx, CC, opts.points, (i) => xFor(i), (i, m) => (m.at === 'low' ? yForPrice(candles[i].l) + 8 : yForPrice(candles[i].h) - 8));
  drawPanelMarks(ctx, CC, opts.subMarks, (i) => xFor(i), (i) => (candles.rsi[i] != null ? yForRsi(candles.rsi[i]) : null));
  drawLinks(ctx, CC, opts.links, xFor, (i, at) => yForPrice(at === 'low' ? candles[i].l : candles[i].h), (i) => (candles.rsi[i] != null ? yForRsi(candles.rsi[i]) : null));
  attachClick(canvas, opts, n, padL, candleW, (my) => lo + (1-(my-padT)/priceH)*(hi-lo));

  if(opts.divergence){
    const p1i=opts.divergence.peak1Idx, p2i=opts.divergence.peak2Idx;
    const p1=candles[p1i], p2=candles[p2i];
    const r1=candles.rsi[p1i], r2=candles.rsi[p2i];
    ctx.strokeStyle=chartColors().bull; ctx.lineWidth=2; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(xFor(p1i), yForPrice(p1.h)); ctx.lineTo(xFor(p2i), yForPrice(p2.h)); ctx.stroke();
    ctx.font="600 11.5px 'Rubik',sans-serif"; ctx.fillStyle=chartColors().bull; ctx.textAlign='right';
    ctx.fillText(opts.divHigherLabel||'Higher High', xFor(p2i)-4, yForPrice(p2.h)-8);
    if(r1!=null && r2!=null){
      ctx.strokeStyle=chartColors().bear; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(xFor(p1i), yForRsi(r1)); ctx.lineTo(xFor(p2i), yForRsi(r2)); ctx.stroke();
      ctx.fillStyle=chartColors().bear;
      ctx.fillText(opts.divLowerLabel||'Lower High', xFor(p2i)-4, yForRsi(r2)-8);
    }
    ctx.textAlign='left';
  }

  canvas.onmousemove = function(ev){
    if(!tipEl) return;
    const rect=canvas.getBoundingClientRect();
    const mx=ev.clientX-rect.left;
    let idx=Math.round((mx-padL-candleW/2)/candleW);
    idx=Math.max(0,Math.min(n-1,idx));
    const c=candles[idx]; const r=candles.rsi[idx];
    if(!c){tipEl.style.opacity=0; return;}
    const dateStr=c.t.toISOString().slice(0,10);
    tipEl.innerHTML = dateStr+'<br>C '+c.c.toFixed(2)+'<br>RSI '+(r!=null? r.toFixed(1):'—');
    tipEl.style.left=Math.min(mx+14, w-120)+'px';
    tipEl.style.top='10px';
    tipEl.style.opacity=1;
  };
  canvas.onmouseleave = function(){ if(tipEl) tipEl.style.opacity=0; };
}

/**
 * Zones and lines (an average, a level) on the price panel of a two-panel chart —
 * the same options drawChart takes, so one lesson chart can show its trend,
 * its levels and its momentum together (T12). Drawn over the candles.
 */
function drawPriceExtras(ctx, CC, opts, xFor, yFor, x1, x2){
  (opts.zones || []).forEach((z) => {
    const y1 = yFor(z.range[1]), y2 = yFor(z.range[0]);
    ctx.fillStyle = z.color; ctx.fillRect(x1, y1, x2-x1, y2-y1);
    ctx.setLineDash([4,4]); ctx.strokeStyle = z.line; ctx.lineWidth = 1;
    [y1, y2].forEach((y) => { ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); });
    ctx.setLineDash([]);
    if(z.label) labelPlate(ctx, z.label, x1+10, y1-4, z.line, 'left', CC.plate);
  });
  (opts.extraLines || []).forEach((line, li) => {
    ctx.strokeStyle = opts.extraColors[li]; ctx.lineWidth = 1.8; ctx.beginPath();
    let started = false;
    line.forEach((v, i) => { if(v == null) return; if(!started){ ctx.moveTo(xFor(i), yFor(v)); started = true; } else ctx.lineTo(xFor(i), yFor(v)); });
    ctx.stroke();
  });
  ctx.textAlign = 'left';
}

/**
 * Labelled dots on a panel (the price, or an indicator under it): [{ idx, label, color, place }].
 * `yAt(i)` gives the anchor; a label sits above it, or below with place: 'below'.
 */
function drawPanelMarks(ctx, CC, marks, xAt, yAt){
  if(!marks) return;
  marks.forEach((m) => {
    const x = xAt(m.idx), y = yAt(m.idx, m);
    if(y == null) return;
    ctx.fillStyle = m.color;
    ctx.beginPath(); ctx.arc(x, y, 3.8, 0, Math.PI*2); ctx.fill();
    if(m.label) labelPlate(ctx, m.label, x, m.place === 'below' ? y + 22 : y - 8, m.color, m.align || 'center', CC.plate);
  });
  ctx.textAlign = 'left';
}

/**
 * Straight lines between two points on a panel — the price (at a candle's high
 * or low) or the indicator under it: [{ i1, i2, panel: 'price'|'sub', at, color, label }].
 * Drawn side by side, a price line and an indicator line make "do they agree?"
 * visible at a glance (T8's divergence; any "compare these two points" lesson).
 */
function drawLinks(ctx, CC, links, xAt, priceY, subY){
  if(!links) return;
  links.forEach((k) => {
    const y = (i) => (k.panel === 'sub' ? subY(i) : priceY(i, k.at));
    const y1 = y(k.i1), y2 = y(k.i2);
    if(y1 == null || y2 == null) return;
    ctx.strokeStyle = k.color; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(xAt(k.i1), y1); ctx.lineTo(xAt(k.i2), y2); ctx.stroke();
    ctx.fillStyle = k.color;
    [[k.i1, y1], [k.i2, y2]].forEach(([i, yy]) => { ctx.beginPath(); ctx.arc(xAt(i), yy, 3.8, 0, Math.PI*2); ctx.fill(); });
    if(k.label) labelPlate(ctx, k.label, xAt(k.i2), k.at === 'low' ? y2 + 24 : y2 - 10, k.color, 'right', CC.plate);
  });
  ctx.textAlign = 'left';
}
/** Clicks on a panel chart: the price under the pointer (price panel scale) and the candle. */
function attachClick(canvas, opts, n, padL, candleW, priceFromY){
  if(!opts.onClick) return;
  canvas.onclick = function(ev){
    const rect = canvas.getBoundingClientRect();
    const index = Math.max(0, Math.min(n-1, Math.floor((ev.clientX-rect.left-padL)/candleW)));
    opts.onClick(priceFromY(ev.clientY-rect.top), index);
  };
}

/* ---------- price + MACD chart renderer (T7) ----------
   The MACD panel: the MACD line (a 12-day EMA minus a 26-day EMA), its 9-day
   signal line, and the histogram (their difference), around a zero line.
   Values are computed in @core (series.withMACD) and read from candles.macd. */
export function drawPriceMACD(canvas, tipEl, candles, opts){
  opts = opts || {};
  const CC = chartColors();
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio||1;
  const cssW = canvas.clientWidth || opts.width || 800;
  const H = canvas.clientHeight || opts.height || 320;
  canvas.width = Math.round(cssW*dpr); canvas.height = Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.direction='ltr';
  const w=cssW, h=H;
  ctx.clearRect(0,0,w,h);

  const padL=54, padR=16, padT=14, gap=14, padB=20;
  const subH = h*0.30;
  const priceH = h - padT - gap - subH - padB;
  const n = candles.length;
  const candleW = (w-padL-padR)/n;
  const M = candles.macd;

  let lo=Infinity, hi=-Infinity;
  candles.forEach(c=>{lo=Math.min(lo,c.l); hi=Math.max(hi,c.h);});
  const padPrice=(hi-lo)*0.08; lo-=padPrice; hi+=padPrice;
  const xFor = i => padL + i*candleW + candleW/2;
  const yForPrice = p => padT + (1-(p-lo)/(hi-lo))*priceH;
  // The MACD scale is symmetric around zero, so "above / below zero" reads at a glance.
  const vals = [...M.line, ...M.signal, ...M.hist].filter(v=>v!=null);
  const mx = Math.max(0.01, ...vals.map(Math.abs)) * 1.12;
  const subTop = padT+priceH+gap;
  const yForSub = v => subTop + (1-(v+mx)/(2*mx))*subH;

  ctx.strokeStyle=CC.grid; ctx.lineWidth=1; ctx.font="11px 'Rubik',system-ui,sans-serif"; ctx.fillStyle=CC.text;
  for(let g=0; g<=3; g++){
    const p = lo + (hi-lo)*g/3, y = yForPrice(p);
    ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke();
    ctx.fillText('$'+p.toFixed(0), 6, y+4);
  }
  for(let i=0;i<n;i++){
    const c=candles[i], x=xFor(i), up=c.c>=c.o;
    ctx.strokeStyle = up? CC.bull:CC.bear; ctx.fillStyle = up? CC.bull:CC.bear;
    ctx.beginPath(); ctx.moveTo(x,yForPrice(c.h)); ctx.lineTo(x,yForPrice(c.l)); ctx.stroke();
    const bw=Math.max(candleW*0.55,1.5), yO=yForPrice(c.o), yC=yForPrice(c.c);
    ctx.fillRect(x-bw/2, Math.min(yO,yC), bw, Math.max(Math.abs(yC-yO),1));
  }

  // zero line and its label
  ctx.setLineDash([3,3]); ctx.strokeStyle=CC.grid;
  ctx.beginPath(); ctx.moveTo(padL,yForSub(0)); ctx.lineTo(w-padR,yForSub(0)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.font="10.5px 'Rubik',system-ui,sans-serif"; ctx.fillStyle=CC.text;
  ctx.fillText('0', 6, yForSub(0)+4);
  ctx.fillText('MACD', 6, subTop+10);
  // histogram
  const bw=Math.max(candleW*0.6,1.5);
  M.hist.forEach((v,i)=>{
    if(v==null) return;
    ctx.fillStyle = v>=0 ? CC.support : CC.resistance;
    ctx.globalAlpha = 0.45;
    const y0=yForSub(0), y1=yForSub(v);
    ctx.fillRect(xFor(i)-bw/2, Math.min(y0,y1), bw, Math.max(Math.abs(y1-y0),1));
    ctx.globalAlpha = 1;
  });
  const line = (arr, color) => {
    ctx.strokeStyle=color; ctx.lineWidth=1.8; ctx.beginPath();
    let started=false;
    arr.forEach((v,i)=>{ if(v==null) return; const x=xFor(i), y=yForSub(v); if(!started){ctx.moveTo(x,y); started=true;} else ctx.lineTo(x,y); });
    ctx.stroke();
  };
  line(M.line, CC.sma50);
  line(M.signal, CC.ema20);

  drawPanelMarks(ctx, CC, opts.points, (i) => xFor(i), (i, m) => (m.at === 'low' ? yForPrice(candles[i].l) + 8 : yForPrice(candles[i].h) - 8));
  drawPanelMarks(ctx, CC, opts.subMarks, (i) => xFor(i), (i) => (M.line[i] != null ? yForSub(M.line[i]) : null));
  drawLinks(ctx, CC, opts.links, xFor, (i, at) => yForPrice(at === 'low' ? candles[i].l : candles[i].h), (i) => (M.line[i] != null ? yForSub(M.line[i]) : null));
  attachClick(canvas, opts, n, padL, candleW, (my) => lo + (1-(my-padT)/priceH)*(hi-lo));

  canvas.onmousemove = function(ev){
    if(!tipEl) return;
    const rect=canvas.getBoundingClientRect();
    const mxp=ev.clientX-rect.left;
    let idx=Math.round((mxp-padL-candleW/2)/candleW);
    idx=Math.max(0,Math.min(n-1,idx));
    const c=candles[idx];
    if(!c){tipEl.style.opacity=0; return;}
    const f=(v)=>v!=null? v.toFixed(2):'—';
    tipEl.innerHTML = c.t.toISOString().slice(0,10)+'<br>C '+c.c.toFixed(2)+'<br>MACD '+f(M.line[idx])+'<br>Signal '+f(M.signal[idx]);
    tipEl.style.left=Math.min(mxp+14, w-130)+'px';
    tipEl.style.top='10px';
    tipEl.style.opacity=1;
  };
  canvas.onmouseleave = function(){ if(tipEl) tipEl.style.opacity=0; };
}

/* ---------- lesson render functions ---------- */
