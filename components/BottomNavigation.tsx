import React from 'react';
import {
  Platform,
} from 'react-native';
import { useTheme } from 'tamagui';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Ellipsis,
  Square,
  SquareStack,
  Shield,
} from 'lucide-react-native';
import { useTabs, useSettings, useBrowserContext } from '@/contexts/BrowserContext';
import { 
  XStack, 
  Text, 
  Button,
  View
} from 'tamagui';

interface BottomNavigationProps {
  onNewTab: () => void;
  onTabPress: () => void;
  onDrawerPress: () => void;
  showHomepage: boolean;
}

export default function BottomNavigation({ 
  onNewTab, 
  onTabPress, 
  onDrawerPress,
  showHomepage 
}: BottomNavigationProps) {
  const { color } = useTheme()
  const { tabs, activeTabId, isPrivateMode } = useTabs();
  const { theme } = useSettings();
  const { state } = useBrowserContext();

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const handleNavigation = (action: 'back' | 'forward') => {
    if (!activeTab || showHomepage) return;
    
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      switch (action) {
        case 'back':
          webViewRef.goBack();
          break;
        case 'forward':
          webViewRef.goForward();
          break;
      }
    }
  };

  const canGoBack = showHomepage ? false : activeTab?.canGoBack || false;
  const canGoForward = showHomepage ? false : activeTab?.canGoForward || false;

  const regularTabsCount = tabs.filter(tab => !tab.isPrivate).length;
  const privateTabsCount = tabs.filter(tab => tab.isPrivate).length;

  return (
    <XStack
      backgroundColor="$background"
      borderTopColor="$borderColor"
      borderTopWidth={1}
      alignItems="center"
      justifyContent="space-around"
      paddingHorizontal="$4"
      paddingVertical="$3"
      paddingBottom={Platform.OS === 'ios' ? '$8' : '$3'}
    >
      {/* Previous Page */}
      <Button
        chromeless
        circular
        onPress={() => handleNavigation('back')}
        disabled={!canGoBack}
        icon={<ArrowLeft size={24} />}
        opacity={!canGoBack ? 0.5 : 1}
      />

      {/* Next Page */}
      <Button
        chromeless
        circular
        onPress={() => handleNavigation('forward')}
        disabled={!canGoForward}
        icon={<ArrowRight size={24} />}
        opacity={!canGoForward ? 0.5 : 1}
      />

      {/* Add Tab */}
      <Button
        themeInverse={!isPrivateMode}
        circular
        onPress={onNewTab}
        icon={<Plus size={24} />}
      />

      {/* Tabs Button */}
      <Button
        chromeless
        circular
        onPress={onTabPress}
        position="relative"
      >
        <View position="relative">
          <SquareStack size={24} color={color.val} />
          
          {/* Tab count badge */}
          <View
            position="absolute"
            top={-12}
            right={-12}
            backgroundColor={isPrivateMode ? "$purple8" : "$green8"}
            borderRadius="$10"
            minWidth={24}
            height={24}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal="$1"
          >
            <Text 
              fontSize="$1" 
              color="white" 
              fontWeight="600"
              lineHeight={18}
            >
              {isPrivateMode ? privateTabsCount : regularTabsCount}
            </Text>
          </View>
        </View>
      </Button>

      {/* Menu */}
      <Button
        chromeless
        circular
        onPress={onDrawerPress}
        icon={<Ellipsis size={24} />}
      />
    </XStack>
  );
}