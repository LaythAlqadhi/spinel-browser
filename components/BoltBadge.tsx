import { Anchor, Image, Stack, YStack } from 'tamagui'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'tamagui'

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
              />
            </Anchor>
    </Stack>
  )
}
