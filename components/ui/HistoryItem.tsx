import React, { memo } from 'react';
import { useTheme } from 'tamagui';
import { Globe } from 'lucide-react-native';
import { HistoryEntry } from '@/contexts/BrowserContext';
import { 
  XStack, 
  YStack, 
  Text, 
  Button,
  View
} from 'tamagui';

interface HistoryItemProps {
  entry: HistoryEntry;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress: (entry: HistoryEntry) => void;
  onLongPress?: (entryId: string) => void;
}

const HistoryItem = memo(({ 
  entry, 
  isSelected = false, 
  isSelectionMode = false, 
  onPress, 
  onLongPress 
}: HistoryItemProps) => {
  const { color } = useTheme();

  const visitTime = new Date(entry.visitedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePress = () => {
    onPress(entry);
  };

  const handleLongPress = () => {
    onLongPress?.(entry.id);
  };

  return (
    <Button
      backgroundColor={isSelected ? '$gray4' : '$gray2'}
      onPress={handlePress}
      onLongPress={handleLongPress}
      height="auto"
      paddingVertical="$3"
      borderRadius="$0"
    >
      <XStack alignItems="center" space="$3" flex={1}>
        {isSelectionMode && (
          <View
            width={20}
            height={20}
            borderRadius="$10"
            borderWidth={2}
            borderColor="#007AFF"
            backgroundColor={isSelected ? '#007AFF' : 'transparent'}
            alignItems="center"
            justifyContent="center"
          >
            {isSelected && <Text color="white" fontSize="$2" fontWeight="600">✓</Text>}
          </View>
        )}

        <View>
          <Globe size={24} color={color.val} />
        </View>

        <YStack flex={1}>
          <Text fontSize="$4" fontWeight="500" numberOfLines={1} marginBottom="$1">
            {entry.title}
          </Text>
          <Text fontSize="$3" color="$gray10" numberOfLines={1} marginBottom="$1">
            {entry.url}
          </Text>
          <XStack alignItems="center">
            <Text fontSize="$2" color="$gray10">
              {visitTime}
            </Text>
            {entry.visitCount > 1 && (
              <Text fontSize="$2" color="$gray10" marginLeft="$1">
                • {entry.visitCount} visits
              </Text>
            )}
          </XStack>
        </YStack>
      </XStack>
    </Button>
  );
});

HistoryItem.displayName = 'HistoryItem';

export default HistoryItem;