import React, { memo, useState, useRef, useCallback } from 'react';
import { TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from 'tamagui';
import { useUrlSuggestions } from '@/hooks/useUrlSuggestions';
import { useBrowserNavigation } from '@/hooks/useBrowserNavigation';
import { useTabsStore } from '@/stores/browserStore';
import SecurityIndicator from '@/components/ui/SecurityIndicator';
import { YStack, XStack, Input, Button, Text, View } from 'tamagui';

interface UrlInputProps {
  isPrivateMode?: boolean;
  onNavigate?: (url: string) => void;
}

const UrlInput = memo<UrlInputProps>(({ isPrivateMode = false, onNavigate }) => {
  const { color } = useTheme();
  const { activeTab, navigateToUrl } = useBrowserNavigation();
  const { tabs } = useTabsStore();
  const inputRef = useRef<TextInput>(null);
  
  const [urlInput, setUrlInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const suggestions = useUrlSuggestions(urlInput, isPrivateMode);

  const handleSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    
    if (onNavigate) {
      onNavigate(urlInput.trim());
    } else {
      navigateToUrl(urlInput.trim());
    }
    
    setIsEditing(false);
    setUrlInput('');
    inputRef.current?.blur();
  }, [urlInput, onNavigate, navigateToUrl]);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
    setUrlInput(activeTab?.url || '');
  }, [activeTab?.url]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsEditing(false);
      setUrlInput('');
    }, 150);
  }, []);

  const handleSuggestionPress = useCallback((url: string) => {
    if (onNavigate) {
      onNavigate(url);
    } else {
      navigateToUrl(url);
    }
    
    setIsEditing(false);
    setUrlInput('');
    inputRef.current?.blur();
  }, [onNavigate, navigateToUrl]);

  const displayValue = isEditing ? urlInput : (activeTab?.title || activeTab?.url || '');

  return (
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
        
        <Input
          ref={inputRef}
          flex={1}
          fontSize="$4"
          value={displayValue}
          onChangeText={setUrlInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
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
  );
});

UrlInput.displayName = 'UrlInput';

export default UrlInput;