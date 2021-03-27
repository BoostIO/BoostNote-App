import commonTheme from './common'
import { BaseTheme } from './types'

export const lightTheme: BaseTheme = {
  ...commonTheme,
  colors: {
    background: {
      main: '#',
      second: '#',
    },
    text: {
      main: '#',
      second: '#',
      subtle: '#',
      link: '#',
    },
    border: {
      main: '#',
      second: '#',
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
        base: '#',
        darker: '#',
        text: '#',
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
