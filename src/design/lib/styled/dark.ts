import commonTheme from './common'
import { BaseTheme } from './types'

export const darkTheme: BaseTheme = {
  ...commonTheme,
  colors: {
    background: {
      primary: '#2c3033',
      secondary: '#3a3d42',
      tertiary: '#43454a',
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
      subtle: '#b1b1b1',
      disabled: '#666666',
      link: '#329BBE',
    },
    border: {
      main: '#444444',
      second: '#41454E',
    },
    variants: {
      primary: {
        base: '#004774',
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
        base: '#33B5E5',
        text: '#fff',
      },
    },
    shadow: '0px 0px 13px rgba(0,0,0,0.2)',
  },
}
