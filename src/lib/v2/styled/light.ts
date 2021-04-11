import commonTheme from './common'
import { BaseTheme } from './types'

export const lightTheme: BaseTheme = {
  ...commonTheme,
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F2F2F2',
      tertiary: '#E6E6E6',
      quaternary: '#D9D9D9',
    },
    icon: {
      default: '#A6A6A6',
      hover: '#8C8C8C',
      active: '#666666',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      subtle: '#A6A6A6',
      disabled: '#D4D4D4',
      link: '#329BBE',
    },
    border: {
      main: '#2A2C32',
      second: '#41454E',
    },
    variants: {
      primary: {
        base: '#4285F4',
        text: '#fff',
      },
      secondary: {
        base: '#D9D9D9',
        text: '#fff',
      },
      tertiary: {
        base: '#2BBBAD',
        text: '#fff',
      },
      warning: {
        base: '#FFBB33',
        text: '#fff',
      },
      success: {
        base: '#00C851',
        text: '#fff',
      },
      danger: {
        base: '#FF4444',
        text: '#fff',
      },
      info: {
        base: '#33B5E5',
        text: '#fff',
      },
    },
    shadow: '0px 0px 13px rgba(0,0,0,0.1)',
  },
}
