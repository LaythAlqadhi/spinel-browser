import React, { useState, useRef } from 'react';
import { useTheme } from 'tamagui';
import { TextInput, Platform } from 'react-native';
import { RotateCcw, Share, Lock, Shield, TriangleAlert as AlertTriangle, Search, MonitorSmartphone } from 'lucide-react-native';
import { useBrowserContext } from '../contexts/BrowserContext';
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
  const {
    state: { tabs, activeTabId, history, settings, theme, isPrivateMode },
  } = useBrowserContext();
  
  const toast = useToastController();
  const [urlInput, setUrlInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const getSecurityStatus = () => {
    if (!activeTab?.url || activeTab.url === 'about:blank') {
      return { type: 'none', icon: null, color: null };
    }

    const url = activeTab.url.toLowerCase();
    
    if (url.startsWith('https://')) {
      return { 
        type: 'secure', 
        icon: <Lock size={16} color="#27CA3F" />, 
        color: '#27CA3F',
        label: 'Secure'
      };
    } else if (url.startsWith('http://')) {
      return { 
        type: 'insecure', 
        icon: <AlertTriangle size={16} color="#FF9500" />, 
        color: '#FF9500',
        label: 'Not Secure'
      };
    } else if (url.startsWith('file://') || url.includes('localhost')) {
      return { 
        type: 'local', 
        icon: <Shield size={16} color="#007AFF" />, 
        color: '#007AFF',
        label: 'Local'
      };
    }

    return { 
      type: 'unknown', 
      icon: <AlertTriangle size={16} color={color.val} />, 
      color: '$gray10',
      label: 'Unknown'
    };
  };

  const securityStatus = getSecurityStatus();

  const handleUrlSubmit = () => {
    if (!activeTab || !urlInput.trim()) return;
    
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      webViewRef.navigateToUrl(urlInput.trim());
    }
    
    setIsEditing(false);
    setUrlInput('');
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleUrlInputChange = (text: string) => {
    setUrlInput(text);
    
    // Don't show suggestions for private tabs
    if (settings.showSuggestions && text.length > 1 && !isPrivateMode) {
      const filteredHistory = history
        .filter(entry => 
          entry.url.toLowerCase().includes(text.toLowerCase()) ||
          entry.title.toLowerCase().includes(text.toLowerCase())
        )
        .slice(0, 5)
        .map(entry => entry.url);
      
      setSuggestions(filteredHistory);
    } else {
      setSuggestions([]);
    }
  };

  const handleUrlInputFocus = () => {
    setIsEditing(true);
    setUrlInput(activeTab?.url || '');
  };

  const handleUrlInputBlur = () => {
    setTimeout(() => {
      setIsEditing(false);
      setUrlInput('');
      setSuggestions([]);
    }, 150);
  };

  const handleSuggestionPress = (url: string) => {
    if (!activeTab) return;
    
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      webViewRef.navigateToUrl(url);
    }
    
    setIsEditing(false);
    setUrlInput('');
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleReload = () => {
    if (!activeTab) return;
    
    const webViewRef = (activeTab as any).webViewRef;
    if (webViewRef) {
      webViewRef.reload();
    }
  };

  const handleShare = async () => {
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
            {securityStatus.icon}
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
            onPress={handleReload}
            icon={<RotateCcw size={20} />}
          />
          
          <Button
            size="$3"
            backgroundColor="transparent"
            circular
            onPress={handleShare}
            icon={<Share size={20}  />}
          />
        </XStack>
      </XStack>
    </YStack>
  );
}