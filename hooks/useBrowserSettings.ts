import { useCallback, useMemo } from 'react';
import { useBrowserContext, BrowserSettings } from '@/contexts/BrowserContext';

export function useBrowserSettings() {
  const { state, updateSettings, setTheme } = useBrowserContext();

  const settings = useMemo(() => state.settings, [state.settings]);
  const theme = useMemo(() => state.theme, [state.theme]);

  const handleUpdateSettings = useCallback((updates: Partial<BrowserSettings>) => {
    updateSettings(updates);
  }, [updateSettings]);

  const handleSetTheme = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  }, [setTheme]);

  const handleToggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  const handleUpdateSearchEngine = useCallback((engine: 'google' | 'bing' | 'duckduckgo') => {
    updateSettings({ defaultSearchEngine: engine });
  }, [updateSettings]);

  const handleToggleSuggestions = useCallback(() => {
    updateSettings({ showSuggestions: !settings.showSuggestions });
  }, [settings.showSuggestions, updateSettings]);

  const handleTogglePopupBlocking = useCallback(() => {
    updateSettings({ blockPopups: !settings.blockPopups });
  }, [settings.blockPopups, updateSettings]);

  const handleToggleClearHistoryOnExit = useCallback(() => {
    updateSettings({ clearHistoryOnExit: !settings.clearHistoryOnExit });
  }, [settings.clearHistoryOnExit, updateSettings]);

  const isDarkMode = useMemo(() => theme === 'dark', [theme]);

  return {
    // State
    settings,
    theme,
    isDarkMode,
    
    // Actions
    updateSettings: handleUpdateSettings,
    setTheme: handleSetTheme,
    toggleTheme: handleToggleTheme,
    updateSearchEngine: handleUpdateSearchEngine,
    toggleSuggestions: handleToggleSuggestions,
    togglePopupBlocking: handleTogglePopupBlocking,
    toggleClearHistoryOnExit: handleToggleClearHistoryOnExit,
  };
}