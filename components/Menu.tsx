import React, { useState } from 'react';
import { useTheme } from 'tamagui';
import {
  Plus,
  Bookmark,
  ZoomIn,
  Monitor,
  BookOpen,
  History,
  Settings,
  X,
  Code,
  Smartphone,
  Shield,
  MonitorSpeaker,
} from 'lucide-react-native';
import { useTabs, useSettings, useBookmarks, useBrowserContext } from '@/contexts/BrowserContext';
import { useToastController } from '@tamagui/toast';
import ZoomSheet from './ZoomSheet';
import { 
  Sheet, 
  YStack, 
  XStack, 
  Text, 
  Button,
  View,
  Separator
} from 'tamagui';

interface MenuProps {
  visible: boolean;
  onClose: () => void;
  onDeviceEmulationToggle?: (active: boolean) => void;
  onBookmarksOpen?: () => void;
  onHistoryOpen?: () => void;
  onSettingsOpen?: () => void;
}

export default function Menu({ 
  visible, 
  onClose, 
  onDeviceEmulationToggle,
  onBookmarksOpen,
  onHistoryOpen,
  onSettingsOpen
}: MenuProps) {
  const { color } = useTheme();
  const { tabs, activeTabId, createTab, isPrivateMode, toggleDesktopMode } = useTabs();
  const { theme } = useSettings();
  const { addBookmark } = useBookmarks();
  const { state } = useBrowserContext();
  const toast = useToastController();
  const [erudaEnabled, setErudaEnabled] = useState(false);
  const [showZoomSheet, setShowZoomSheet] = useState(false);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const handleNewTab = () => {
    createTab();
    onClose();
  };

  const handleNewPrivateTab = () => {
    createTab(undefined, true);
    onClose();
  };

  const handleAddBookmark = () => {
    if (activeTab && activeTab.url && activeTab.title) {
      // Remove the private tab restriction - allow bookmarking from private tabs
      addBookmark(activeTab.url, activeTab.title);
      toast.show('Bookmark Added', {
        message: `"${activeTab.title}" has been bookmarked.`,
      });
    } else {
      toast.show('Cannot Bookmark', {
        message: 'No active page to bookmark.',
      });
    }
    onClose();
  };

  const handleRequestDesktopSite = () => {
    if (!activeTab || activeTab.url === 'about:blank') {
      toast.show('Desktop Site', {
        message: 'Desktop site mode can only be used on loaded web pages.',
      });
      onClose();
      return;
    }

    toggleDesktopMode(activeTab.id);
    
    // Reload the page to apply the new user agent
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      setTimeout(() => {
        webViewRef.reload();
      }, 100);
    }

    toast.show('Desktop Site', {
      message: activeTab.desktopMode 
        ? 'Switched to mobile site' 
        : 'Switched to desktop site',
    });
    onClose();
  };

  const handleZoom = () => {
    if (!activeTab || activeTab.url === 'about:blank') {
      toast.show('Zoom', {
        message: 'Zoom can only be used on loaded web pages.',
      });
      onClose();
      return;
    }

    setShowZoomSheet(true);
    onClose();
  };

  const handleDeviceEmulation = () => {
    if (!activeTab || activeTab.url === 'about:blank') {
      toast.show('Device Emulation', {
        message: 'Device emulation can only be used on loaded web pages.',
      });
      onClose();
      return;
    }

    onDeviceEmulationToggle?.(true);
    onClose();
  };

  const handleDevTools = () => {
    if (!activeTab || activeTab.url === 'about:blank') {
      toast.show('DevTools', {
        message: 'DevTools can only be used on loaded web pages.',
      });
      onClose();
      return;
    }

    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      const erudaScript = `
        (function() {
          if (window.eruda) {
            if (window.eruda._isInit) {
              window.eruda.destroy();
              window.erudaDestroyed = true;
            } else {
              window.eruda.init({
                tool: ['console', 'elements', 'network', 'resources', 'sources', 'snippets'],
                defaults: {
                  theme: 'Monokai Pro'
                }
              });
              eruda.remove('settings');
              eruda.get('entryBtn').hide();
              eruda.show();
              window.erudaDestroyed = false;
            }
            return;
          }
          
          var script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/eruda@3.4.3';
          script.onload = function() {
            if (window.eruda) {
              window.eruda.init({
                tool: ['console', 'elements', 'network', 'resources', 'sources', 'snippets'],
                defaults: {
                  theme: 'Monokai Pro'
                }
              });
              eruda.remove('settings');
              eruda.get('entryBtn').hide();
              eruda.show();
              window.erudaDestroyed = false;
              
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'erudaLoaded',
                  status: 'initialized'
                }));
              }
            }
          };
          script.onerror = function() {
            alert('Failed to load Eruda DevTools. Please check your internet connection.');
          };
          document.head.appendChild(script);
        })();
        true;
      `;

      if (webViewRef.injectJavaScript) {
        webViewRef.injectJavaScript(erudaScript);
        setErudaEnabled(!erudaEnabled);
        toast.show('DevTools', {
          message: erudaEnabled ? 'DevTools disabled' : 'DevTools enabled',
        });
      } else {
        toast.show('DevTools', {
          message: 'DevTools are not available for this page.',
        });
      }
    } else {
      toast.show('DevTools', {
        message: 'DevTools are not available for this page.',
      });
    }
    onClose();
  };

  const handleBookmarks = () => {
    onBookmarksOpen?.();
    onClose();
  };

  const handleHistory = () => {
    onHistoryOpen?.();
    onClose();
  };

  const handleSettings = () => {
    onSettingsOpen?.();
    onClose();
  };

  const getCurrentZoomLevel = () => {
    return activeTab?.zoomLevel || 100;
  };

  const menuItems = [
    {
      icon: <Plus size={24} color={color.val} />,
      title: 'New Tab',
      subtitle: 'Open a new browsing tab',
      onPress: handleNewTab,
    },
    {
      icon: <Shield size={24} color={color.val} />,
      title: 'New Private Tab',
      subtitle: 'Browse without saving history',
      onPress: handleNewPrivateTab,
    },
    {
      icon: <Bookmark size={24} color={color.val} />,
      title: 'Add to Bookmarks',
      subtitle: 'Bookmark current page',
      onPress: handleAddBookmark,
      disabled: !activeTab?.url || activeTab.url === 'about:blank',
    },
    {
      icon: <BookOpen size={24} color={color.val} />,
      title: 'Bookmarks',
      subtitle: `${state.bookmarks.length} saved bookmarks`,
      onPress: handleBookmarks,
    },
    {
      icon: <History size={24} color={color.val} />,
      title: 'History',
      subtitle: `${state.history.length} visited pages`,
      onPress: handleHistory,
    },
    {
      icon: <ZoomIn size={24} color={color.val} />,
      title: 'Zoom',
      subtitle: `Current zoom: ${getCurrentZoomLevel()}%`,
      onPress: handleZoom,
      disabled: !activeTab?.url || activeTab.url === 'about:blank',
    },
    {
      icon: <MonitorSpeaker size={24} color={color.val} />,
      title: activeTab?.desktopMode ? 'Request Mobile Site' : 'Request Desktop Site',
      subtitle: activeTab?.desktopMode 
        ? 'Switch to mobile version of the website'
        : 'Switch to desktop version of the website',
      onPress: handleRequestDesktopSite,
      disabled: !activeTab?.url || activeTab.url === 'about:blank',
    },
    {
      icon: <Smartphone size={24} color="#FF6B35" />,
      title: 'Device Emulation',
      subtitle: 'Test responsive design and device compatibility',
      onPress: handleDeviceEmulation,
      disabled: !activeTab?.url || activeTab.url === 'about:blank',
    },
    {
      icon: <Code size={24} color="#FF6B35" />,
      title: 'DevTools',
      subtitle: 'Debug and inspect web pages',
      onPress: handleDevTools,
      disabled: !activeTab?.url || activeTab.url === 'about:blank',
    },
    {
      icon: <Settings size={24} color={color.val} />,
      title: 'Settings',
      subtitle: 'Browser preferences and options',
      onPress: handleSettings,
    },
  ];

  return (
    <>
      <Sheet
        modal
        open={visible}
        onOpenChange={onClose}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        
        <Sheet.Frame>
          {/* Header */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal="$4"
            paddingVertical="$4"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <Text fontSize="$6" fontWeight="600" color="$color">
              Browser Menu
            </Text>
            <Button
              size="$3"
              circular
              icon={<X size={24} />}
              onPress={onClose}
              backgroundColor="transparent"
            />
          </XStack>

          {/* Menu Items */}
          <Sheet.ScrollView showsVerticalScrollIndicator={false}>
            <YStack>
              {menuItems.map((item, index) => (
                <View key={index}>
                  <Button
                    backgroundColor="$gray2"
                    borderRadius="$0"
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    height="auto"
                    justifyContent="flex-start"
                    onPress={item.onPress}
                    disabled={item.disabled}
                  >
                    <XStack alignItems="center" flex={1}>
                      <View width={40} alignItems="center" marginRight="$4" opacity={item.disabled ? 0.7 : 1}>
                        {item.icon}
                      </View>
                      <YStack flex={1}>
                        <Text
                          fontSize="$4"
                          fontWeight="500"
                          color={item.disabled ? '$gray10' : '$color'}
                          marginBottom="$1"
                          textAlign="left"
                        >
                          {item.title}
                        </Text>
                        <Text
                          fontSize="$3"
                          color="$gray10"
                          numberOfLines={1}
                          textAlign="left"
                        >
                          {item.subtitle}
                        </Text>
                      </YStack>
                    </XStack>
                  </Button>
                  {index < menuItems.length - 1 && (
                    <Separator marginHorizontal="$4" />
                  )}
                </View>
              ))}
            </YStack>
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>

      {/* Zoom Sheet */}
      <ZoomSheet
        visible={showZoomSheet}
        onClose={() => setShowZoomSheet(false)}
      />
    </>
  );
}