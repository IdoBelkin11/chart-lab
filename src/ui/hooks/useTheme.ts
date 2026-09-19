import { useAppState } from '@ui/app/AppState';

export function useTheme() {
  const { theme, toggleTheme } = useAppState();
  return { theme, toggleTheme };
}
