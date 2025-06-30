import { Anchor, Image, Stack, YStack } from 'tamagui'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'tamagui'

export default function BoltBadge() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Stack position="absolute" top="$4" right="$4" zIndex={50}>
      <AnimatePresence>
        {show && (
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
                style={{
                  opacity: 0.9,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
                hoverStyle={{
                  opacity: 1,
                  transform: [{ scale: 1.1 }, { rotate: '22deg' }],
                }}
              />
            </Anchor>
          </YStack>
        )}
      </AnimatePresence>
    </Stack>
  )
}
