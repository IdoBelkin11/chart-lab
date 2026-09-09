// ---------------------------------------------------------------------------
// Quiz UI — renders a quiz-engine.js session inside the generic
// .app-overlay shell (the same one the stock-detail view uses). All
// question/scoring LOGIC lives in quiz-engine.js / quiz-questions.js and is
// unit-tested there; this file is purely presentation + wiring.
// ---------------------------------------------------------------------------
let quizSession = null;

function quizT(he, en){ return (typeof lang !== 'undefined' && lang === 'he') ? he : en; }

function openQuizView(){
  let overlay = document.getElementById('quiz-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'quiz-overlay';
    overlay.className = 'app-overlay';
    document.body.appendChild(overlay);
  }
  quizSession = createQuizSession({}, 8); // a reasonably short session, not the entire bank every time
  renderQuizShell(overlay);
  renderQuizQuestion(overlay);
  overlay.classList.add('open');
}

function closeQuizView(){
  const overlay = document.getElementById('quiz-overlay');
  if(overlay) overlay.classList.remove('open');
}

function renderQuizShell(overlay){
  const progress = getQuizProgress();
  const bestLine = progress.bestScore
    ? quizT(`השיא שלך: ${progress.bestScore.correct}/${progress.bestScore.total}`, `Your best: ${progress.bestScore.correct}/${progress.bestScore.total}`)
    : '';
  overlay.innerHTML = `
    <div class="app-overlay-header">
      <button class="app-overlay-close" aria-label="close" onclick="navigateTo('')">&times;</button>
      <div class="app-overlay-title">
        <div class="quiz-title">${quizT('בוחן ידע', 'Knowledge Quiz')}</div>
        <div class="quiz-subtitle">${bestLine}</div>
      </div>
    </div>
    <div class="app-overlay-content"><div id="quiz-body" class="quiz-body"></div></div>
  `;
}

function renderQuizQuestion(overlay){
  const body = overlay.querySelector('#quiz-body');
  const q = currentQuestion(quizSession);
  if(!q){
    renderQuizResults(overlay);
    return;
  }
  const l = (typeof lang !== 'undefined') ? lang : 'en';
  const total = quizSession.questions.length;
  const fillPct = Math.round((quizSession.currentIndex / total) * 100);
  body.innerHTML = `
    <div class="quiz-progress" style="--quiz-fill:${fillPct}%">${quizSession.currentIndex + 1} / ${total}</div>
    <p class="q">${q.question[l]}</p>
    <div class="quiz" id="quiz-options"></div>
    <p class="quiz-view-explain" id="quiz-feedback"></p>
  `;
  const optionsWrap = body.querySelector('#quiz-options');
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-view-opt';
    btn.textContent = opt.text[l];
    btn.dataset.key = opt.key;
    btn.addEventListener('click', () => handleQuizAnswer(overlay, opt.key));
    optionsWrap.appendChild(btn);
  });
}

function handleQuizAnswer(overlay, chosenKey){
  const l = (typeof lang !== 'undefined') ? lang : 'en';
  const q = currentQuestion(quizSession);
  const result = submitAnswer(quizSession, chosenKey);
  if(!result) return;

  // Lock the options and mark right/wrong — no more clicks accepted for
  // this question once answered.
  const optionsWrap = overlay.querySelector('#quiz-options');
  [...optionsWrap.children].forEach(btn => {
    btn.disabled = true;
    if(btn.dataset.key === result.correctKey) btn.classList.add('right');
    else if(btn.dataset.key === chosenKey) btn.classList.add('wrong');
  });

  const feedback = overlay.querySelector('#quiz-feedback');
  feedback.classList.add('show');
  feedback.classList.toggle('is-correct', result.correct);
  feedback.classList.toggle('is-wrong', !result.correct);
  feedback.innerHTML = `
    <strong>${result.correct ? quizT('נכון!', 'Correct!') : quizT('לא מדויק', 'Not quite')}</strong><br>
    ${result.explanation[l]}
    <button class="quiz-next-btn" onclick="advanceQuiz()">${quizSession.finished ? quizT('לתוצאות', 'See results') : quizT('הבא', 'Next')}</button>
  `;
}

function advanceQuiz(){
  const overlay = document.getElementById('quiz-overlay');
  renderQuizQuestion(overlay);
}

function renderQuizResults(overlay){
  const score = getQuizScore(quizSession);
  recordQuizAttempt(score);
  const l = (typeof lang !== 'undefined') ? lang : 'en';
  // A conic-gradient ring visualizes the score proportion — the result
  // reads at a glance before you even parse the number.
  const pct = score.percent;
  const ringColor = pct >= 70 ? 'var(--bull)' : (pct >= 40 ? 'var(--accent)' : 'var(--bear)');
  const verdict = pct >= 70 ? quizT('כל הכבוד!', 'Well done!') : (pct >= 40 ? quizT('לא רע', 'Not bad') : quizT('כדאי לחזור על החומר', 'Worth another review'));
  const body = overlay.querySelector('#quiz-body');
  body.innerHTML = `
    <div class="quiz-results">
      <div class="quiz-results-ring" style="background:conic-gradient(${ringColor} ${pct}%, var(--bg-inset) 0);">
        <div class="quiz-results-ring-inner">
          <div class="quiz-results-score">${score.correct}<span class="quiz-results-slash">/${score.total}</span></div>
        </div>
      </div>
      <div class="quiz-results-percent">${pct}% · ${verdict}</div>
      <button class="quiz-next-btn" onclick="restartQuizView()">${quizT('נסה שוב', 'Try again')}</button>
    </div>
  `;
}

function restartQuizView(){
  quizSession = restartQuiz(quizSession);
  const overlay = document.getElementById('quiz-overlay');
  renderQuizQuestion(overlay);
}

registerRoute('quiz', { onEnter: openQuizView, onLeave: closeQuizView });
