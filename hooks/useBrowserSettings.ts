import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectSettings,
  selectTheme,
  selectIsDarkMode,
  selectSearchEngine,
  selectShowSuggestions,
  selectBlockPopups,
  selectClearHistoryOnExit,
} from '@/store/selectors';
import {
  updateSettings,
  setTheme,
  setSearchEngine,
  toggleSuggestions,
  togglePopupBlocking,
  toggleClearHistoryOnExit,
  resetSettings,
} from '@/store/slices/settingsSlice';
import { BrowserSettings } from '@/store/slices/settingsSlice';

export function useBrowserSettings() {
  const dispatch = useAppDispatch();
  
  const settings = useAppSelector(selectSettings);
  const theme = useAppSelector(selectTheme);
  const isDarkMode = useAppSelector(selectIsDarkMode);

  const handleUpdateSettings = useCallback((updates: Partial<BrowserSettings>) => {
    dispatch(updateSettings(updates));
  }, [dispatch]);

  const handleSetTheme = useCallback((newTheme: 'light' | 'dark') => {
    dispatch(setTheme(newTheme));
  }, [dispatch]);

  const handleToggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  }, [theme, dispatch]);

  const handleUpdateSearchEngine = useCallback((engine: 'google' | 'bing' | 'duckduckgo') => {
    dispatch(setSearchEngine(engine));
  }, [dispatch]);

  const handleToggleSuggestions = useCallback(() => {
    dispatch(toggleSuggestions());
  }, [dispatch]);

  const handleTogglePopupBlocking = useCallback(() => {
    dispatch(togglePopupBlocking());
  }, [dispatch]);

  const handleToggleClearHistoryOnExit = useCallback(() => {
    dispatch(toggleClearHistoryOnExit());
  }, [dispatch]);

  const handleResetSettings = useCallback(() => {
    dispatch(resetSettings());
  }, [dispatch]);

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
    resetSettings: handleResetSettings,
  };
}