import { useState, useEffect, useMemo } from 'react';
import { useHistoryStore, useSettingsStore } from '@/stores/browserStore';

export function useUrlSuggestions(query: string, isPrivateMode: boolean) {
  const { history } = useHistoryStore();
  const { settings } = useSettingsStore();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const filteredSuggestions = useMemo(() => {
    if (!settings.showSuggestions || query.length <= 1 || isPrivateMode) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return history
      .filter(entry => 
        entry.url.toLowerCase().includes(lowerQuery) ||
        entry.title.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .map(entry => entry.url);
  }, [history, query, settings.showSuggestions, isPrivateMode]);

  useEffect(() => {
    setSuggestions(filteredSuggestions);
  }, [filteredSuggestions]);

  return suggestions;
}