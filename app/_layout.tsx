import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import { ToastProvider, ToastViewport, Toast, useToastState } from '@tamagui/toast';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { BrowserProvider, useSettings } from '@/contexts/BrowserContext';
import { tamaguiConfig } from '../tamagui.config';
import { YStack } from 'tamagui';

// Prevent splash screen from auto-hiding with proper error handling
(async () => {
  try {
    await SplashScreen.preventAutoHideAsync();
  } catch (error) {
    console.warn('Failed to prevent splash screen auto-hide:', error);
  }
})();

const CurrentToast = () => {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) return null;

  return (
    <Toast
      animation="200ms"
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, transform: [{ translateY: -100 }] }}
      exitStyle={{ opacity: 0, transform: [{ translateY: -100 }] }}
      transform={[{ translateY: 0 }]}
      opacity={1}
      scale={1}
      viewportName={currentToast.viewportName}
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$4"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.15}
      shadowRadius={12}
      elevation={8}
    >
      <YStack padding="$3">
        <Toast.Title fontSize="$4" fontWeight="600" color="$color">
          {currentToast.title}
        </Toast.Title>
        {!!currentToast.message && (
          <Toast.Description fontSize="$3" color="$gray10" marginTop="$1">
            {currentToast.message}
          </Toast.Description>
        )}
      </YStack>
    </Toast>
  );
};

// Inner component that has access to the theme context
function AppContent() {
  const { theme } = useSettings();
  
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <ToastViewport top="$10" left="$4" right="$4" />
        <CurrentToast />
      </ToastProvider>
    </TamaguiProvider>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  
  const colorScheme = useColorScheme();

  // Load Inter fonts
  const [fontsLoaded, fontError] = useFonts({
    'Inter': require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    'InterBold': require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    'InterLight': require('@tamagui/font-inter/otf/Inter-Light.otf'),
    'InterSemiBold': require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    const hideSplashScreen = async () => {
      if (fontsLoaded || fontError) {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn('Failed to hide splash screen:', error);
        }
      }
    };

    hideSplashScreen();
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <BrowserProvider>
        <AppContent />
      </BrowserProvider>
    </SafeAreaProvider>
  );
}