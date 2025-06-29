import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'tamagui';
import {
  Moon,
  Sun,
  Search,
  Shield,
  Trash2,
  Upload,
  Smartphone,
  ChevronDown,
} from 'lucide-react-native';
import { useSettings, useHistory, useBookmarks } from '@/contexts/BrowserContext';
import { useToastController } from '@tamagui/toast';
import { 
  YStack, 
  XStack, 
  Text, 
  Button,
  View,
  Switch,
  Separator,
  Select,
  Adapt,
  ScrollView
} from 'tamagui';

export default function SettingsScreen() {
  const { color } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    settings,
    theme,
    updateSettings,
    setTheme,
  } = useSettings();
  const { clearHistory } = useHistory();
  const { bookmarks } = useBookmarks();
  const toast = useToastController();

  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
    toast.show('Theme Updated', {
      message: `Switched to ${isDark ? 'dark' : 'light'} mode`,
    });
  };

  const handleSearchEngineChange = (engine: string) => {
    updateSettings({ defaultSearchEngine: engine as 'google' | 'bing' | 'duckduckgo' });
    toast.show('Search Engine Updated', {
      message: `Default search engine changed to ${engine.charAt(0).toUpperCase() + engine.slice(1)}`,
    });
  };

  const handleClearAllData = () => {
    clearHistory();
    updateSettings({
      theme: 'light',
      defaultSearchEngine: 'google',
      clearHistoryOnExit: false,
      showSuggestions: true,
      blockPopups: true,
    });
    setTheme('light');
    toast.show('All Data Cleared', {
      message: 'All browsing history and settings have been reset to defaults.',
    });
  };

  const handleExportBookmarks = () => {
    if (bookmarks.length === 0) {
      toast.show('No Bookmarks', {
        message: 'You have no bookmarks to export.',
      });
      return;
    }

    const bookmarkData = JSON.stringify(bookmarks, null, 2);
    console.log('Exported Bookmarks:', bookmarkData);
    
    toast.show('Bookmarks Exported', {
      message: `${bookmarks.length} bookmarks exported to console. Check developer tools to copy the data.`,
    });
  };

  const handleShowSuggestionsChange = (value: boolean) => {
    updateSettings({ showSuggestions: value });
    toast.show('URL Suggestions', {
      message: value ? 'URL suggestions enabled' : 'URL suggestions disabled',
    });
  };

  const handleBlockPopupsChange = (value: boolean) => {
    updateSettings({ blockPopups: value });
    toast.show('Popup Blocking', {
      message: value ? 'Popup blocking enabled' : 'Popup blocking disabled',
    });
  };

  const handleClearHistoryOnExitChange = (value: boolean) => {
    updateSettings({ clearHistoryOnExit: value });
    toast.show('Clear History on Exit', {
      message: value ? 'History will be cleared when app closes' : 'History will be preserved when app closes',
    });
  };

  const isDark = theme === 'dark';

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    rightComponent, 
    onPress, 
    isLast = false 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightComponent?: React.ReactNode | false;
    onPress?: () => void;
    isLast?: boolean;
  }) => {
    if (rightComponent !== false && rightComponent !== undefined) {
      return (
        <View>
          <XStack
            backgroundColor="$gray2"
            borderRadius="$0"
            paddingHorizontal="$4"
            paddingVertical="$3"
            alignItems="center"
            space="$3"
            flex={1}
          >
            <View>{icon}</View>
            <YStack flex={1}>
              <Text fontSize="$4" fontWeight="500" marginBottom="$1">
                {title}
              </Text>
              {subtitle && (
                <Text fontSize="$3" color="$gray10">
                  {subtitle}
                </Text>
              )}
            </YStack>
            <View marginLeft="auto">
              {rightComponent}
            </View>
          </XStack>
          {!isLast && <Separator marginHorizontal="$4" />}
        </View>
      );
    }

    return (
      <View>
        <Button
          backgroundColor="$gray2"
          borderRadius="$0"
          paddingHorizontal="$4"
          paddingVertical="$3"
          height="auto"
          onPress={onPress}
          justifyContent="flex-start"
        >
          <XStack alignItems="center" space="$3" flex={1}>
            <View>{icon}</View>
            <YStack flex={1}>
              <Text fontSize="$4" fontWeight="500" marginBottom="$1" textAlign="left">
                {title}
              </Text>
              {subtitle && (
                <Text fontSize="$3" color="$gray10" textAlign="left">
                  {subtitle}
                </Text>
              )}
            </YStack>
          </XStack>
        </Button>
        {!isLast && <Separator marginHorizontal="$4" />}
      </View>
    );
  };

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
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
          Settings
        </Text>
      </XStack>

      {/* Scrollable Content */}
      <ScrollView 
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        <YStack space="$5" marginHorizontal="$4">
          {/* Appearance */}
          <YStack backgroundColor="$gray2" borderRadius="$4" overflow="hidden">
            <SettingItem
              icon={isDark ? <Moon size={24} color={color.val} /> : <Sun size={24} color={color.val} />}
              title="Dark Mode"
              subtitle="Switch between light and dark themes"
              rightComponent={
                <Switch
                  size="$4"
                  checked={isDark}
                  onCheckedChange={handleThemeChange}
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Switch.Thumb animation="bouncy" />
                </Switch>
              }
              isLast
            />
          </YStack>

          {/* Browsing */}
          <YStack backgroundColor="$gray2" borderRadius="$4" overflow="hidden">
            {/* Search Engine Setting */}
            <XStack
              backgroundColor="$gray2"
              borderRadius="$0"
              paddingHorizontal="$4"
              paddingVertical="$3"
              alignItems="center"
              space="$3"
              flex={1}
            >
              <View><Search size={20} color={color.val} /></View>
              <YStack flex={1}>
                <Text fontSize="$4" fontWeight="500" marginBottom="$1">
                  Search Engine
                </Text>
                <Text fontSize="$3" color="$gray10">
                  Choose your default search engine
                </Text>
              </YStack>
              <Select value={settings.defaultSearchEngine} onValueChange={handleSearchEngineChange}>
                <Select.Trigger
                  width={120}
                  iconAfter={<ChevronDown color={color.val} />}
                >
                  <Select.Value maxWidth={60} textTransform="capitalize">
                    <Text fontSize="$3">
                      {settings.defaultSearchEngine}
                    </Text>
                  </Select.Value>
                </Select.Trigger>

                <Adapt when="sm" platform="touch">
                  <Select.Sheet modal dismissOnSnapToBottom>
                    <Select.Sheet.Frame>
                      <Select.Sheet.ScrollView>
                        <Adapt.Contents />
                      </Select.Sheet.ScrollView>
                    </Select.Sheet.Frame>
                    <Select.Sheet.Overlay />
                  </Select.Sheet>
                </Adapt>

                <Select.Content zIndex={200000}>
                  <Select.Viewport minWidth={200}>
                    <Select.Group>
                      <Select.Label>Search Engines</Select.Label>
                      <Select.Item value="google">
                        <Select.ItemText>Google</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="bing">
                        <Select.ItemText>Bing</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="duckduckgo">
                        <Select.ItemText>DuckDuckGo</Select.ItemText>
                      </Select.Item>
                    </Select.Group>
                  </Select.Viewport>
                </Select.Content>
              </Select>
            </XStack>
            <Separator marginHorizontal="$4" />
            
            <SettingItem
              icon={<Shield size={20} color={color.val} />}
              title="Show Suggestions"
              subtitle="Show URL suggestions while typing"
              rightComponent={
                <Switch
                  size="$4"
                  checked={settings.showSuggestions}
                  onCheckedChange={handleShowSuggestionsChange}
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Switch.Thumb animation="bouncy" />
                </Switch>
              }
            />
            <SettingItem
              icon={<Shield size={20} color={color.val} />}
              title="Block Popups"
              subtitle="Prevent websites from opening popup windows"
              rightComponent={
                <Switch
                  size="$4"
                  checked={settings.blockPopups}
                  onCheckedChange={handleBlockPopupsChange}
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Switch.Thumb animation="bouncy" />
                </Switch>
              }
              isLast
            />
          </YStack>

          {/* Privacy */}
          <YStack backgroundColor="$gray2" borderRadius="$4" overflow="hidden">
            <SettingItem
              icon={<Trash2 size={20} color={color.val} />}
              title="Clear History on Exit"
              subtitle="Automatically clear browsing history when closing the app"
              rightComponent={
                <Switch
                  size="$4"
                  checked={settings.clearHistoryOnExit}
                  onCheckedChange={handleClearHistoryOnExitChange}
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Switch.Thumb animation="bouncy" />
                </Switch>
              }
              isLast
            />
          </YStack>

          {/* Data Management */}
          <YStack backgroundColor="$gray2" borderRadius="$4" overflow="hidden">
            <SettingItem
              icon={<Upload size={20} color={color.val} />}
              title="Export Bookmarks"
              subtitle="Export your bookmarks as JSON data"
              rightComponent={false}
              onPress={handleExportBookmarks}
            />
            <SettingItem
              icon={<Trash2 size={20} color="#FF3B30" />}
              title="Clear All Data"
              subtitle="Clear all browsing data and reset settings"
              rightComponent={false}
              onPress={handleClearAllData}
              isLast
            />
          </YStack>

          {/* App Info */}
          <YStack backgroundColor="$gray2" borderRadius="$4" overflow="hidden">
            <SettingItem
              icon={<Smartphone size={20} color={color.val} />}
              title="Mobile Browser"
              subtitle="Version 1.0.0"
              rightComponent={false}
              isLast
            />
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}