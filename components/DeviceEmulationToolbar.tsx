import React, { memo, useCallback } from 'react';
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
import { useDeviceEmulation, EmulationSettings } from '@/hooks/useDeviceEmulation';
import {
  XStack,
  Text,
  Button,
  ScrollView,
  Input,
  Select,
  Adapt,
} from 'tamagui';

const { width: screenWidth } = Dimensions.get('window');

interface DeviceEmulationToolbarProps {
  onEmulationSettingsChange: (settings: EmulationSettings) => void;
  onClose: () => void;
}

const zoomLevels = [25, 50, 75, 100, 125, 150];

const DeviceEmulationToolbar = memo<DeviceEmulationToolbarProps>(({ 
  onEmulationSettingsChange, 
  onClose 
}) => {
  const { color } = useTheme();
  const { 
    settings, 
    devicePresets, 
    selectDevice, 
    toggleRotation, 
    setZoom, 
    updateSettings 
  } = useDeviceEmulation();

  const isSmallScreen = screenWidth < 768;
  const isVerySmallScreen = screenWidth < 480;

  const handleDeviceSelect = useCallback((deviceId: string) => {
    selectDevice(deviceId);
    onEmulationSettingsChange(settings);
  }, [selectDevice, settings, onEmulationSettingsChange]);

  const handleZoomSelect = useCallback((zoomLevel: string) => {
    const zoom = parseInt(zoomLevel);
    setZoom(zoom);
    onEmulationSettingsChange({ ...settings, zoom });
  }, [setZoom, settings, onEmulationSettingsChange]);

  const handleRotate = useCallback(() => {
    toggleRotation();
    onEmulationSettingsChange(settings);
  }, [toggleRotation, settings, onEmulationSettingsChange]);

  const handleCustomWidthChange = useCallback((text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const numericValue = parseInt(numericText) || 0;

    if (numericValue <= 5000) {
      updateSettings({ width: numericValue });
      onEmulationSettingsChange({ ...settings, width: numericValue });
    }
  }, [updateSettings, settings, onEmulationSettingsChange]);

  const handleCustomHeightChange = useCallback((text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const numericValue = parseInt(numericText) || 0;

    if (numericValue <= 5000) {
      updateSettings({ height: numericValue });
      onEmulationSettingsChange({ ...settings, height: numericValue });
    }
  }, [updateSettings, settings, onEmulationSettingsChange]);

  const getSelectedDeviceName = useCallback(() => {
    if (settings.selectedDevice === 'responsive') return 'Responsive';
    const preset = devicePresets.find(p => p.id === settings.selectedDevice);
    return preset?.name || 'Unknown Device';
  }, [settings.selectedDevice, devicePresets]);

  const getCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case 'phone': return <Smartphone size={14} color="$gray10" />;
      case 'tablet': return <Tablet size={14} color="$gray10" />;
      case 'desktop': return <Monitor size={14} color="$gray10" />;
      default: return <Maximize2 size={14} color="$gray10" />;
    }
  }, []);

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
          <Select value={settings.selectedDevice} onValueChange={handleDeviceSelect}>
            <Select.Trigger
              width={140}
              paddingVertical="$1"
              iconAfter={<ChevronDown color={color.val} />}
            >
              <XStack alignItems="center" space="$2">
                {getCategoryIcon(settings.selectedDevice === 'responsive' ? 'responsive' :
                  devicePresets.find(p => p.id === settings.selectedDevice)?.category || 'phone')}
                <Select.Value>
                  <Text fontSize={isVerySmallScreen ? "$2" : "$3"} numberOfLines={1}>
                    {isVerySmallScreen ?
                      (settings.selectedDevice === 'responsive' ? 'Resp.' : getSelectedDeviceName().split(' ')[0]) :
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
                        {getCategoryIcon(preset.category)}
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
          {settings.selectedDevice === 'responsive' && (
            <XStack alignItems="center" space="$2">
              <Input
                width={80}
                value={settings.width.toString()}
                onChangeText={handleCustomWidthChange}
                keyboardType="numeric"
                placeholder="W"
                maxLength={4}
                textAlign="center"
              />
              <Text fontSize="$3" fontWeight="600" color="$gray10">×</Text>
              <Input
                width={80}
                value={settings.height.toString()}
                onChangeText={handleCustomHeightChange}
                keyboardType="numeric"
                placeholder="H"
                maxLength={4}
                textAlign="center"
              />
            </XStack>
          )}

          {/* Zoom Control */}
          <Select value={settings.zoom.toString()} onValueChange={handleZoomSelect}>
            <Select.Trigger
              width={140}
              paddingVertical="$1"
              iconAfter={<ChevronDown color={color.val} />}
            >
              <XStack alignItems="center" space="$2">
                <ZoomIn size={14} color={color.val} />
                <Select.Value>
                  <Text fontSize={isVerySmallScreen ? "$2" : "$3"}>
                    {settings.zoom}%
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
});

DeviceEmulationToolbar.displayName = 'DeviceEmulationToolbar';

export default DeviceEmulationToolbar;