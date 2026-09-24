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
// Colours are read from CSS custom properties so the charts follow the
// theme automatically; there is no second palette to keep in sync.
// ---------------------------------------------------------------------------

export function chartColors(){
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  return {
    grid: light ? '#D7E0E3' : '#323A41',
    text: light ? '#57666E' : '#93A0A7',
    ema20: light ? '#A8701E' : '#E2A94E',
    sma50: light ? '#2E6FA8' : '#8FBFE8',
    // Teal, not purple. Must stay in step with the lesson captions that name
    // this line by colour (see LESSON_CHARTS in @core/charts/lessonCharts.ts)
    // and with --advanced in tokens.css, which carries the same hue in CSS.
    sma150: light ? '#0F6F68' : '#62C0BB',
    gold: light ? '#1D5CAD' : '#6FA8DC',
    goldDim: light ? 'rgba(29,92,173,0.10)' : 'rgba(111,168,220,0.14)',
    bull: light ? '#1E7A4C' : '#5FC28C',
    bear: light ? '#B23A3C' : '#F0787B',
    // Zone fills (support/resistance boxes) reuse the bull/bear hues at low
    // alpha, so a zone reads as "the same idea, softened" rather than a
    // third unrelated colour the learner has to learn.
    supportDim: light ? 'rgba(30,122,76,0.10)' : 'rgba(95,194,140,0.14)',
    resistanceDim: light ? 'rgba(178,58,60,0.10)' : 'rgba(240,120,123,0.14)',
    // The matching LINE colours. Without these, a 'support' or 'resistance'
    // tone resolved its fill correctly but fell through to the informational
    // blue for its border and label — so a resistance zone drew a red box
    // with a blue label on it, and the retest marker came out blue.
    support: light ? '#1E7A4C' : '#5FC28C',
    resistance: light ? '#B23A3C' : '#F0787B',
    // Backing plate for annotation labels. Matches the chart well in each
    // theme so a label reads as sitting IN the chart, not floating over it.
    plate: light ? '#dfe7f0' : '#070b0f'
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
      ctx.fillStyle = up? 'rgba(76,175,125,0.55)':'rgba(224,87,91,0.55)';
      const bw=Math.max(candleW*0.55,1.5);
      ctx.fillRect(x-bw/2, h-bh-2, bw, bh);
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
      const my=ev.clientY-rect.top;
      const price = lo + (1-(my-padT)/chartH)*(hi-lo);
      opts.onClick(price);
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

  ctx.fillStyle='rgba(224,87,91,0.08)';
  ctx.fillRect(padL, yForRsi(100), w-padL-padR, yForRsi(70)-yForRsi(100));
  ctx.fillStyle='rgba(76,175,125,0.08)';
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

/* ---------- lesson render functions ---------- */
