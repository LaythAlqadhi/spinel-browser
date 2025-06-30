import { useBrowserSettings } from '@/hooks/useBrowserSettings'
import { Anchor, Image, Stack, useMedia } from 'tamagui'

export default function BoltBadge() {
  const { theme } = useBrowserSettings()
  const media = useMedia()

  const imageUri =
    theme === 'dark'
      ? 'https://storage.bolt.army/white_circle_360x360.png'
      : 'https://storage.bolt.army/black_circle_360x360.png'

  // Responsive logic in JS
  const size = media.md ? 160 : 100

  return (
    <Stack position="absolute" top="$4" right="$4" zIndex={50}>
      <Anchor
        href="https://bolt.new/?rid=iqfyzf"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          source={{ uri: imageUri }}
          width={size}
          height={size}
          resizeMode="contain"
        />
      </Anchor>
    </Stack>
  )
}
