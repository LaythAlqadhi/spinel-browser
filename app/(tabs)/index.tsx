import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabs, useSettings, useBrowserContext } from '@/contexts/BrowserContext';
import BrowserWebView from '@/components/BrowserWebView';
import NavigationBar from '@/components/NavigationBar';
import TabManager from '@/components/TabManager';
import BottomNavigation from '@/components/BottomNavigation';
import Menu from '@/components/Menu';
import DeviceEmulationContainer from '@/components/DeviceEmulationContainer';
import DeviceEmulationToolbar from '@/components/DeviceEmulationToolbar';
import ZoomSheet from '@/components/ZoomSheet';
import { Plus } from 'lucide-react-native';
import { 
  YStack, 
  XStack, 
  Text, 
  Button,
  View
} from 'tamagui';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface EmulationSettings {
  width: number;
  height: number;
  zoom: number;
  isRotated: boolean;
  selectedDevice: string;
}

export default function BrowserScreen() {
  const { tabs, activeTabId, createTab } = useTabs();
  const { theme } = useSettings();
  const { initializeStore } = useBrowserContext();
  const insets = useSafeAreaInsets();
  const [showTabManager, setShowTabManager] = useState(false);
  const [showHomepage, setShowHomepage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showZoomSheet, setShowZoomSheet] = useState(false);
  const [deviceEmulationActive, setDeviceEmulationActive] = useState(false);
  const [emulationSettings, setEmulationSettings] = useState<EmulationSettings>({
    width: Math.floor(screenWidth),
    height: Math.floor(screenHeight),
    zoom: 100,
    isRotated: false,
    selectedDevice: 'responsive',
  });

  useEffect(() => {
    initializeStore();
  }, []);

  useEffect(() => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      const isBlankTab = activeTab.url === 'about:blank';
      setShowHomepage(isBlankTab);
    } else {
      setShowHomepage(false);
    }
  }, [tabs, activeTabId]);

  const handleNewTab = () => {
    createTab();
  };

  const handleTabManagerOpen = () => {
    setShowTabManager(true);
  };

  const handleTabManagerClose = () => {
    setShowTabManager(false);
  };

  const handleMenuOpen = () => {
    setShowMenu(true);
  };

  const handleMenuClose = () => {
    setShowMenu(false);
  };

  const handleZoomOpen = () => {
    setShowZoomSheet(true);
  };

  const handleZoomClose = () => {
    setShowZoomSheet(false);
  };

  const handleDeviceEmulationToggle = (active: boolean) => {
    setDeviceEmulationActive(active);
  };

  const handleDeviceEmulationClose = () => {
    setDeviceEmulationActive(false);
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
      {deviceEmulationActive && (
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
        isActive={deviceEmulationActive}
      >
        <View flex={1} position="relative">
          {tabs.map((tab) => (
            <BrowserWebView
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onHomepageStateChange={setShowHomepage}
              emulationZoom={deviceEmulationActive ? emulationSettings.zoom : 100}
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

      {/* Tab Manager */}
      <TabManager
        visible={showTabManager}
        onClose={handleTabManagerClose}
      />

      {/* Menu */}
      <Menu
        visible={showMenu}
        onClose={handleMenuClose}
        onDeviceEmulationToggle={handleDeviceEmulationToggle}
        onZoomOpen={handleZoomOpen}
      />

      {/* Zoom Sheet */}
      <ZoomSheet
        visible={showZoomSheet}
        onClose={handleZoomClose}
      />
    </YStack>
  );
}