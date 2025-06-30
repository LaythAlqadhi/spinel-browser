import React, { memo } from 'react';
import { useTheme } from 'tamagui';
import { Plus } from 'lucide-react-native';
import { 
  YStack, 
  Text, 
  Button,
  View
} from 'tamagui';

interface NewTabCardProps {
  isPrivate?: boolean;
  onPress: () => void;
}

const NewTabCard = memo(({ isPrivate = false, onPress }: NewTabCardProps) => {
  const { color } = useTheme();

  return (
    <View width="48%" marginBottom="$4">
      <Button
        backgroundColor="$gray2"
        borderColor="$borderColor"
        borderWidth={2}
        borderStyle="dashed"
        borderRadius="$4"
        height={320}
        onPress={onPress}
      >
        <YStack alignItems="center" justifyContent="center" space="$2">
          <Plus size={32} color={color.val} />
          <Text fontSize="$3" color="$gray10" textAlign="center">
            {isPrivate ? 'New Private Tab' : 'New Tab'}
          </Text>
        </YStack>
      </Button>
    </View>
  );
});

NewTabCard.displayName = 'NewTabCard';

export default NewTabCard;