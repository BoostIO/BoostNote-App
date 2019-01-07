import colors from 'open-color'
import { Theme } from './interface'

const textColor = colors.gray[2]
const backgroundColor = colors.gray[9]
const activeColor = colors.blue[5]

export const defaultTheme: Theme = {
  global: {
    textColor,
    backgroundColor
  },
  sideNav: {
    linkActiveBackgroundColor: activeColor
  }
}
