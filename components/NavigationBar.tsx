import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useTheme } from 'tamagui';
import { TextInput, Platform } from 'react-native';
import { RotateCcw, Share, Shield, Search, MonitorSmartphone } from 'lucide-react-native';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import { useBrowserHistory } from '@/hooks/useBrowserHistory';
import { useBrowserSettings } from '@/hooks/useBrowserSettings';
import { useWebViewNavigation } from '@/hooks/useWebViewNavigation';
import SecurityIndicator from '@/components/ui/SecurityIndicator';
import { useToastController } from '@tamagui/toast';
import * as Sharing from 'expo-sharing';
import { 
  YStack, 
  XStack, 
  Text, 
  Button,
  View,
  Input
} from 'tamagui';

interface NavigationBarProps {
  onTabPress: () => void;
  onNewTab: () => void;
}

export default function NavigationBar({ onTabPress, onNewTab }: NavigationBarProps) {
  const { color } = useTheme();
  const { activeTab, isPrivateMode } = useBrowserTabs();
  const { history } = useBrowserHistory();
  const { settings } = useBrowserSettings();
  const { reload } = useWebViewNavigation();
  const toast = useToastController();
  
  const [urlInput, setUrlInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  const filteredSuggestions = useMemo(() => {
    if (!settings.showSuggestions || urlInput.length <= 1 || isPrivateMode) {
      return [];
    }

    return history
      .filter(entry => 
        entry.url.toLowerCase().includes(urlInput.toLowerCase()) ||
        entry.title.toLowerCase().includes(urlInput.toLowerCase())
      )
      .slice(0, 5)
      .map(entry => entry.url);
  }, [history, urlInput, settings.showSuggestions, isPrivateMode]);

  const handleUrlSubmit = useCallback(() => {
    if (!activeTab || !urlInput.trim()) return;
    
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      webViewRef.navigateToUrl(urlInput.trim());
    }
    
    setIsEditing(false);
    setUrlInput('');
    setSuggestions([]);
    inputRef.current?.blur();
  }, [activeTab, urlInput]);

  const handleUrlInputChange = useCallback((text: string) => {
    setUrlInput(text);
    setSuggestions(filteredSuggestions);
  }, [filteredSuggestions]);

  const handleUrlInputFocus = useCallback(() => {
    setIsEditing(true);
    setUrlInput(activeTab?.url || '');
  }, [activeTab?.url]);

  const handleUrlInputBlur = useCallback(() => {
    setTimeout(() => {
      setIsEditing(false);
      setUrlInput('');
      setSuggestions([]);
    }, 150);
  }, []);

  const handleSuggestionPress = useCallback((url: string) => {
    if (!activeTab) return;
    
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      webViewRef.navigateToUrl(url);
    }
    
    setIsEditing(false);
    setUrlInput('');
    setSuggestions([]);
    inputRef.current?.blur();
  }, [activeTab]);

  const handleShare = useCallback(async () => {
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
  }, [activeTab, toast]);

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
      {activeTab && activeTab.loading && (
        <View
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height={2}
        >
          <View 
            height="100%"
            backgroundColor={color.val}
            width={`${(activeTab.progress || 0) * 100}%`}
          />
        </View>
      )}
      
      <XStack alignItems="center" space="$3">
        {/* URL Input */}
        <YStack flex={1} position="relative">
          <XStack
            backgroundColor={isPrivateMode ? "$purple2" : "$gray2"}
            borderColor={isPrivateMode ? "$purple8" : "$borderColor"}
            borderWidth={1}
            borderRadius="$6"
            height={40}
            paddingHorizontal="$4"
            alignItems="center"
          >
            <SecurityIndicator url={activeTab?.url || ''} />
            {isPrivateMode && (
              <Shield size={16} color="$purple10" style={{ marginLeft: 4 }} />
            )}
            {activeTab?.desktopMode && (
              <MonitorSmartphone size={16} color={color.val} style={{ marginLeft: 4 }} />
            )}
            <Input
              ref={inputRef}
              flex={1}
              fontSize="$4"
              value={isEditing ? urlInput : (activeTab?.title || activeTab?.url || '')}
              onChangeText={handleUrlInputChange}
              onFocus={handleUrlInputFocus}
              onBlur={handleUrlInputBlur}
              onSubmitEditing={handleUrlSubmit}
              placeholder={isPrivateMode ? "Search privately or enter URL" : "Search or enter URL"}
              returnKeyType="go"
              selectTextOnFocus={true}
              autoCapitalize="none"
              autoCorrect={false}
              backgroundColor="transparent"
              borderWidth={0}
            />
          </XStack>
          
          {/* URL Suggestions */}
          {suggestions.length > 0 && (
            <YStack
              position="absolute"
              top={44}
              left={0}
              right={0}
              backgroundColor="$background"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$3"
              overflow="hidden"
              zIndex={1000}
            >
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  backgroundColor="transparent"
                  borderRadius="$0"
                  height={50}
                  paddingHorizontal="$4"
                  borderBottomWidth={index < suggestions.length - 1 ? 1 : 0}
                  borderBottomColor="$borderColor"
                  onPress={() => handleSuggestionPress(suggestion)}
                  pressStyle={{ backgroundColor: '$gray3' }}
                >
                  <XStack alignItems="center" space="$3">
                    <Search size={16} color={color.val} />
                    <Text fontSize="$4" color="$color" flex={1} numberOfLines={1}>
                      {suggestion}
                    </Text>
                  </XStack>
                </Button>
              ))}
            </YStack>
          )}
        </YStack>

        {/* Right Controls */}
        <XStack alignItems="center" space="$2">
          <Button
            size="$3"
            backgroundColor="transparent"
            circular
            onPress={reload}
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
      </XStack>
    </YStack>
  );
}