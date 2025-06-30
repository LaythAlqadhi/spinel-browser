import React, { useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'tamagui';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Ellipsis,
  SquareStack,
} from 'lucide-react-native';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import { useWebViewNavigation } from '@/hooks/useWebViewNavigation';
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
  const { color } = useTheme();
  const { tabs, isPrivateMode } = useBrowserTabs();
  const { canGoBack, canGoForward, goBack, goForward } = useWebViewNavigation();

  const regularTabsCount = useMemo(() => 
    tabs.filter(tab => !tab.isPrivate).length, 
    [tabs]
  );
  
  const privateTabsCount = useMemo(() => 
    tabs.filter(tab => tab.isPrivate).length, 
    [tabs]
  );

  const handleNavigation = useCallback((action: 'back' | 'forward') => {
    if (showHomepage) return;
    
    switch (action) {
      case 'back':
        goBack();
        break;
      case 'forward':
        goForward();
        break;
    }
  }, [showHomepage, goBack, goForward]);

  const navigationCanGoBack = showHomepage ? false : canGoBack;
  const navigationCanGoForward = showHomepage ? false : canGoForward;

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
        disabled={!navigationCanGoBack}
        icon={<ArrowLeft size={24} />}
        opacity={!navigationCanGoBack ? 0.5 : 1}
      />

      {/* Next Page */}
      <Button
        chromeless
        circular
        onPress={() => handleNavigation('forward')}
        disabled={!navigationCanGoForward}
        icon={<ArrowRight size={24} />}
        opacity={!navigationCanGoForward ? 0.5 : 1}
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