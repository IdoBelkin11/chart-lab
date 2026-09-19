import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '@ui/app/App';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('chartlab.lang', 'he');
  location.hash = '#/compare';
});

/**
 * Renders the app and waits for the compare route to arrive.
 *
 * It is loaded on demand (see RouteView — it shares the market/engine/KB
 * graph that the bundle split moved off the initial download), so it is not
 * in the DOM on the first render tick. The assertions below are unchanged;
 * they just wait for the chunk first.
 */
async function renderCompareRoute() {
  render(<App />);
  return screen.findByLabelText('חברה ראשונה', {}, { timeout: 3000 });
}

describe('compare route', () => {
  it('renders two labelled company inputs', async () => {
    expect(await renderCompareRoute()).toBeTruthy();
    expect(screen.getByLabelText('חברה שנייה')).toBeTruthy();
  });

  it('requires both sides before comparing', async () => {
    await renderCompareRoute();
    const submit = screen.getByRole('button', { name: 'השווה' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('חברה ראשונה'), { target: { value: 'Apple' } });
    expect((screen.getByRole('button', { name: 'השווה' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows both companies with their tickers, each exactly once', async () => {
    await renderCompareRoute();
    fireEvent.change(screen.getByLabelText('חברה ראשונה'), { target: { value: 'Apple' } });
    fireEvent.change(screen.getByLabelText('חברה שנייה'), { target: { value: 'Microsoft' } });
    fireEvent.click(screen.getByRole('button', { name: 'השווה' }));

    await waitFor(() => expect(document.querySelectorAll('[class*="company"]').length).toBe(2), { timeout: 3000 });
    // The Hebrew display names already carry a parenthetical, so appending a
    // ticker used to produce "אנבידיה (NVIDIA) (NVDA)". One pair only.
    const companies = document.querySelectorAll('[class*="company"]');
    companies.forEach((el) => {
      expect((el.textContent!.match(/\(/g) ?? []).length).toBe(1);
    });
  });

  it('labels demo data', async () => {
    await renderCompareRoute();
    fireEvent.change(screen.getByLabelText('חברה ראשונה'), { target: { value: 'Apple' } });
    fireEvent.change(screen.getByLabelText('חברה שנייה'), { target: { value: 'Microsoft' } });
    fireEvent.click(screen.getByRole('button', { name: 'השווה' }));
    await waitFor(
      () => expect(screen.getByText('נתוני הדגמה — לא מחירי שוק אמיתיים')).toBeTruthy(),
      { timeout: 3000 }
    );
  });

  it('keeps the global shell', async () => {
    await renderCompareRoute();
    expect(screen.getAllByRole('banner').length).toBe(1);
  });
});
