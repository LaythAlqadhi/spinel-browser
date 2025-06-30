import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectTabs,
  selectActiveTabId,
  selectActiveTab,
  selectIsPrivateMode,
  selectRegularTabs,
  selectPrivateTabs,
} from '@/store/selectors';
import {
  createTab,
  closeTab,
  setActiveTab,
  updateTab,
  toggleDesktopMode,
  setTabZoom,
  closeAllPrivateTabs,
  initializeTabs,
} from '@/store/slices/tabsSlice';
import { Tab } from '@/store/slices/tabsSlice';

export function useBrowserTabs() {
  const dispatch = useAppDispatch();
  
  const tabs = useAppSelector(selectTabs);
  const activeTabId = useAppSelector(selectActiveTabId);
  const activeTab = useAppSelector(selectActiveTab);
  const isPrivateMode = useAppSelector(selectIsPrivateMode);
  const regularTabs = useAppSelector(selectRegularTabs);
  const privateTabs = useAppSelector(selectPrivateTabs);

  const handleCreateTab = useCallback((url?: string, isPrivate?: boolean) => {
    dispatch(createTab({ url, isPrivate }));
    return Date.now().toString(); // Return the tab ID
  }, [dispatch]);

  const handleCloseTab = useCallback((tabId: string) => {
    dispatch(closeTab({ tabId }));
  }, [dispatch]);

  const handleSetActiveTab = useCallback((tabId: string) => {
    dispatch(setActiveTab({ tabId }));
  }, [dispatch]);

  const handleUpdateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    dispatch(updateTab({ tabId, updates }));
  }, [dispatch]);

  const handleToggleDesktopMode = useCallback((tabId: string) => {
    dispatch(toggleDesktopMode({ tabId }));
  }, [dispatch]);

  const handleSetTabZoom = useCallback((tabId: string, zoomLevel: number) => {
    dispatch(setTabZoom({ tabId, zoomLevel }));
  }, [dispatch]);

  const handleCloseAllPrivateTabs = useCallback(() => {
    dispatch(closeAllPrivateTabs());
  }, [dispatch]);

  const handleInitializeTabs = useCallback(() => {
    dispatch(initializeTabs());
  }, [dispatch]);

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
    closeAllPrivateTabs: handleCloseAllPrivateTabs,
    initializeTabs: handleInitializeTabs,
  };
}