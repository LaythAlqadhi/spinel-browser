import React, { memo } from 'react';
import { useBrowserNavigation } from '@/hooks/useBrowserNavigation';
import { useTabsStore } from '@/stores/browserStore';
import NavigationControls from '@/components/navigation/NavigationControls';
import UrlInput from '@/components/navigation/UrlInput';
import LoadingProgress from '@/components/ui/LoadingProgress';
import { YStack, XStack, View } from 'tamagui';

interface NavigationBarProps {
  onTabPress: () => void;
  onNewTab: () => void;
}

const NavigationBar = memo<NavigationBarProps>(({ onTabPress, onNewTab }) => {
  const { activeTab } = useBrowserNavigation();
  const { isPrivateMode } = useTabsStore();

  return (
    <YStack
      backgroundColor="$background"
      borderBottomColor="$borderColor"
      borderBottomWidth={1}
      paddingHorizontal="$4"
      paddingVertical="$3"
      position="relative"
    >
      {/* Progress Bar */}
      <LoadingProgress 
        progress={activeTab?.progress || 0} 
        isVisible={activeTab?.loading || false} 
      />
      
      <XStack alignItems="center" space="$3">
        <UrlInput isPrivateMode={isPrivateMode} />
        <NavigationControls />
      </XStack>
    </YStack>
  );
});

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;