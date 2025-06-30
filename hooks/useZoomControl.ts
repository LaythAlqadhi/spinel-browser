import { useCallback } from 'react';
import { useTabsStore } from '@/stores/browserStore';
import { useToastController } from '@tamagui/toast';

export function useZoomControl() {
  const { tabs, activeTabId, setTabZoom } = useTabsStore();
  const toast = useToastController();
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const currentZoom = activeTab?.zoomLevel || 100;

  const applyZoom = useCallback((newZoom: number) => {
    if (!activeTab || activeTab.url === 'about:blank') {
      toast.show('Zoom', {
        message: 'Zoom can only be used on loaded web pages.',
      });
      return false;
    }

    const clampedZoom = Math.max(25, Math.min(150, newZoom));
    setTabZoom(activeTab.id, clampedZoom);

    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      webViewRef.applyZoom(clampedZoom);
      toast.show('Zoom Level', {
        message: `Page zoom set to ${clampedZoom}%`,
      });
      return true;
    } else {
      toast.show('Zoom', {
        message: 'Zoom is not available for this page.',
      });
      return false;
    }
  }, [activeTab, setTabZoom, toast]);

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(150, currentZoom + 25);
    return applyZoom(newZoom);
  }, [currentZoom, applyZoom]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(25, currentZoom - 25);
    return applyZoom(newZoom);
  }, [currentZoom, applyZoom]);

  const resetZoom = useCallback(() => {
    return applyZoom(100);
  }, [applyZoom]);

  return {
    currentZoom,
    canZoomIn: currentZoom < 150,
    canZoomOut: currentZoom > 25,
    applyZoom,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}