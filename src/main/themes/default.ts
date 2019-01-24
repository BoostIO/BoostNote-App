import colors from 'open-color'
import { Theme } from './interface'

const textColor = colors.gray[2]
const backgroundColor = colors.gray[9]
const activeColor = colors.blue[5]
const activeTextColor = colors.gray[1]
const borderColor = colors.gray[7]

export const defaultTheme: Theme = {
  app: {
    textColor,
    backgroundColor
  },
  sideNav: {
    linkActiveBackgroundColor: activeColor,
    borderColor
  },
  contextMenu: {
    backgroundColor,
    borderColor,
    menuTextColor: textColor,
    menuActiveBackgroundColor: activeColor,
    menuActiveTextColor: activeTextColor
  }
}
