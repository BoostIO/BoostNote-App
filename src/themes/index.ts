import { lightTheme } from './light'
import { darkTheme } from './dark'
import { sepiaTheme } from './sepia'
import { solarizedDarkTheme } from './solarizedDark'
import { legacyTheme } from './legacy'

export { lightTheme, darkTheme, sepiaTheme, solarizedDarkTheme, legacyTheme }

export type ThemeTypes = 'light' | 'dark' | 'sepia' | 'solarizedDark' | 'legacy'

export function selectTheme(theme: string) {
  switch (theme) {
    case 'legacy':
      return legacyTheme
    case 'light':
      return lightTheme
    case 'sepia':
      return sepiaTheme
    case 'solarizedDark':
      return solarizedDarkTheme
    case 'dark':
    default:
      return darkTheme
  }
}
