import CodeMirror from 'codemirror'

declare module 'codemirror/mode/*'

declare module 'codemirror' {
  function autoLoadMode(instance: CodeMirror.Editor, mode: string): void

  interface ModeInfo {
    name: string
    mime?: string
    mimes?: string[]
    mode: string
    ext: string[]
    alias?: string[]
  }
  const modeInfo: ModeInfo[]

  interface Editor {
    options: CodeMirror.EditorConfiguration
  }

  function findModeByMIME(mime: string): ModeInfo | undefined
  function findModeByName(name: string): ModeInfo | undefined

  function runMode(
    text: string,
    modespec: any,
    callback: HTMLElement | ((text: string, style: string | null) => void),
    options?: { tabSize?: number; state?: any }
  ): void
}
