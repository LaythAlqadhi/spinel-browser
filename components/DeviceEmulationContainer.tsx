import React from 'react';
import { Dimensions } from 'react-native';
import { useSettingsStore } from '@/store/browserStore';
import { View, Text, ScrollView } from 'tamagui';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DeviceEmulationContainerProps {
  children: React.ReactNode;
  emulatedWidth: number;
  emulatedHeight: number;
  emulatedZoom: number;
  emulatedIsRotated: boolean;
  isActive: boolean;
}

export default function DeviceEmulationContainer({
  children,
  emulatedWidth,
  emulatedHeight,
  emulatedZoom,
  emulatedIsRotated,
  isActive,
}: DeviceEmulationContainerProps) {
  const { theme } = useSettingsStore();

  if (!isActive) return <>{children}</>;

  const horizontalPadding = 20;
  const verticalPadding = 20;
  const toolbarHeight = 160;
  const navigationHeight = 180;

  const availableWidth = screenWidth - horizontalPadding * 2;
  const availableHeight = screenHeight - verticalPadding - toolbarHeight - navigationHeight;

  let containerScale = 1;

  const widthScale = availableWidth / emulatedWidth;
  const heightScale = availableHeight / emulatedHeight;

  containerScale = Math.min(widthScale, heightScale, 1);
  containerScale = Math.max(containerScale, 0.2);

  const containerWidth = emulatedWidth * containerScale;
  const containerHeight = emulatedHeight * containerScale;

  const childrenWithZoom = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (
        child.props &&
        child.props.style &&
        Array.isArray(child.props.style) &&
        child.props.style.some((style: any) => style && style.position === 'relative')
      ) {
        const nestedChildren = React.Children.map(
          child.props.children,
          (nestedChild) => {
            if (
              React.isValidElement(nestedChild) &&
              nestedChild.type &&
              (nestedChild.type as any).name === 'BrowserWebView'
            ) {
              return React.cloneElement(nestedChild, {
                emulationZoom: emulatedZoom,
              } as any);
            }
            return nestedChild;
          },
        );

        return React.cloneElement(child, {}, nestedChildren);
      }

      if (child.type && (child.type as any).name === 'BrowserWebView') {
        return React.cloneElement(child, { emulationZoom: emulatedZoom } as any);
      }
    }
    return child;
  });

  const deviceFrame = (
    <View width={containerWidth} height={containerHeight}>
      <View
        width={emulatedWidth}
        height={emulatedHeight}
        transform={[{ scale: containerScale }]}
        transformOrigin="top left"
        borderRadius="$4"
        overflow="hidden"
      >
        {childrenWithZoom}
      </View>
    </View>
  );

  return (
    <View
      flex={1}
      backgroundColor="$gray1"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      padding="$3"
    >
      <View
        backgroundColor="$gray2"
        paddingHorizontal="$2"
        paddingVertical="$2"
        borderRadius="$2"
        marginBottom="$3"
      >
        <Text fontSize="$2" fontWeight="500" color="$gray10">
          {emulatedWidth} × {emulatedHeight}
        </Text>
      </View>
      {deviceFrame}
    </View>
  );
}