import React, { memo, useState } from 'react';
import { Globe } from 'lucide-react-native';
import { useTheme } from 'tamagui';
import { Image, View } from 'tamagui';

interface FaviconImageProps {
  favicon?: string;
  size?: number;
  fallbackColor?: string;
}

const FaviconImage = memo<FaviconImageProps>(({ 
  favicon, 
  size = 16, 
  fallbackColor 
}) => {
  const { color } = useTheme();
  const [hasError, setHasError] = useState(false);

  if (!favicon || hasError) {
    return <Globe size={size} color={fallbackColor || color.val} />;
  }

  return (
    <Image
      source={{ uri: favicon }}
      width={size}
      height={size}
      borderRadius="$2"
      onError={() => setHasError(true)}
    />
  );
});

FaviconImage.displayName = 'FaviconImage';

export default FaviconImage;