import { useCallback, useMemo } from 'react';
import { useBrowserContext, Tab } from '@/contexts/BrowserContext';

export function useBrowserTabs() {
  const { state, createTab, closeTab, setActiveTab, updateTab, toggleDesktopMode, setTabZoom } = useBrowserContext();

  const tabs = useMemo(() => state.tabs, [state.tabs]);
  const activeTabId = useMemo(() => state.activeTabId, [state.activeTabId]);
  const isPrivateMode = useMemo(() => state.isPrivateMode, [state.isPrivateMode]);

  const activeTab = useMemo(() => 
    tabs.find(tab => tab.id === activeTabId), 
    [tabs, activeTabId]
  );

  const regularTabs = useMemo(() => 
    tabs.filter(tab => !tab.isPrivate), 
    [tabs]
  );

  const privateTabs = useMemo(() => 
    tabs.filter(tab => tab.isPrivate), 
    [tabs]
  );

  const handleCreateTab = useCallback((url?: string, isPrivate?: boolean) => {
    return createTab(url, isPrivate);
  }, [createTab]);

  const handleCloseTab = useCallback((tabId: string) => {
    closeTab(tabId);
  }, [closeTab]);

  const handleSetActiveTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, [setActiveTab]);

  const handleUpdateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    updateTab(tabId, updates);
  }, [updateTab]);

  const handleToggleDesktopMode = useCallback((tabId: string) => {
    toggleDesktopMode(tabId);
  }, [toggleDesktopMode]);

  const handleSetTabZoom = useCallback((tabId: string, zoomLevel: number) => {
    setTabZoom(tabId, zoomLevel);
  }, [setTabZoom]);

  const canGoBack = useMemo(() => 
    activeTab?.canGoBack || false, 
    [activeTab?.canGoBack]
  );

  const canGoForward = useMemo(() => 
    activeTab?.canGoForward || false, 
    [activeTab?.canGoForward]
  );

  return {
    // State
    tabs,
    activeTabId,
    activeTab,
    isPrivateMode,
    regularTabs,
    privateTabs,
    canGoBack,
    canGoForward,
    
    // Actions
    createTab: handleCreateTab,
    closeTab: handleCloseTab,
    setActiveTab: handleSetActiveTab,
    updateTab: handleUpdateTab,
    toggleDesktopMode: handleToggleDesktopMode,
    setTabZoom: handleSetTabZoom,
  };
}