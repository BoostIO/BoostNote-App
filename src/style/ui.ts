import { CSSProperties } from 'glamorous'
import { Colors } from './colors'

export interface UI {
  border: string
  button: CSSProperties
  primaryButton: CSSProperties
  titleBarButton: CSSProperties
}

export const defaultUI: UI = {
  border: `1px solid ${Colors.border}`,
  button: {

  },
  primaryButton: {

  },
  titleBarButton: {

  },
}
