import React, { memo } from 'react';
import { Lock, Shield, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { View } from 'tamagui';

interface SecurityIndicatorProps {
  url: string;
  size?: number;
}

interface SecurityStatus {
  type: 'secure' | 'insecure' | 'local' | 'unknown' | 'none';
  icon: React.ReactNode | null;
  color: string;
  label: string;
}

function getSecurityStatus(url: string, size: number = 16): SecurityStatus {
  if (!url || url === 'about:blank') {
    return { type: 'none', icon: null, color: 'transparent', label: '' };
  }

  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.startsWith('https://')) {
    return { 
      type: 'secure', 
      icon: <Lock size={size} color="#27CA3F" />, 
      color: '#27CA3F',
      label: 'Secure'
    };
  } else if (lowerUrl.startsWith('http://')) {
    return { 
      type: 'insecure', 
      icon: <AlertTriangle size={size} color="#FF9500" />, 
      color: '#FF9500',
      label: 'Not Secure'
    };
  } else if (lowerUrl.startsWith('file://') || lowerUrl.includes('localhost')) {
    return { 
      type: 'local', 
      icon: <Shield size={size} color="#007AFF" />, 
      color: '#007AFF',
      label: 'Local'
    };
  }

  return { 
    type: 'unknown', 
    icon: <AlertTriangle size={size} color="#8E8E93" />, 
    color: '#8E8E93',
    label: 'Unknown'
  };
}

const SecurityIndicator = memo<SecurityIndicatorProps>(({ url, size = 16 }) => {
  const status = getSecurityStatus(url, size);
  
  if (!status.icon) return null;
  
  return <View>{status.icon}</View>;
});

SecurityIndicator.displayName = 'SecurityIndicator';

export default SecurityIndicator;