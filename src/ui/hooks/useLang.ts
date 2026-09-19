// Thin accessors over the single app state. They exist so components import
// the capability they need rather than the whole state object — which keeps
// the dependency obvious at the call site and makes a future split of the
// context cheap.
import { useAppState } from '@ui/app/AppState';

export function useLang() {
  const { lang, setLang, t } = useAppState();
  return { lang, setLang, t };
}
