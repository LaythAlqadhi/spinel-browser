import { Anchor, Image, Stack } from 'tamagui'

export default function BoltBadge() {
  return (
    <Stack position="absolute" top="$4" right="$4" zIndex={50}>
<Anchor
              href="https://bolt.new/?rid=iqfyzf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                source={{
                  uri: 'https://storage.bolt.army/logotext_poweredby_360w.png',
                }}
                width={160}
                height={32}
              />
            </Anchor>
    </Stack>
  )
}
