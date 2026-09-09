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
//
// PAGINATED LESSON VIEW (added on user feedback): the 8 lessons used to
// all sit in one long scrolling page, which made the per-lesson
// mark-complete footer feel like just one more thing floating in an
// endless scroll, and gave the nav bar no reason to auto-scroll itself —
// scroll-spy only reacted to where the PAGE happened to be, never moved
// the nav strip for you. Now only ONE lesson is visible at a time
// (book-style) — `showLesson()` is the single place that decides which,
// and everything else (nav highlight, nav auto-scroll, prev/next, resume
// on reload) routes through it. Existing content, quizzes, and charts
// inside each <section class="lesson"> are completely untouched; this
// only toggles which section's container is visible.
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
      <button class="lesson-pager-arrow prev" ${i > 0 ? `data-lesson-link="${LESSON_IDS[i-1]}"` : 'disabled'} aria-label="${lessonT('שיעור קודם', 'Previous lesson')}" title="${lessonT('שיעור קודם', 'Previous lesson')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="lesson-pager-center">
        <button class="lesson-complete-btn" id="complete-${id}"></button>
        <span class="lesson-pager-count">${lessonT(`עמוד ${i+1} מתוך ${LESSON_IDS.length}`, `Page ${i+1} of ${LESSON_IDS.length}`)}</span>
      </div>
      <button class="lesson-pager-arrow next" ${i < LESSON_IDS.length-1 ? `data-lesson-link="${LESSON_IDS[i+1]}"` : 'disabled'} aria-label="${lessonT('שיעור הבא', 'Next lesson')}" title="${lessonT('שיעור הבא', 'Next lesson')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
      </button>
    `;
    section.appendChild(footer);
    const btn = footer.querySelector('.lesson-complete-btn');
    btn.addEventListener('click', () => toggleLessonComplete(id));
    footer.querySelectorAll('.lesson-pager-arrow[data-lesson-link]').forEach(arrowBtn => {
      arrowBtn.addEventListener('click', () => showLesson(arrowBtn.getAttribute('data-lesson-link')));
    });
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

// ---------------------------------------------------------------------------
// Pager: exactly one <section class="lesson"> visible at a time.
// ---------------------------------------------------------------------------
let currentLessonId = null;

function isLessonId(id){ return typeof id === 'string' && LESSON_IDS.includes(id); }

// scroll=false is used on the very first paint (nothing to scroll FROM yet)
// and true for every real navigation (nav click, prev/next, hash change).
function showLesson(id, { scroll = true } = {}){
  if(!isLessonId(id)) id = 'l0';
  currentLessonId = id;

  LESSON_IDS.forEach(lid => {
    const sec = document.getElementById(lid);
    if(sec) sec.classList.toggle('lesson-active', lid === id);
  });

  // The scroll-reveal IntersectionObserver (site-template.html) fades in
  // each lesson via opacity until it's seen intersecting the viewport —
  // but a `display:none` element never intersects, and the transition
  // from none→block right as we show it isn't guaranteed to be caught in
  // time by that observer. Explicitly mark the lesson we're revealing as
  // already "in view" so it can never get stuck invisible.
  const activeSection = document.getElementById(id);
  if(activeSection) activeSection.classList.add('in-view');

  // Nav highlight now comes directly from "which lesson is showing" —
  // this REPLACES the old scroll-position-based scroll-spy, which no
  // longer has meaning once only one lesson is ever on screen at once.
  document.querySelectorAll('.lesson-nav a[href^="#l"]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + id);
  });

  // Auto-scroll the horizontally-scrolling nav strip so the active tab is
  // actually visible without the user having to drag it themselves — this
  // is what was missing before: progressing through lessons never moved
  // the strip for you.
  const activeLink = document.querySelector(`.lesson-nav a[href="#${id}"]`);
  if(activeLink && typeof activeLink.scrollIntoView === 'function'){
    activeLink.scrollIntoView({ behavior: scroll ? 'smooth' : 'auto', inline: 'center', block: 'nearest' });
  }

  // Charts inside a hidden (display:none) section can't size themselves
  // correctly — redraw once the target section is actually visible so its
  // canvases pick up their real width instead of whatever they measured
  // (likely 0) the last time they rendered while off-screen.
  if(typeof renderAll === 'function') renderAll();

  if(scroll){
    const sec = document.getElementById(id);
    if(sec && typeof sec.scrollIntoView === 'function'){
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Remember where the user is so a reload resumes here instead of
  // silently jumping back to lesson 1 every time.
  if(typeof getLessonProgress === 'function' && typeof setLessonProgress === 'function'){
    const progress = getLessonProgress();
    progress.lastVisited = id;
    setLessonProgress(progress);
  }

  if(location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
}

function initLessonPager(){
  // Any link to a lesson — the nav bar tabs AND each lesson's own
  // prev/next footer buttons — goes through showLesson() instead of a
  // native anchor jump, since a hidden target section can't be "scrolled
  // to" until it's actually shown.
  document.addEventListener('click', function(e){
    const link = e.target.closest('a[href^="#l"]');
    if(!link) return;
    const id = link.getAttribute('href').slice(1);
    if(!isLessonId(id)) return;
    e.preventDefault();
    showLesson(id);
  });

  window.addEventListener('hashchange', function(){
    const id = location.hash.slice(1);
    // Only react to lesson-shaped hashes — #ai, #quiz, etc. belong to the
    // router (router.js) and must pass through untouched.
    if(isLessonId(id) && id !== currentLessonId) showLesson(id);
  });

  const fromHash = location.hash.slice(1);
  const fromStorage = (typeof getLessonProgress === 'function') ? getLessonProgress().lastVisited : null;
  const initial = isLessonId(fromHash) ? fromHash : (isLessonId(fromStorage) ? fromStorage : 'l0');
  showLesson(initial, { scroll: false });
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
