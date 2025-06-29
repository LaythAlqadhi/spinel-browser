import React, { useState, useEffect, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabsStore, useSettingsStore, useBrowserStore } from '@/stores/browserStore';
import { useDeviceEmulation, EmulationSettings } from '@/hooks/useDeviceEmulation';
import BrowserWebView from '@/components/BrowserWebView';
import NavigationBar from '@/components/NavigationBar';
import TabManager from '@/components/TabManager';
import BottomNavigation from '@/components/BottomNavigation';
import Menu from '@/components/Menu';
import BookmarksSheet from '@/components/BookmarksSheet';
import HistorySheet from '@/components/HistorySheet';
import SettingsSheet from '@/components/SettingsSheet';
import DeviceEmulationContainer from '@/components/DeviceEmulationContainer';
import DeviceEmulationToolbar from '@/components/DeviceEmulationToolbar';
import { 
  YStack, 
  View
} from 'tamagui';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function BrowserScreen() {
  const { tabs, activeTabId, createTab } = useTabsStore();
  const { theme } = useSettingsStore();
  const initializeStore = useBrowserStore((state) => state.initializeStore);
  const insets = useSafeAreaInsets();
  
  // UI State
  const [showTabManager, setShowTabManager] = useState(false);
  const [showHomepage, setShowHomepage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Device Emulation
  const deviceEmulation = useDeviceEmulation();
  const [emulationSettings, setEmulationSettings] = useState<EmulationSettings>({
    width: Math.floor(screenWidth),
    height: Math.floor(screenHeight),
    zoom: 100,
    isRotated: false,
    selectedDevice: 'responsive',
  });

  // Memoized active tab
  const activeTab = useMemo(() => 
    tabs.find(tab => tab.id === activeTabId), 
    [tabs, activeTabId]
  );

  // Initialize store on mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Update homepage state based on active tab
  useEffect(() => {
    if (activeTab) {
      const isBlankTab = activeTab.url === 'about:blank';
      setShowHomepage(isBlankTab);
    } else {
      setShowHomepage(false);
    }
  }, [activeTab]);

  // Event handlers
  const handleNewTab = () => createTab();
  const handleTabManagerOpen = () => setShowTabManager(true);
  const handleTabManagerClose = () => setShowTabManager(false);
  const handleMenuOpen = () => setShowMenu(true);
  const handleMenuClose = () => setShowMenu(false);
  const handleBookmarksOpen = () => setShowBookmarks(true);
  const handleBookmarksClose = () => setShowBookmarks(false);
  const handleHistoryOpen = () => setShowHistory(true);
  const handleHistoryClose = () => setShowHistory(false);
  const handleSettingsOpen = () => setShowSettings(true);
  const handleSettingsClose = () => setShowSettings(false);

  const handleDeviceEmulationToggle = (active: boolean) => {
    if (active) {
      deviceEmulation.activate();
    } else {
      deviceEmulation.deactivate();
    }
  };

  const handleDeviceEmulationClose = () => {
    deviceEmulation.deactivate();
  };

  const handleEmulationSettingsChange = (settings: EmulationSettings) => {
    setEmulationSettings(settings);
  };

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      {/* Navigation Bar - Always at top, outside emulation */}
      {!showHomepage && (
        <NavigationBar
          onTabPress={handleTabManagerOpen}
          onNewTab={handleNewTab}
        />
      )}

      {/* Device Emulation Toolbar - Only show when emulation is active */}
      {deviceEmulation.isActive && (
        <DeviceEmulationToolbar
          onEmulationSettingsChange={handleEmulationSettingsChange}
          onClose={handleDeviceEmulationClose}
        />
      )}

      {/* WebView Container - This is what gets emulated */}
      <DeviceEmulationContainer
        emulatedWidth={emulationSettings.width}
        emulatedHeight={emulationSettings.height}
        emulatedZoom={emulationSettings.zoom}
        emulatedIsRotated={emulationSettings.isRotated}
        isActive={deviceEmulation.isActive}
      >
        <View flex={1} position="relative">
          {tabs.map((tab) => (
            <BrowserWebView
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onHomepageStateChange={setShowHomepage}
              emulationZoom={deviceEmulation.isActive ? emulationSettings.zoom : 100}
            />
          ))}
        </View>
      </DeviceEmulationContainer>

      {/* Bottom Navigation - Always at bottom, outside emulation */}
      <BottomNavigation
        onNewTab={handleNewTab}
        onTabPress={handleTabManagerOpen}
        onDrawerPress={handleMenuOpen}
        showHomepage={showHomepage}
      />

      {/* Modals and Sheets */}
      <TabManager
        visible={showTabManager}
        onClose={handleTabManagerClose}
      />

      <Menu
        visible={showMenu}
        onClose={handleMenuClose}
        onDeviceEmulationToggle={handleDeviceEmulationToggle}
        onBookmarksOpen={handleBookmarksOpen}
        onHistoryOpen={handleHistoryOpen}
        onSettingsOpen={handleSettingsOpen}
      />

      <BookmarksSheet
        visible={showBookmarks}
        onClose={handleBookmarksClose}
      />

      <HistorySheet
        visible={showHistory}
        onClose={handleHistoryClose}
      />

      <SettingsSheet
        visible={showSettings}
        onClose={handleSettingsClose}
      />
    </YStack>
  );
}