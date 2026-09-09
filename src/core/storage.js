// ---------------------------------------------------------------------------
// Persistence layer.
//
// Before this file, the project had exactly two raw localStorage calls
// (theme get/set), each wrapped in its own try/catch. That doesn't scale:
// every future feature that needs to remember something (learning progress,
// quiz scores, watchlist, streaks) would repeat the same namespacing,
// JSON-parsing, and private-browsing-safety boilerplate.
//
// This is that boilerplate, written once. It is deliberately NOT a
// key-value store with arbitrary feature-specific logic baked in — it
// knows nothing about progress or quizzes. Each feature owns its own slice
// of state and its own shape; this only owns getting bytes in and out of
// localStorage safely.
//
// Namespacing: every key is prefixed `chartlab:v1:` so a future breaking
// change to what's stored can bump the version without colliding with old
// data, and so this app's keys can never collide with anything else that
// might share the origin.
// ---------------------------------------------------------------------------
const STORAGE_PREFIX = 'chartlab:v1:';

function storageAvailable(){
  try{
    const testKey = STORAGE_PREFIX + '__test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  }catch(e){
    // Private browsing in some browsers throws on any localStorage access;
    // the app must keep working with state simply not persisting.
    return false;
  }
}

function storageGet(key, fallback, isValidShape){
  if(!storageAvailable()) return fallback;
  try{
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if(raw == null) return fallback;
    const parsed = JSON.parse(raw);
    // A shape validator is optional (most callers just want "did this
    // parse at all"), but for anything a feature later .push()es into or
    // does arithmetic on, a value that parsed fine but has the wrong
    // shape — hand-edited, from an older schema, or corrupted some other
    // way — is just as dangerous as invalid JSON. Falling back to the
    // caller's default here means every accessor gets this for free
    // rather than each one needing its own defensive checks.
    if(isValidShape && !isValidShape(parsed)) return fallback;
    return parsed;
  }catch(e){
    return fallback;
  }
}

function storageSet(key, value){
  if(!storageAvailable()) return false;
  try{
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  }catch(e){
    // Quota exceeded or blocked — the app must not throw over a failed save.
    return false;
  }
}

function storageRemove(key){
  if(!storageAvailable()) return false;
  try{
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  }catch(e){
    return false;
  }
}

// Lists every key this app has stored (with the prefix stripped), for a
// future "clear my data" settings control.
function storageListKeys(){
  if(!storageAvailable()) return [];
  const keys = [];
  for(let i = 0; i < localStorage.length; i++){
    const k = localStorage.key(i);
    if(k && k.indexOf(STORAGE_PREFIX) === 0) keys.push(k.slice(STORAGE_PREFIX.length));
  }
  return keys;
}

// ---------------------------------------------------------------------------
// Namespaced accessors. Each feature gets one function pair here rather
// than calling storageGet/Set directly with a hand-typed key string
// elsewhere in the codebase — this is the one place key names are defined.
// ---------------------------------------------------------------------------
function getThemePreference(){ return storageGet('theme', null); }
function setThemePreference(value){ return storageSet('theme', value); }

function getLanguagePreference(){ return storageGet('lang', null); }
function setLanguagePreference(value){ return storageSet('lang', value); }

// ---------------------------------------------------------------------------
// Lesson progress — { completed: [lessonId, ...], lastVisited: lessonId }.
// `completed` is a plain array, not a Set (JSON-safe), and callers should
// treat it as unordered — dedupe on write, never assume order matters.
// ---------------------------------------------------------------------------
function isValidLessonProgress(v){
  return !!v && typeof v === 'object'
    && Array.isArray(v.completed) && v.completed.every(x => typeof x === 'string')
    && (v.lastVisited === null || typeof v.lastVisited === 'string');
}
function getLessonProgress(){ return storageGet('lessonProgress', { completed: [], lastVisited: null }, isValidLessonProgress); }
function setLessonProgress(progress){ return storageSet('lessonProgress', progress); }
function markLessonComplete(lessonId){
  const progress = getLessonProgress();
  if(!progress.completed.includes(lessonId)) progress.completed.push(lessonId);
  progress.lastVisited = lessonId;
  setLessonProgress(progress);
  return progress;
}

// ---------------------------------------------------------------------------
// Quiz progress — { bestScore: {correct,total,percent} | null, attempts: n,
// lastAttemptAt: ISO string | null }. Deliberately just the summary a
// "your best score" UI needs, not a log of every historical attempt (that
// would grow unbounded) — extend this shape if per-attempt history is ever
// genuinely needed, don't build it speculatively now.
// ---------------------------------------------------------------------------
function isValidQuizProgress(v){
  if(!v || typeof v !== 'object') return false;
  if(typeof v.attempts !== 'number' || !Number.isFinite(v.attempts)) return false;
  if(v.bestScore !== null){
    if(!v.bestScore || typeof v.bestScore !== 'object') return false;
    if(typeof v.bestScore.percent !== 'number' || !Number.isFinite(v.bestScore.percent)) return false;
  }
  return true;
}
function getQuizProgress(){ return storageGet('quizProgress', { bestScore: null, attempts: 0, lastAttemptAt: null }, isValidQuizProgress); }
function setQuizProgress(progress){ return storageSet('quizProgress', progress); }
function recordQuizAttempt(score){
  const progress = getQuizProgress();
  progress.attempts += 1;
  progress.lastAttemptAt = new Date().toISOString();
  if(!progress.bestScore || score.percent > progress.bestScore.percent){
    progress.bestScore = { correct: score.correct, total: score.total, percent: score.percent };
  }
  setQuizProgress(progress);
  return progress;
}

// Reserved for the next features (not yet built — see docs/CLAUDE.md P1):
//   getLearningProgress() / setLearningProgress(progress)
//   getQuizResults() / setQuizResults(results)
//   getWatchlist() / setWatchlist(tickers)
//   getStreak() / setStreak(streak)
// Each should follow the same get/set-by-name pattern above once its data
// shape is actually designed, rather than being stubbed out speculatively
// now.
