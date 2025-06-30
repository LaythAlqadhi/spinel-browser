import React, { memo } from 'react';
import { Lock, Shield, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface SecurityIndicatorProps {
  url: string;
  size?: number;
}

const SecurityIndicator = memo(({ url, size = 16 }: SecurityIndicatorProps) => {
  if (!url || url === 'about:blank') {
    return null;
  }

  const urlLower = url.toLowerCase();
  
  if (urlLower.startsWith('https://')) {
    return <Lock size={size} color="#27CA3F" />;
  } else if (urlLower.startsWith('http://')) {
    return <AlertTriangle size={size} color="#FF9500" />;
  } else if (urlLower.startsWith('file://') || urlLower.includes('localhost')) {
    return <Shield size={size} color="#007AFF" />;
  }

  return <AlertTriangle size={size} color="#666666" />;
});

SecurityIndicator.displayName = 'SecurityIndicator';

export default SecurityIndicator;