import React, { memo } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Share } from 'lucide-react-native';
import { useBrowserNavigation } from '@/hooks/useBrowserNavigation';
import { useToastController } from '@tamagui/toast';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { XStack, Button } from 'tamagui';

interface NavigationControlsProps {
  onReload?: () => void;
  onShare?: () => void;
}

const NavigationControls = memo<NavigationControlsProps>(({ 
  onReload, 
  onShare 
}) => {
  const { canGoBack, canGoForward, navigateBack, navigateForward, reload, activeTab } = useBrowserNavigation();
  const toast = useToastController();

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      reload();
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    if (!activeTab || !activeTab.url) return;
    
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(activeTab.url, {
          dialogTitle: `Share ${activeTab.title}`,
        });
      } else {
        if (Platform.OS === 'web' && navigator.share) {
          await navigator.share({
            title: activeTab.title,
            url: activeTab.url,
          });
        } else {
          toast.show('Share URL', {
            message: `Copy this URL to share: ${activeTab.url}`,
          });
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.show('Share URL', {
        message: `Copy this URL to share: ${activeTab.url}`,
      });
    }
  };

  return (
    <XStack alignItems="center" space="$2">
      <Button
        size="$3"
        backgroundColor="transparent"
        circular
        onPress={navigateBack}
        disabled={!canGoBack}
        opacity={!canGoBack ? 0.5 : 1}
        icon={<ArrowLeft size={20} />}
      />
      
      <Button
        size="$3"
        backgroundColor="transparent"
        circular
        onPress={navigateForward}
        disabled={!canGoForward}
        opacity={!canGoForward ? 0.5 : 1}
        icon={<ArrowRight size={20} />}
      />
      
      <Button
        size="$3"
        backgroundColor="transparent"
        circular
        onPress={handleReload}
        icon={<RotateCcw size={20} />}
      />
      
      <Button
        size="$3"
        backgroundColor="transparent"
        circular
        onPress={handleShare}
        icon={<Share size={20} />}
      />
    </XStack>
  );
});

NavigationControls.displayName = 'NavigationControls';

export default NavigationControls;