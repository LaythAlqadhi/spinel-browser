import { useCallback, useMemo } from 'react';
import { useTabsStore } from '@/stores/browserStore';

export function useBrowserNavigation() {
  const { tabs, activeTabId, updateTab } = useTabsStore();
  
  const activeTab = useMemo(() => 
    tabs.find(tab => tab.id === activeTabId), 
    [tabs, activeTabId]
  );

  const navigateBack = useCallback(() => {
    if (!activeTab) return false;
    
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef && activeTab.canGoBack) {
      webViewRef.goBack();
      return true;
    }
    return false;
  }, [activeTab]);

  const navigateForward = useCallback(() => {
    if (!activeTab) return false;
    
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef && activeTab.canGoForward) {
      webViewRef.goForward();
      return true;
    }
    return false;
  }, [activeTab]);

  const reload = useCallback(() => {
    if (!activeTab) return false;
    
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      webViewRef.reload();
      return true;
    }
    return false;
  }, [activeTab]);

  const navigateToUrl = useCallback((url: string) => {
    if (!activeTab) return false;
    
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      webViewRef.navigateToUrl(url);
      return true;
    }
    return false;
  }, [activeTab]);

  const canGoBack = useMemo(() => activeTab?.canGoBack || false, [activeTab?.canGoBack]);
  const canGoForward = useMemo(() => activeTab?.canGoForward || false, [activeTab?.canGoForward]);
  const isLoading = useMemo(() => activeTab?.loading || false, [activeTab?.loading]);

  return {
    activeTab,
    canGoBack,
    canGoForward,
    isLoading,
    navigateBack,
    navigateForward,
    reload,
    navigateToUrl,
  };
}