import colors from 'open-color'
import { Theme } from './interface'

const textColor = colors.gray[0]
const backgroundColor = colors.gray[9]
const activeColor = colors.blue[5]
const activeTextColor = colors.gray[0]
const borderColor = colors.gray[7]
const fontSize = 12

export const defaultTheme: Theme = {
  app: {
    textColor,
    backgroundColor,
    fontSize
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
  },
  button: {
    backgroundColor: colors.gray[7],
    textColor,
    fontSize,
    activeBackgroundColor: activeColor
  }
}
