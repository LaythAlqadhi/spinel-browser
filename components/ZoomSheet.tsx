import React from 'react';
import { useTheme } from 'tamagui';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react-native';
import { useTabs } from '@/contexts/BrowserContext';
import { useToastController } from '@tamagui/toast';
import {
  Sheet,
  YStack,
  XStack,
  Text,
  Button,
  View,
  Separator
} from 'tamagui';

interface ZoomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function ZoomSheet({ visible, onClose }: ZoomSheetProps) {
  const { color } = useTheme();
  const { tabs, activeTabId, setTabZoom } = useTabs();
  const toast = useToastController();

  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const currentZoom = activeTab?.zoomLevel || 100;

  const handleZoomChange = (newZoom: number) => {
    if (!activeTab || activeTab.url === 'about:blank') {
      toast.show('Zoom', {
        message: 'Zoom can only be used on loaded web pages.',
      });
      return;
    }

    // Clamp zoom between 25% and 150%
    const clampedZoom = Math.max(25, Math.min(150, newZoom));

    // Update the zoom level in the browser state
    setTabZoom(activeTab.id, clampedZoom);

    // Apply zoom to the WebView
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      webViewRef.applyZoom(clampedZoom);

      toast.show('Zoom Level', {
        message: `Page zoom set to ${clampedZoom}%`,
      });
    } else {
      toast.show('Zoom', {
        message: 'Zoom is not available for this page.',
      });
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(150, currentZoom + 25);
    handleZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(25, currentZoom - 25);
    handleZoomChange(newZoom);
  };

  const handleResetZoom = () => {
    handleZoomChange(100);
  };

  const canZoomIn = currentZoom < 150;
  const canZoomOut = currentZoom > 25;

  return (
    <Sheet
      open={visible}
      onOpenChange={onClose}
      dismissOnSnapToBottom
      snapPoints={[60, 10]}
    >
      <Sheet.Overlay />
      <Sheet.Handle />
      
      <Sheet.Frame
        padding="$0"
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
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
            Zoom Control
          </Text>
          <Button
            size="$3"
            circular
            icon={<X size={24} />}
            onPress={onClose}
            backgroundColor="transparent"
          />
        </XStack>

        {/* Content */}
        <YStack padding="$4" space="$3">
          {/* Current Zoom Display */}
          <YStack alignItems="center" space="$3">
            <Text fontSize="$8" fontWeight="700" color="$color">
              {currentZoom}%
            </Text>
            <Text fontSize="$4" color="$gray10" textAlign="center">
              Current zoom level
            </Text>
          </YStack>

          <Separator />

          {/* Zoom Controls */}
          <XStack space="$3">
              <Button
                flex={1}
                onPress={handleZoomOut}
                disabled={!canZoomOut}
                opacity={!canZoomOut ? 0.5 : 1}
              >
                <ZoomOut size={24} color={color.val} />
                  <Text fontSize="$3" fontWeight="500">
                    Zoom Out
                  </Text>
              </Button>

               <Button
                 flex={1}
              onPress={handleResetZoom}
              disabled={currentZoom === 100}
              opacity={currentZoom === 100 ? 0.5 : 1}
            >
              <RotateCcw size={24} color={color.val} />
              <Text fontSize="$4" fontWeight="500">
                Reset
              </Text>
            </Button>
              
              <Button
                flex={1}
                onPress={handleZoomIn}
                disabled={!canZoomIn}
                opacity={!canZoomIn ? 0.5 : 1}
              >
                 <ZoomIn size={24} color={color.val} />
                  <Text fontSize="$3" fontWeight="500">
                    Zoom In
                  </Text>
              </Button>
            </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}