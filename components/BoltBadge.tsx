import { useBrowserSettings } from '@/hooks/useBrowserSettings'
import { Anchor, Image, Stack } from 'tamagui'

export default function BoltBadge() {
  const { theme } = useBrowserSettings()

  const imageUri =
    theme === 'dark'
      ? 'https://storage.bolt.army/white_circle_360x360.png'
      : 'https://storage.bolt.army/black_circle_360x360.png'

  return (
    <Stack position="absolute" top="$4" right="$4" zIndex={50}>
      <Anchor
        href="https://bolt.new/?rid=iqfyzf"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          source={{ uri: imageUri }}
          width={{ xs: 100, md: 200 }}
          height={{ xs: 100, md: 200 }}
          resizeMode="contain"
        />
      </Anchor>
    </Stack>
  )
}
