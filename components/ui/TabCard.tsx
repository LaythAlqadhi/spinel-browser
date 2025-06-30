import React, { memo } from 'react';
import { useTheme } from 'tamagui';
import { X, Globe } from 'lucide-react-native';
import { Tab } from '@/contexts/BrowserContext';
import { 
  YStack, 
  XStack, 
  Text, 
  Button,
  View,
  Image
} from 'tamagui';

interface TabCardProps {
  tab: Tab;
  isActive: boolean;
  onPress: (tabId: string) => void;
  onClose: (tabId: string, event: any) => void;
}

const TabCard = memo(({ tab, isActive, onPress, onClose }: TabCardProps) => {
  const { color } = useTheme();

  const getDisplayUrl = (url: string) => {
    if (url === 'about:blank') return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  const handlePress = () => {
    onPress(tab.id);
  };

  const handleClose = (event: any) => {
    onClose(tab.id, event);
  };

  return (
    <View width="48%" marginBottom="$4">
      <Button
        backgroundColor="$gray2"
        borderColor={isActive ? '$blue8' : '$borderColor'}
        borderWidth={isActive ? 2 : 1}
        borderRadius="$4"
        padding="$0"
        position="relative"
        onPress={handlePress}
        pressStyle={{ backgroundColor: '$gray3' }}
        height={320}
      >
        <YStack flex={1} width="100%">
          {/* Tab Info and Close Button at Top */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$2"
          >
            <XStack alignItems="center" space="$2" flex={1}>
              {/* Favicon */}
              <View
                width={16}
                height={16}
                borderRadius="$2"
                backgroundColor="$gray4"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
              >
                {tab.favicon ? (
                  <Image
                    source={{ uri: tab.favicon }}
                    width={16}
                    height={16}
                    borderRadius="$2"
                  />
                ) : (
                  <Globe size={12} color={color.val} />
                )}
              </View>
              
              {/* URL */}
              <Text 
                fontSize="$2" 
                color="$gray10" 
                numberOfLines={1}
                flex={1}
                textAlign="left"
              >
                {tab.url === "about:blank" ? "New Tab" : getDisplayUrl(tab.url)}
              </Text>
            </XStack>

            {/* Close Button */}
            <Button
              size="$2"
              circular
              icon={<X size={12} />}
              onPress={handleClose}
              marginLeft="$2"
            />
          </XStack>

          {/* Tab Preview */}
          <View
            flex={1}
            backgroundColor="$gray1"
            borderRadius="$3"
            margin="$2"
            marginTop="$0"
            overflow="hidden"
            position="relative"
          >
            {tab.thumbnail ? (
              <Image
                source={{ uri: tab.thumbnail }}
                width="100%"
                height="100%"
                borderRadius="$3"
                resizeMode="stretch"
              />
            ) : (
              <View
                height={270}
                backgroundColor="$background"
                alignItems="center"
                justifyContent="center"
                paddingHorizontal="$2"
                borderBottomWidth={1}
                borderBottomColor="$borderColor"
              >
                <Globe size={24} color={color.val} />
              </View>
            )}
            
            {/* Private overlay */}
            {tab.isPrivate && (
              <View
                position="absolute"
                top="$2"
                right="$2"
                backgroundColor="$purple8"
                borderRadius="$2"
                paddingHorizontal="$2"
                paddingVertical="$1"
              >
                <Text fontSize="$1" color="white" fontWeight="600">
                  PRIVATE
                </Text>
              </View>
            )}
          </View>
        </YStack>
      </Button>
    </View>
  );
});

TabCard.displayName = 'TabCard';

export default TabCard;