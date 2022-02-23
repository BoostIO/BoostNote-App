import commonTheme from './common'
import { BaseTheme } from './types'

export const draculaTheme: BaseTheme = {
  ...commonTheme,
  colors: {
    background: {
      primary: '#232531',
      secondary: '#2F313F',
      tertiary: '#40424E',
      quaternary: '#44475a',
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
      link: '#bd93f9',
    },
    border: {
      main: '#2c3033',
      second: '#44475a',
    },
    variants: {
      primary: {
        base: '#B785FF',
        text: '#fff',
      },
      secondary: {
        base: '#2F313F',
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
        base: '#bd93f9',
        text: '#fff',
      },
    },
    shadow: '0px 0px 13px rgba(0,0,0,0.2)',
  },
}
