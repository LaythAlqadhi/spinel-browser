import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'tamagui';
import { Dimensions } from 'react-native';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  ZoomIn,
  X,
  ChevronDown,
  Maximize2,
} from 'lucide-react-native';
import { useBrowserSettings } from '@/hooks/useBrowserSettings';
import {
  XStack,
  Text,
  Button,
  ScrollView,
  Input,
  Select,
  Adapt,
} from 'tamagui';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'phone' | 'tablet' | 'desktop';
  icon: React.ReactNode;
}

interface EmulationSettings {
  width: number;
  height: number;
  zoom: number;
  isRotated: boolean;
  selectedDevice: string;
}

interface DeviceEmulationToolbarProps {
  onEmulationSettingsChange: (settings: EmulationSettings) => void;
  onClose: () => void;
}

const devicePresets: DevicePreset[] = [
  { id: 'iphone-14', name: 'iPhone 14', width: 390, height: 844, category: 'phone', icon: <Smartphone size={14} /> },
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', width: 393, height: 852, category: 'phone', icon: <Smartphone size={14} /> },
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, category: 'phone', icon: <Smartphone size={14} /> },
  { id: 'pixel-7', name: 'Pixel 7', width: 412, height: 915, category: 'phone', icon: <Smartphone size={14} /> },
  { id: 'galaxy-s23', name: 'Galaxy S23', width: 384, height: 854, category: 'phone', icon: <Smartphone size={14} /> },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194, category: 'tablet', icon: <Tablet size={14} /> },
  { id: 'ipad-pro-12', name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet', icon: <Tablet size={14} /> },
  { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, category: 'tablet', icon: <Tablet size={14} /> },
  { id: 'surface-pro', name: 'Surface Pro 7', width: 912, height: 1368, category: 'tablet', icon: <Tablet size={14} /> },
  { id: 'desktop-1080', name: 'Desktop 1080p', width: 1920, height: 1080, category: 'desktop', icon: <Monitor size={14} /> },
  { id: 'desktop-1440', name: 'Desktop 1440p', width: 2560, height: 1440, category: 'desktop', icon: <Monitor size={14} /> },
  { id: 'macbook-pro', name: 'MacBook Pro 16"', width: 1728, height: 1117, category: 'desktop', icon: <Monitor size={14} /> },
];

const zoomLevels = [25, 50, 75, 100, 125, 150];

