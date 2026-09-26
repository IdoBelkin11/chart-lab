import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import { App } from '@ui/app/App';
import { lessonsOf } from '@core/curriculum/curriculum';
import { parseHash } from '@ui/hooks/useRoute';

beforeEach(() => {
  localStorage.clear();
  location.hash = '';
  localStorage.setItem('chartlab.lang', 'he');
});

describe('routing onto the curriculum', () => {
  it('previous-build lesson links land on the lesson that now carries that content', () => {
    expect(parseHash('#/lesson/l1')).toEqual({ route: 'lesson', params: { lessonId: 'T4' } });
    expect(parseHash('#l6')).toEqual({ route: 'lesson', params: { lessonId: 'T7' } });
    expect(parseHash('#/lesson/P2')).toEqual({ route: 'lesson', params: { lessonId: 'P2' } });
    expect(parseHash('#/track/R')).toEqual({ route: 'track', params: { trackId: 'R' } });
    expect(parseHash('#/track/X').route).toBe('home');
    expect(parseHash('#/lesson/Z9').route).toBe('home');
  });
});

describe('track page', () => {
  it('lists every lesson of the track, module by module', () => {
    location.hash = '#/track/T';
    render(<App />);
    const page = within(screen.getByRole('main'));
    expect(page.getByRole('heading', { level: 1, name: 'ניתוח טכני' })).toBeTruthy();
    for (const l of lessonsOf('T')) expect(page.getByText(l.title.he)).toBeTruthy();
  });

  it('marks lessons still being written as coming soon, not as learnable', () => {
    location.hash = '#/track/T';
    render(<App />);
    const page = within(screen.getByRole('main'));
    // Every TA lesson is written now.
    expect(page.queryAllByText('בקרוב')).toHaveLength(0);
  });

  it('a track still being written marks every unwritten lesson as coming soon', () => {
    location.hash = '#/track/M';
    render(<App />);
    expect(within(screen.getByRole('main')).getAllByText('בקרוב').length).toBe(lessonsOf('M').length);
  });

  it('its main action opens the first lesson that can actually be learned', () => {
    location.hash = '#/track/T';
    render(<App />);
    fireEvent.click(within(screen.getByRole('main')).getByRole('button', { name: /להתחיל: שיעור 1/ }));
    expect(location.hash).toBe('#/lesson/T1');
  });

  it('a track with nothing written yet offers a preview, never a fake start', () => {
    location.hash = '#/track/M';
    render(<App />);
    const page = within(screen.getByRole('main'));
    expect(page.queryByRole('button', { name: /להתחיל/ })).toBeNull();
    expect(page.getByRole('button', { name: /הצצה לשיעור 1/ })).toBeTruthy();
  });

  it('derivatives stays locked behind the risk track, and says why', () => {
    location.hash = '#/track/D';
    render(<App />);
    const page = within(screen.getByRole('main'));
    expect(page.getByText('המסלול נעול')).toBeTruthy();
    expect(page.getByText(/סיכון, תיק והתנהגות/, { selector: 'p' })).toBeTruthy();
  });
});

describe('a lesson not written yet', () => {
  it('says so honestly, shows what it will teach, and points to a lesson that is ready', () => {
    location.hash = '#/lesson/M2';
    render(<App />);
    const page = within(screen.getByRole('main'));
    expect(page.getByText(/השיעור הזה עוד נכתב/)).toBeTruthy();
    // Nothing in Macro is written yet, so there is no lesson to point to — only the tutor.
    expect(page.queryByRole('button', { name: /^לשיעור \d+:/ })).toBeNull();
    // And every TA lesson opens as a lesson, not a preview.
    cleanup();
    location.hash = '#/lesson/T11';
    render(<App />);
    expect(within(screen.getByRole('main')).queryByText(/השיעור הזה עוד נכתב/)).toBeNull();
  });
});

describe('home', () => {
  it('a first visit offers the first lesson and a way to find the right track', () => {
    render(<App />);
    const page = within(screen.getByRole('main'));
    fireEvent.click(page.getByRole('button', { name: /לא בטוחים מאיפה להתחיל/ }));
    expect(location.hash).toBe('#/onboarding');
  });
});

describe('onboarding', () => {
  const answer = (name: RegExp) => fireEvent.click(screen.getByRole('button', { name }));
  const next = () => fireEvent.click(screen.getByRole('button', { name: /^(המשך|לשאלה הראשונה|להראות לי את המסלול)/ }));

  // The route is loaded on demand, so each test first waits for it to arrive.
  it('runs without the app shell and cannot advance a question left unanswered', async () => {
    location.hash = '#/onboarding';
    render(<App />);
    await screen.findByRole('button', { name: /^לשאלה הראשונה/ });
    expect(screen.queryByRole('navigation', { name: 'ניווט ראשי' })).toBeNull();
    next();
    expect(screen.getByRole('heading', { level: 1, name: 'מה הכי מעניין אתכם ללמוד?' })).toBeTruthy();
    expect((screen.getByRole('button', { name: /^המשך/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('the side panel and the result agree, and every reason names the answer behind it', async () => {
    location.hash = '#/onboarding';
    render(<App />);
    await screen.findByRole('button', { name: /^לשאלה הראשונה/ });
    next();
    answer(/לבנות תיק לטווח ארוך/); next();
    fireEvent.click(screen.getByRole('radio', { name: /עוד לא השקעתי/ })); next();
    fireEvent.click(screen.getByRole('radio', { name: /להבין מה יש לי בתיק ובפנסיה/ })); next();
    const panel = within(screen.getByRole('complementary', { name: 'המסלול מתגבש' }));
    expect(panel.getByText('מוביל')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: /15 דקות/ })); next();
    expect(screen.getByRole('heading', { level: 1, name: 'המסלול שלכם: סיכון, תיק והתנהגות' })).toBeTruthy();
    expect(screen.getByText('בחרתם "לבנות תיק לטווח ארוך"')).toBeTruthy();
    expect(screen.getByText('המטרה: "להבין מה יש לי בתיק ובפנסיה"')).toBeTruthy();
    // Saved once the result is shown, so home can spotlight the same track.
    expect(JSON.parse(localStorage.getItem('chartlab.learning.v2')!).onboarding.answers.goal).toBe('pension');
    fireEvent.click(screen.getByRole('button', { name: /להתחיל: שיעור 1 ביסודות/ }));
    expect(location.hash).toBe('#/lesson/F1');
  });
});
