import commonTheme from './common'
import { BaseTheme } from './types'

export const sepiaTheme: BaseTheme = {
  ...commonTheme,
  colors: {
    background: {
      primary: '#FDFBF9',
      secondary: '#F5F0E8',
      tertiary: '#EDE5D6',
      quaternary: '#E5DAC4',
    },
    icon: {
      default: '#BFA26B',
      hover: '#E6E6E6',
      active: '#896E3B',
    },
    text: {
      primary: '#534324',
      secondary: '#776033',
      subtle: '#BFA26B',
      disabled: '#E5DAC4',
      link: '#AC8B4B',
    },
    border: {
      main: '#F5F0E8',
      second: '#E5DAC4',
    },
    variants: {
      primary: {
        base: '#BFA26B',
        text: '#FFFFFF',
      },
      secondary: {
        base: '#E5DAC4',
        text: '#9B7C43',
      },
      tertiary: {
        base: '#F4B236',
        text: '#534324',
      },
      warning: {
        base: '#F7C566',
        text: '#534324',
      },
      success: {
        base: '#16DB93',
        text: '#534324',
      },
      danger: {
        base: '#F45B69',
        text: '#FFFFFF',
      },
      info: {
        base: '#BFA26B',
        text: '#534324',
      },
    },
    shadow: '0px 0px 13px rgba(0,0,0,0.2)',
  },
}