export default function DeviceEmulationToolbar({ onEmulationSettingsChange, onClose }: DeviceEmulationToolbarProps) {
  const { color } = useTheme();
  const { theme } = useBrowserSettings();
  const [selectedDevice, setSelectedDevice] = useState<string>('responsive');
  const [customWidth, setCustomWidth] = useState(Math.floor(screenWidth).toString());
  const [customHeight, setCustomHeight] = useState(Math.floor(screenHeight).toString());
  const [zoom, setZoom] = useState(100);
  const [isRotated, setIsRotated] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isSmallScreen = screenWidth < 768;
  const isVerySmallScreen = screenWidth < 480;

  const getCurrentDimensions = () => {
    if (selectedDevice === 'responsive') {
      const width = parseInt(customWidth) || Math.floor(screenWidth);
      const height = parseInt(customHeight) || Math.floor(screenHeight);

      return {
        width: Math.max(200, Math.min(width, 2800)),
        height: Math.max(300, Math.min(height, 2800)),
      };
    }

    const preset = devicePresets.find(p => p.id === selectedDevice);
    if (!preset) return { width: Math.floor(screenWidth), height: Math.floor(screenHeight) };

    return isRotated
      ? { width: preset.height, height: preset.width }
      : { width: preset.width, height: preset.height };
  };

  const emitSettingsChange = () => {
    const dimensions = getCurrentDimensions();
    onEmulationSettingsChange({
      width: dimensions.width,
      height: dimensions.height,
      zoom,
      isRotated,
      selectedDevice,
    });
  };

  const debouncedEmitSettingsChange = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      emitSettingsChange();
    }, 300);
  };

  useEffect(() => {
    emitSettingsChange();
  }, [selectedDevice, zoom, isRotated]);

  useEffect(() => {
    if (selectedDevice === 'responsive') {
      debouncedEmitSettingsChange();
    }
  }, [customWidth, customHeight]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId);

    if (deviceId !== 'responsive') {
      const preset = devicePresets.find(p => p.id === deviceId);
      if (preset) {
        const dimensions = isRotated
          ? { width: preset.height, height: preset.width }
          : { width: preset.width, height: preset.height };

        setCustomWidth(dimensions.width.toString());
        setCustomHeight(dimensions.height.toString());
      }
    } else {
      setCustomWidth(Math.floor(screenWidth).toString());
      setCustomHeight(Math.floor(screenHeight).toString());
    }
  };

  const handleZoomSelect = (zoomLevel: string) => {
    setZoom(parseInt(zoomLevel));
  };

  const handleRotate = () => {
    const newRotated = !isRotated;
    setIsRotated(newRotated);

    if (selectedDevice === 'responsive') {
      const newWidth = customHeight;
      const newHeight = customWidth;
      setCustomWidth(newWidth);
      setCustomHeight(newHeight);
    }
  };

  const handleCustomWidthChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const numericValue = parseInt(numericText) || 0;

    if (numericValue <= 5000) {
      setCustomWidth(numericText);
    }
  };

  const handleCustomHeightChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const numericValue = parseInt(numericText) || 0;

    if (numericValue <= 5000) {
      setCustomHeight(numericText);
    }
  };

  const getSelectedDeviceName = () => {
    if (selectedDevice === 'responsive') return 'Responsive';
    const preset = devicePresets.find(p => p.id === selectedDevice);
    return preset?.name || 'Unknown Device';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'phone': return <Smartphone size={14} color="$gray10" />;
      case 'tablet': return <Tablet size={14} color="$gray10" />;
      case 'desktop': return <Monitor size={14} color="$gray10" />;
      default: return <Maximize2 size={14} color="$gray10" />;
    }
  };

  const dimensions = getCurrentDimensions();

  return (
    <XStack
      backgroundColor="$background"
      borderBottomColor="$borderColor"
      borderBottomWidth={1}
      paddingHorizontal="$3"
      paddingVertical="$2"
      minHeight={50}
      zIndex={1}
      alignItems="center"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 12 }}
        flex={1}
      >
        <XStack alignItems="center" space="$3">
          {/* Device Selector */}
          <Select value={selectedDevice} onValueChange={handleDeviceSelect}>
            <Select.Trigger
              width={140}
              paddingVertical="$1"
              iconAfter={<ChevronDown color={color.val} />}
            >
              <XStack alignItems="center" space="$2">
                {getCategoryIcon(selectedDevice === 'responsive' ? 'responsive' :
                  devicePresets.find(p => p.id === selectedDevice)?.category || 'phone')}
                <Select.Value>
                  <Text fontSize={isVerySmallScreen ? "$2" : "$3"} numberOfLines={1}>
                    {isVerySmallScreen ?
                      (selectedDevice === 'responsive' ? 'Resp.' : getSelectedDeviceName().split(' ')[0]) :
                      getSelectedDeviceName()
                    }
                  </Text>
                </Select.Value>
              </XStack>
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
                  <Select.Label>Devices</Select.Label>
                  <Select.Item value="responsive">
                    <XStack alignItems="center" space="$2">
                      <Maximize2 size={16} />
                      <Select.ItemText>Responsive</Select.ItemText>
                    </XStack>
                  </Select.Item>

                  {devicePresets.slice(0, 8).map((preset) => (
                    <Select.Item key={preset.id} value={preset.id}>
                      <XStack alignItems="center" space="$2">
                        {preset.icon}
                        <Select.ItemText>{preset.name}</Select.ItemText>
                        <Text fontSize="$2" color="$gray10" marginLeft="auto">
                          {preset.width}×{preset.height}
                        </Text>
                      </XStack>
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Viewport>
            </Select.Content>
          </Select>

          {/* Custom Dimensions */}
          {selectedDevice === 'responsive' && (
            <XStack alignItems="center" space="$2">
              <Input
                width={80}
                value={customWidth}
                onChangeText={handleCustomWidthChange}
                keyboardType="numeric"
                placeholder="W"
                maxLength={4}
                textAlign="center"
              />
              <Text fontSize="$3" fontWeight="600" color="$gray10">×</Text>
              <Input
                width={80}
                value={customHeight}
                onChangeText={handleCustomHeightChange}
                keyboardType="numeric"
                placeholder="H"
                maxLength={4}
                textAlign="center"
              />
            </XStack>
          )}

          {/* Zoom Control */}
          <Select value={zoom.toString()} onValueChange={handleZoomSelect}>
            <Select.Trigger
              width={140}
              paddingVertical="$1"
              iconAfter={<ChevronDown color={color.val} />}
            >
              <XStack alignItems="center" space="$2">
                <ZoomIn size={14} color={color.val} />
                <Select.Value>
                  <Text fontSize={isVerySmallScreen ? "$2" : "$3"}>
                    {zoom}%
                  </Text>
                </Select.Value>
              </XStack>
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
                  <Select.Label>Zoom Level</Select.Label>
                  {zoomLevels.map((level) => (
                    <Select.Item key={level} value={level.toString()}>
                      <XStack alignItems="center" space="$2">
                        <ZoomIn size={16} />
                        <Select.ItemText>{level}%</Select.ItemText>
                      </XStack>
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Viewport>
            </Select.Content>
          </Select>

          {/* Rotation Control */}
          <Button
            borderColor="$gray4"
            backgroundColor="$gray1"
            onPress={handleRotate}
          >
            <RotateCcw size={16} color={color.val} />
          </Button>
        </XStack>
      </ScrollView>

      {/* Close Button */}
      <Button
        size="$3"
        circular
        onPress={onClose}
        icon={<X size={16} />}
      />
    </XStack>
  );
}