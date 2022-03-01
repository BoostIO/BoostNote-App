import commonTheme from './common'
import { BaseTheme } from './types'

export const monokaiTheme: BaseTheme = {
  ...commonTheme,
  colors: {
    background: {
      primary: '#1E2024',
      secondary: '#27282B',
      tertiary: '#353940',
      quaternary: '#41454E',
    },
    icon: {
      default: '#A6A6A6',
      hover: '#E6E6E6',
      active: '#FFFFFF',
    },
    text: {
      primary: '#fff',
      secondary: '#E6E6E6',
      subtle: '#9C9C9C',
      disabled: '#666666',
      link: '#329BBE',
    },
    border: {
      main: '#303336',
      second: '#41454E',
    },
    variants: {
      primary: {
        base: '#f92672',
        text: '#fff',
      },
      secondary: {
        base: '#353940',
        text: '#fff',
      },
      tertiary: {
        base: '#2BBBAD',
        text: '#fff',
      },
      warning: {
        base: '#FFBB33',
        text: '#000',
      },
      success: {
        base: '#00C851',
        text: '#fff',
      },
      danger: {
        base: '#8B2635',
        text: '#fff',
      },
      info: {
        base: '#f92672',
        text: '#fff',
      },
    },
    shadow: '0px 0px 13px rgba(0,0,0,0.2)',
  },
}
