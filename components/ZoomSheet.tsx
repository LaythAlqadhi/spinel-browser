import React, { memo } from 'react';
import { useTheme } from 'tamagui';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react-native';
import { useZoomControl } from '@/hooks/useZoomControl';
import {
  Sheet,
  YStack,
  XStack,
  Text,
  Button,
  Separator
} from 'tamagui';

interface ZoomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const ZoomSheet = memo<ZoomSheetProps>(({ visible, onClose }) => {
  const { color } = useTheme();
  const { currentZoom, canZoomIn, canZoomOut, zoomIn, zoomOut, resetZoom } = useZoomControl();

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
              onPress={zoomOut}
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
              onPress={resetZoom}
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
              onPress={zoomIn}
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
});

ZoomSheet.displayName = 'ZoomSheet';

export default ZoomSheet;