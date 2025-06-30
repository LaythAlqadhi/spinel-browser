import React, { useState } from 'react';
import { useTheme } from 'tamagui';
import { Dimensions } from 'react-native';
import { X, Plus, Globe, Shield, Eye, EyeOff } from 'lucide-react-native';
import { useBrowserContext } from '@/contexts/BrowserContext';
import { 
  Sheet, 
  YStack, 
  XStack, 
  Text, 
  Button,
  View,
  Image,
  Tabs,
  SizableText
} from 'tamagui';

const { width } = Dimensions.get('window');

interface TabManagerProps {
  visible: boolean;
  onClose: () => void;
}

export default function TabManager({ visible, onClose }: TabManagerProps) {
  const { color } = useTheme();
  const {
    state: { tabs, activeTabId, theme, isPrivateMode },
    setActiveTab,
    closeTab,
    createTab,
    closeAllPrivateTabs,
  } = useBrowserContext();

  const [activeTabSection, setActiveTabSection] = useState<string>(isPrivateMode ? 'private' : 'regular');

  const regularTabs = tabs.filter(tab => !tab.isPrivate);
  const privateTabs = tabs.filter(tab => tab.isPrivate);

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  const handleCloseTab = (tabId: string, event: any) => {
    event.stopPropagation();
    closeTab(tabId);
    
    if (tabs.length === 1) {
      createTab();
      onClose();
    }
  };

  const handleNewTab = (isPrivate: boolean = false) => {
    createTab(undefined, isPrivate);
  };

  const handleCloseAllPrivateTabs = () => {
    closeAllPrivateTabs();
  };

  const getDisplayUrl = (url: string) => {
    if (url === 'about:blank') return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  const renderTabGrid = (tabList: typeof tabs, isPrivateSection: boolean = false) => (
    <YStack space="$4">
      <XStack flexWrap="wrap" justifyContent="space-between">
        {tabList.map((tab) => (
          <View
            key={tab.id}
            width="48%"
            marginBottom="$4"
          >
            <Button
              backgroundColor="$gray2"
              borderColor={activeTabId === tab.id ? '$blue8' : '$borderColor'}
              borderWidth={activeTabId === tab.id ? 2 : 1}
              borderRadius="$4"
              padding="$0"
              position="relative"
              onPress={() => handleTabPress(tab.id)}
              pressStyle={{ backgroundColor: '$gray3' }}
              height="auto"
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
                    onPress={(event) => handleCloseTab(tab.id, event)}
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
        ))}

        {/* New Tab Button */}
        <View width="48%" marginBottom="$4">
          <Button
            backgroundColor="$gray2"
            borderColor="$borderColor"
            borderWidth={2}
            borderStyle="dashed"
            borderRadius="$4"
            height={320}
            onPress={() => handleNewTab(isPrivateSection)}
          >
            <YStack alignItems="center" justifyContent="center" space="$2">
              <Plus size={32} color={color.val} />
              {isPrivateSection ? (
                <Text fontSize="$3" color="$gray10" textAlign="center">
                  New Private Tab
                </Text>
              ) : (
                <Text fontSize="$3" color="$gray10" textAlign="center">
                  New Tab
                </Text>
              )}
            </YStack>
          </Button>
        </View>
      </XStack>
    </YStack>
  );

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
                  Regular ({regularTabs.length})
                </SizableText>
              </XStack>
            </Tabs.Tab>
            <Tabs.Tab value="private" flex={1}>
              <XStack alignItems="center" space="$2">
                <Shield size={16} color="$purple10" />
                <SizableText fontWeight="500" color="$purple10">
                  Private ({privateTabs.length})
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
              {renderTabGrid(regularTabs, false)}
            </Sheet.ScrollView>
          </Tabs.Content>

          {/* Private Tabs Content */}
          <Tabs.Content value="private" flex={1}>
            <Sheet.ScrollView
              flex={1}
              showsVerticalScrollIndicator={false}
              padding="$4"
            >
              {renderTabGrid(privateTabs, true)}
            </Sheet.ScrollView>
          </Tabs.Content>
        </Tabs>
      </Sheet.Frame>
    </Sheet>
  );
}