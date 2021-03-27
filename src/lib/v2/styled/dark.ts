import commonTheme from './common'
import { BaseTheme } from './types'

export const darkTheme: BaseTheme = {
  ...commonTheme,
  colors: {
    background: {
      main: '#1E2024',
      second: '#27282B',
    },
    text: {
      main: '#fff',
      second: '#D0D0D1',
      subtle: '#9E9E9E',
      link: '#329BBE',
    },
    border: {
      main: '#303336',
      second: '#3D3F45',
    },
    variants: {
      danger: {
        base: '#EC5757',
        darker: '',
        text: '#fff',
      },
      primary: {
        base: '#004774',
        darker: '',
        text: '#fff',
      },
      secondary: {
        base: '#3D3F44',
        darker: '',
        text: '#fff',
      },
      warning: {
        base: '',
        darker: '',
        text: '#fff',
      },
    },
    focus: 'rgba(71, 170, 255, 0.6)',
  },
}
