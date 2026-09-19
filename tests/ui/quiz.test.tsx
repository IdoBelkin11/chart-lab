import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '@ui/app/App';
import { questionsForLesson } from '@core/quiz/topicScoping';
import { getQuizQuestions } from '@core/quiz/questions.js';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
});

describe('quiz topic scoping', () => {
  it('a lesson draws its OWN question first', () => {
    const l6 = questionsForLesson('l6', getQuizQuestions({}))!;
    expect(l6[0]!.id).toBe('q-rsi-1');
    const l1 = questionsForLesson('l1', getQuizQuestions({}))!;
    expect(l1[0]!.id).toBe('q-support-1');
  });

  it('different lessons produce different question sets', () => {
    const l0 = questionsForLesson('l0', getQuizQuestions({}))!.map((q) => q.id);
    const l6 = questionsForLesson('l6', getQuizQuestions({}))!.map((q) => q.id);
    expect(l0[0]).not.toBe(l6[0]);
  });
});

describe('quiz route', () => {
  it('renders a question with keyed options', () => {
    location.hash = '#/quiz';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    // Scope to the answers list so shell buttons are not counted.
    const answers = within(screen.getByRole('list', { name: /תשובות|Answers/ }));
    expect(answers.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
  });

  it('answering reveals feedback and an explanation', () => {
    location.hash = '#/quiz';
    render(<App />);
    const answers = within(screen.getByRole('list', { name: /תשובות|Answers/ }));
    fireEvent.click(answers.getAllByRole('button')[0]!);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('locks further answers once one is given', () => {
    location.hash = '#/quiz';
    render(<App />);
    const answers = within(screen.getByRole('list', { name: /תשובות|Answers/ }));
    fireEvent.click(answers.getAllByRole('button')[0]!);
    // Every option is now disabled — a question is answered once.
    expect(answers.getAllByRole('button').every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  it('scoped practice is reachable by URL, not hidden state', () => {
    location.hash = '#/quiz/l6';
    render(<App />);
    // The scope line now NAMES the chapter rather than saying only that a
    // scope exists, so a learner can tell at a glance that practice matches
    // the lesson they came from.
    expect(screen.getByText(/תרגול: RSI/)).toBeTruthy();
  });

  it('scoped practice offers a way back to its own lesson', () => {
    location.hash = '#/quiz/l3';
    render(<App />);
    // Without this the quiz was a dead end: the only exits were "try again"
    // and the course home.
    expect(screen.getAllByRole('button', { name: /חזרה לשיעור: ממוצעים נעים/ }).length)
      .toBeGreaterThan(0);
  });

  it('a lesson quiz asks that lesson\'s question, not a neighbour\'s', () => {
    // The concrete bug this replaces: opening practice from the
    // moving-averages chapter served an RSI question, because selection went
    // through a shared 'technical' category.
    location.hash = '#/quiz/l3';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/ממוצע/);
  });

  it('a general quiz has no lesson scope line and no lesson exit', () => {
    location.hash = '#/quiz';
    render(<App />);
    expect(screen.queryByText(/תרגול:/)).toBeNull();
    expect(screen.queryByRole('button', { name: /חזרה לשיעור/ })).toBeNull();
  });

  it('keeps the global shell', () => {
    location.hash = '#/quiz';
    render(<App />);
    expect(screen.getAllByRole('banner').length).toBe(1);
    expect(screen.getByRole('link', { name: /Chart Lab|צ׳ארט לאב/ })).toBeTruthy();
  });
});

describe('answering does not advance the question', () => {
  it('keeps the same prompt and options on screen until Next is pressed', () => {
    location.hash = '#/quiz/l3';
    render(<App />);
    const promptBefore = screen.getByRole('heading', { level: 1 }).textContent;
    const optionsBefore = screen
      .getByRole('list', { name: /תשובות/ })
      .textContent;

    fireEvent.click(screen.getByRole('list', { name: /תשובות/ }).querySelectorAll('button')[0]!);

    // The engine advances its own index in place on submit. If the view
    // reads the session during render, the prompt and all four options swap
    // out the instant an answer is given — while the learner is still
    // reading the explanation for the question they just answered.
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(promptBefore);
    expect(screen.getByRole('list', { name: /תשובות/ }).textContent).toBe(optionsBefore);

    // Only Next moves on.
    fireEvent.click(screen.getByRole('button', { name: /^הבא$/ }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toBe(promptBefore);
  });

  it('the explanation shown belongs to the question that was answered', () => {
    location.hash = '#/quiz/l3';
    render(<App />);
    fireEvent.click(screen.getByRole('list', { name: /תשובות/ }).querySelectorAll('button')[0]!);
    const status = screen.getByRole('status');
    expect(status.textContent).toMatch(/ממוצע/);
  });

  it('the position counter only advances on Next', () => {
    location.hash = '#/quiz/l3';
    render(<App />);
    expect(screen.getByText('1/3')).toBeTruthy();
    fireEvent.click(screen.getByRole('list', { name: /תשובות/ }).querySelectorAll('button')[0]!);
    expect(screen.getByText('1/3')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^הבא$/ }));
    expect(screen.getByText('2/3')).toBeTruthy();
  });
});
