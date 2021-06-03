import commonTheme from './common'
import { BaseTheme } from './types'

export const solarizedDarkTheme: BaseTheme = {
  ...commonTheme,
  colors: {
    background: {
      primary: '#1D3F48',
      secondary: '#214953',
      tertiary: '#26525E',
      quaternary: '#2A5C69',
    },
    icon: {
      default: '#A6A6A6',
      hover: '#E6E6E6',
      active: '#FFFFFF',
    },
    text: {
      primary: '#ECF5F7',
      secondary: '#B1B7B9',
      subtle: '#8D9294',
      disabled: '#5F6466',
      link: '#499EB5',
    },
    border: {
      main: '#214953',
      second: '#2A5C69',
    },
    variants: {
      primary: {
        base: '#34A198',
        text: '#ECF5F7',
      },
      secondary: {
        base: '#214953',
        text: '#B1B7B9',
      },
      tertiary: {
        base: '#E2EB98',
        text: '#ECF5F7',
      },
      warning: {
        base: '#FEA82F',
        text: '#ECF5F7',
      },
      success: {
        base: '#A5BE00',
        text: '#ECF5F7',
      },
      danger: {
        base: '#FE5F55',
        text: '#ECF5F7',
      },
      info: {
        base: '#007FFF',
        text: '#ECF5F7',
      },
    },
    shadow: '0px 0px 13px rgba(0,0,0,0.2)',
  },
}
