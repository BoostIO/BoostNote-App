import styled from './styled'
import { darkTheme, lightTheme } from './themes'

export default styled
export * from './themes'
export * from './keyframes'

export function selectTheme(theme: string) {
  switch (theme) {
    case 'dark':
      return darkTheme
    case 'light':
    default:
      return lightTheme
  }
}
