import React, { useState } from 'react';
import { useTheme } from 'tamagui';
import { X, Shield } from 'lucide-react-native';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import { useTabManagerContainer } from '@/hooks/useTabManagerContainer';
import { 
  Sheet, 
  YStack, 
  XStack, 
  Text, 
  Button,
  Tabs,
  SizableText
} from 'tamagui';

interface TabManagerProps {
  visible: boolean;
  onClose: () => void;
}

export default function TabManager({ visible, onClose }: TabManagerProps) {
  const { color } = useTheme();
  const { isPrivateMode, setActiveTab } = useBrowserTabs();
  const [activeTabSection, setActiveTabSection] = useState<string>(isPrivateMode ? 'private' : 'regular');

  const tabManagerContainer = useTabManagerContainer({
    onTabPress: setActiveTab,
    onClose,
  });

  return (
    <Sheet
      open={visible}
      onOpenChange={onClose}
      snapPoints={[90]}
      dismissOnSnapToBottom
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
            Tabs
          </Text>
          <Button
            circular
            backgroundColor="transparent"
            icon={<X size={24} />}
            onPress={onClose}
          />
        </XStack>

        {/* Tabs Navigation */}
        <Tabs
          value={activeTabSection}
          onValueChange={setActiveTabSection}
          orientation="horizontal"
          flexDirection="column"
          flex={1}
        >
          <Tabs.List
            backgroundColor="$background"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
            paddingHorizontal="$4"
          >
            <Tabs.Tab value="regular" flex={1}>
              <XStack alignItems="center" space="$2">
                <SizableText fontWeight="500">
                  Regular ({tabManagerContainer.regularTabs.length})
                </SizableText>
              </XStack>
            </Tabs.Tab>
            <Tabs.Tab value="private" flex={1}>
              <XStack alignItems="center" space="$2">
                <Shield size={16} color="$purple10" />
                <SizableText fontWeight="500" color="$purple10">
                  Private ({tabManagerContainer.privateTabs.length})
                </SizableText>
              </XStack>
            </Tabs.Tab>
          </Tabs.List>

          {/* Regular Tabs Content */}
          <Tabs.Content value="regular" flex={1}>
            <Sheet.ScrollView
              flex={1}
              showsVerticalScrollIndicator={false}
              padding="$4"
            >
              {tabManagerContainer.renderTabGrid(tabManagerContainer.regularTabs, false)}
            </Sheet.ScrollView>
          </Tabs.Content>

          {/* Private Tabs Content */}
          <Tabs.Content value="private" flex={1}>
            <Sheet.ScrollView
              flex={1}
              showsVerticalScrollIndicator={false}
              padding="$4"
            >
              {tabManagerContainer.renderTabGrid(tabManagerContainer.privateTabs, true)}
            </Sheet.ScrollView>
          </Tabs.Content>
        </Tabs>
      </Sheet.Frame>
    </Sheet>
  );
}