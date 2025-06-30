import { Anchor, Image, Stack, YStack } from 'tamagui'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'tamagui'

export default function BoltBadge() {
  return (
    <Stack position="absolute" top="$4" right="$4" zIndex={50}>
      <YStack
            animation="medium"
            enterStyle={{ opacity: 0, rotateY: '-90deg' }}
            exitStyle={{ opacity: 0, rotateY: '-90deg' }}
            opacity={1}
            rotateY="0deg"
          >
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
                hoverStyle={{
                  opacity: 1,
                  transform: [{ scale: 1.1 }, { rotate: '22deg' }],
                }}
              />
            </Anchor>
          </YStack>
    </Stack>
  )
}
