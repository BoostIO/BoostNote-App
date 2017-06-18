import { Colors } from './colors'
import * as typography from './typography'
import * as UI from './ui'

export namespace Themes {
  export interface Theme {
    Colors: any
    Typography: any
    ui: UI.UI
  }

  export const defaultTheme = {
    colors: Colors,
    typography,
    ui: UI.defaultUI,
  }
}
