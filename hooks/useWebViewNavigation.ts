import { useCallback, useMemo } from 'react';
import { useBrowserTabs } from './useBrowserTabs';
import { useBrowserSettings } from './useBrowserSettings';
import { webViewRefs } from '@/components/BrowserWebView';

export function useWebViewNavigation() {
  const { activeTab, updateTab } = useBrowserTabs();
  const { settings } = useBrowserSettings();

  const canGoBack = useMemo(() => activeTab?.canGoBack || false, [activeTab?.canGoBack]);
  const canGoForward = useMemo(() => activeTab?.canGoForward || false, [activeTab?.canGoForward]);
  const isLoading = useMemo(() => activeTab?.loading || false, [activeTab?.loading]);

  const navigateToUrl = useCallback((url: string) => {
    if (!activeTab) return;

    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        formattedUrl = `https://${url}`;
      } else {
        const searchEngine = settings.defaultSearchEngine;
        const searchUrls = {
          google: `https://www.google.com/search?q=${encodeURIComponent(url)}`,
          bing: `https://www.bing.com/search?q=${encodeURIComponent(url)}`,
          duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(url)}`,
        };
        formattedUrl = searchUrls[searchEngine];
      }
    }

    const webViewRef = webViewRefs.get(activeTab.id);
    if (webViewRef) {
      webViewRef.navigateToUrl(formattedUrl);
    }
  }, [activeTab, settings.defaultSearchEngine]);

  const goBack = useCallback(() => {
    if (!activeTab || !canGoBack) return;
    
    const webViewRef = webViewRefs.get(activeTab.id);
    if (webViewRef) {
      webViewRef.goBack();
    }
  }, [activeTab, canGoBack]);

  const goForward = useCallback(() => {
    if (!activeTab || !canGoForward) return;
    
    const webViewRef = webViewRefs.get(activeTab.id);
    if (webViewRef) {
      webViewRef.goForward();
    }
  }, [activeTab, canGoForward]);

  const reload = useCallback(() => {
    if (!activeTab) return;
    
    const webViewRef = webViewRefs.get(activeTab.id);
    if (webViewRef) {
      webViewRef.reload();
    }
  }, [activeTab]);

  const applyZoom = useCallback((zoomLevel: number) => {
    if (!activeTab) return;
    
    const webViewRef = webViewRefs.get(activeTab.id);
    if (webViewRef) {
      webViewRef.applyZoom(zoomLevel);
    }
  }, [activeTab]);

  const resetZoom = useCallback(() => {
    if (!activeTab) return;
    
    const webViewRef = webViewRefs.get(activeTab.id);
    if (webViewRef) {
      webViewRef.resetZoom();
    }
  }, [activeTab]);

  const getDisplayTitle = useCallback((title: string, url: string) => {
    if (title && title !== 'Loading...' && title.trim() !== '') {
      return title;
    }
    
    if (url === 'about:blank') {
      return 'New Tab';
    }
    
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }, []);

  const extractFavicon = useCallback((url: string) => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      return undefined;
    }
  }, []);

  return {
    // State
    canGoBack,
    canGoForward,
    isLoading,
    activeTab,
    
    // Actions
    navigateToUrl,
    goBack,
    goForward,
    reload,
    applyZoom,
    resetZoom,
    
    // Utilities
    getDisplayTitle,
    extractFavicon,
  };
}