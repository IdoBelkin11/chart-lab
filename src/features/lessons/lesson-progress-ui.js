// ---------------------------------------------------------------------------
// Lesson progress UI.
//
// Deliberately does NOT edit the 8 lesson sections' existing HTML/content —
// per "do not rewrite good existing educational content unnecessarily" and
// "do not break existing working features," this only APPENDS a small
// footer (mark-complete + prev/next) to each section via JS at load time,
// and decorates the existing .lesson-nav links with a completion mark.
// One function handles all 8 sections identically — adding a 9th lesson
// later needs zero changes here.
// ---------------------------------------------------------------------------
const LESSON_IDS = ['l0','l1','l2','l3','l4','l5','l6','l7'];

function lessonT(he, en){ return (typeof lang !== 'undefined' && lang === 'he') ? he : en; }

let _lessonProgressInitialized = false;
function initLessonProgressUI(){
  if(_lessonProgressInitialized) return;
  _lessonProgressInitialized = true;
  LESSON_IDS.forEach((id, i) => {
    const section = document.getElementById(id);
    if(!section) return;
    const footer = document.createElement('div');
    footer.className = 'lesson-progress-footer';
    footer.innerHTML = `
      <button class="lesson-complete-btn" id="complete-${id}"></button>
      <div class="lesson-progress-nav">
        ${i > 0 ? `<a href="#${LESSON_IDS[i-1]}" class="lesson-nav-arrow">${lessonT('קודם →', '← Previous')}</a>` : '<span></span>'}
        ${i < LESSON_IDS.length-1 ? `<a href="#${LESSON_IDS[i+1]}" class="lesson-nav-arrow">${lessonT('← הבא', 'Next →')}</a>` : '<span></span>'}
      </div>
    `;
    section.appendChild(footer);
    const btn = footer.querySelector('.lesson-complete-btn');
    btn.addEventListener('click', () => toggleLessonComplete(id));
    refreshLessonCompleteButton(id);
  });
  refreshLessonNavBadges();
}

function toggleLessonComplete(id){
  const progress = getLessonProgress();
  if(progress.completed.includes(id)){
    progress.completed = progress.completed.filter(x => x !== id);
    setLessonProgress(progress);
  } else {
    markLessonComplete(id);
  }
  refreshLessonCompleteButton(id);
  refreshLessonNavBadges();
}

function refreshLessonCompleteButton(id){
  const btn = document.getElementById('complete-' + id);
  if(!btn) return;
  const done = getLessonProgress().completed.includes(id);
  btn.classList.toggle('done', done);
  btn.textContent = done ? lessonT('✓ הושלם', '✓ Completed') : lessonT('סמן כהושלם', 'Mark as complete');
}

function refreshLessonNavBadges(){
  const progress = getLessonProgress();
  LESSON_IDS.forEach(id => {
    const link = document.querySelector(`.lesson-nav a[href="#${id}"]`);
    if(link) link.classList.toggle('lesson-done', progress.completed.includes(id));
  });
  const summary = document.getElementById('lesson-progress-summary');
  if(summary) summary.textContent = `${progress.completed.length}/${LESSON_IDS.length}`;
}

// Re-run the button labels/badges whenever the language toggles, so they
// don't stay in the previous language after a switch (setLang() already
// re-renders every [data-i18n] element the same way — this covers the
// dynamically-injected content setLang() doesn't know about).
const _lessonProgressOrigSetLang = (typeof setLang === 'function') ? setLang : null;
if(_lessonProgressOrigSetLang){
  setLang = function(l){
    _lessonProgressOrigSetLang(l);
    LESSON_IDS.forEach(refreshLessonCompleteButton);
  };
}

document.addEventListener('DOMContentLoaded', initLessonProgressUI);
// In case this script runs after DOMContentLoaded already fired (it's
// injected near the end of body, same as the rest of the site's own
// script), initialize immediately too — addEventListener above is the
// fallback for the (unlikely, but cheap to handle) other order.
if(document.readyState !== 'loading') initLessonProgressUI();
