import { useMemo, useState } from 'react';
import {
  GLOSSARY_CATEGORY_LABELS,
  GLOSSARY_CATEGORY_ORDER,
  glossaryLabel,
  searchGlossary
} from '@core/glossary/terms';
import type { GlossaryCategory } from '@core/glossary/terms';
import { useLang } from '@ui/hooks/useLang';
import styles from './GlossaryRoute.module.css';

/**
 * The glossary as a page.
 *
 * The same term data that powers the tap-to-define popovers inside lessons,
 * shown as a browsable reference. One source, two surfaces: a definition can
 * never drift between the popover and this page, because there is only one
 * of it.
 *
 * Grouped by category rather than alphabetically. A beginner looking things
 * up rarely knows the word they need — they know roughly which part of the
 * subject confused them, which is what the groups are for. Search covers the
 * alphabetical case, and searches definitions too, so knowing only the idea
 * ("when everyone is selling") is enough to find its name.
 */
export function GlossaryRoute() {
  const { t, lang } = useLang();
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const matches = searchGlossary(query, lang);
    return GLOSSARY_CATEGORY_ORDER.map((cat: GlossaryCategory) => ({
      cat,
      terms: matches
        .filter((term) => term.cat === cat)
        .sort((a, b) => glossaryLabel(a, lang).localeCompare(glossaryLabel(b, lang), lang))
    })).filter((group) => group.terms.length > 0);
  }, [query, lang]);

  const total = useMemo(() => grouped.reduce((n, g) => n + g.terms.length, 0), [grouped]);

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>{t('glossaryTitle')}</h1>
        <p className={styles.intro}>{t('glossaryIntro')}</p>

        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('glossarySearch')}
            aria-label={t('glossarySearch')}
          />
          <span className={styles.count} aria-live="polite">
            {lang === 'he' ? `${total} מונחים` : `${total} terms`}
          </span>
        </div>
      </div>

      {total === 0 ? (
        <p className={styles.empty}>{t('glossaryEmpty')}</p>
      ) : (
        grouped.map((group) => (
          <section key={group.cat} className={styles.group}>
            <h2 className={styles.groupTitle}>
              {GLOSSARY_CATEGORY_LABELS[group.cat][lang]}
            </h2>
            <dl className={styles.list}>
              {group.terms.map((term) => (
                <div key={term.id} className={styles.entry}>
                  <dt className={styles.term}>{glossaryLabel(term, lang)}</dt>
                  <dd className={styles.def}>{term.def[lang]}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))
      )}
    </div>
  );
}
