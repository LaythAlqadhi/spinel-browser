import { useState, useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface EmulationSettings {
  width: number;
  height: number;
  zoom: number;
  isRotated: boolean;
  selectedDevice: string;
}

export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'phone' | 'tablet' | 'desktop';
}

const devicePresets: DevicePreset[] = [
  { id: 'iphone-14', name: 'iPhone 14', width: 390, height: 844, category: 'phone' },
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', width: 393, height: 852, category: 'phone' },
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, category: 'phone' },
  { id: 'pixel-7', name: 'Pixel 7', width: 412, height: 915, category: 'phone' },
  { id: 'galaxy-s23', name: 'Galaxy S23', width: 384, height: 854, category: 'phone' },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194, category: 'tablet' },
  { id: 'ipad-pro-12', name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet' },
  { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, category: 'tablet' },
  { id: 'surface-pro', name: 'Surface Pro 7', width: 912, height: 1368, category: 'tablet' },
  { id: 'desktop-1080', name: 'Desktop 1080p', width: 1920, height: 1080, category: 'desktop' },
  { id: 'desktop-1440', name: 'Desktop 1440p', width: 2560, height: 1440, category: 'desktop' },
  { id: 'macbook-pro', name: 'MacBook Pro 16"', width: 1728, height: 1117, category: 'desktop' },
];

export function useDeviceEmulation() {
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState<EmulationSettings>({
    width: Math.floor(screenWidth),
    height: Math.floor(screenHeight),
    zoom: 100,
    isRotated: false,
    selectedDevice: 'responsive',
  });

  const currentPreset = useMemo(() => {
    return devicePresets.find(preset => preset.id === settings.selectedDevice);
  }, [settings.selectedDevice]);

  const dimensions = useMemo(() => {
    if (settings.selectedDevice === 'responsive') {
      return {
        width: Math.max(200, Math.min(settings.width, 2800)),
        height: Math.max(300, Math.min(settings.height, 2800)),
      };
    }

    if (!currentPreset) {
      return { width: Math.floor(screenWidth), height: Math.floor(screenHeight) };
    }

    return settings.isRotated
      ? { width: currentPreset.height, height: currentPreset.width }
      : { width: currentPreset.width, height: currentPreset.height };
  }, [settings, currentPreset]);

  const updateSettings = useCallback((newSettings: Partial<EmulationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const selectDevice = useCallback((deviceId: string) => {
    const preset = devicePresets.find(p => p.id === deviceId);
    
    if (deviceId === 'responsive') {
      updateSettings({
        selectedDevice: deviceId,
        width: Math.floor(screenWidth),
        height: Math.floor(screenHeight),
      });
    } else if (preset) {
      const newDimensions = settings.isRotated
        ? { width: preset.height, height: preset.width }
        : { width: preset.width, height: preset.height };
      
      updateSettings({
        selectedDevice: deviceId,
        ...newDimensions,
      });
    }
  }, [settings.isRotated, updateSettings]);

  const toggleRotation = useCallback(() => {
    if (settings.selectedDevice === 'responsive') {
      updateSettings({
        isRotated: !settings.isRotated,
        width: settings.height,
        height: settings.width,
      });
    } else {
      updateSettings({ isRotated: !settings.isRotated });
    }
  }, [settings, updateSettings]);

  const setZoom = useCallback((zoom: number) => {
    updateSettings({ zoom: Math.max(25, Math.min(150, zoom)) });
  }, [updateSettings]);

  const activate = useCallback(() => setIsActive(true), []);
  const deactivate = useCallback(() => setIsActive(false), []);

  return {
    isActive,
    settings,
    dimensions,
    devicePresets,
    currentPreset,
    activate,
    deactivate,
    updateSettings,
    selectDevice,
    toggleRotation,
    setZoom,
  };
}