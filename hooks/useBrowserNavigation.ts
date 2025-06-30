import { useCallback } from 'react';
import { useTabsStore } from '@/stores/browserStore';

export function useBrowserNavigation() {
  const { tabs, activeTabId, updateTab } = useTabsStore();
  const activeTab = tabs.find(tab => tab.id === activeTabId);

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

  return {
    activeTab,
    canGoBack: activeTab?.canGoBack || false,
    canGoForward: activeTab?.canGoForward || false,
    isLoading: activeTab?.loading || false,
    navigateBack,
    navigateForward,
    reload,
    navigateToUrl,
  };
}