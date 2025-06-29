import React, { memo } from 'react';
import { useTheme } from 'tamagui';
import { View } from 'tamagui';

interface LoadingProgressProps {
  progress: number;
  isVisible: boolean;
}

const LoadingProgress = memo<LoadingProgressProps>(({ progress, isVisible }) => {
  const { color } = useTheme();

  if (!isVisible) return null;

  return (
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
        width={`${Math.max(0, Math.min(100, progress * 100))}%`}
      />
    </View>
  );
});

LoadingProgress.displayName = 'LoadingProgress';

export default LoadingProgress;