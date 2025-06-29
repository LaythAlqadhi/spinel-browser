import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'
import { createInterFont } from '@tamagui/font-inter'

const interFont = createInterFont()

const tamaguiConfig = createTamagui({
  ...config,
  fonts: {
    ...config.fonts,
    body: interFont,
    heading: interFont,
  },
})

export { tamaguiConfig }

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}