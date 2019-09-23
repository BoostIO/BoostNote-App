import CodeMirror from 'codemirror'
import 'codemirror/addon/runmode/runmode'
import 'codemirror/addon/mode/overlay'
import 'codemirror/mode/markdown/markdown'
import debounce from 'lodash/debounce'

window.CodeMirror = CodeMirror

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

const dispatchModeLoad = debounce(() => {
  window.dispatchEvent(new CustomEvent('codemirror-mode-load'))
}, 300)

export async function requireMode(mode: string) {
  await import(`codemirror/mode/${mode}/${mode}.js`)
  dispatchModeLoad()
}

function loadMode(_CodeMirror: any) {
  const memoizedModeResult = new Map<string, CodeMirror.ModeInfo | null>()
  function findModeByMIME(mime: string) {
    let result = memoizedModeResult.get(mime)
    if (result === undefined) {
      result = CodeMirror.findModeByMIME(mime) || null
      memoizedModeResult.set(mime, result)
    }
    return result
  }

  const originalGetMode = CodeMirror.getMode
  _CodeMirror.getMode = (config: CodeMirror.EditorConfiguration, mime: any) => {
    const modeObj = originalGetMode(config, mime)
    if (modeObj.name === 'null' && typeof mime === 'string') {
      const mode = findModeByMIME(mime)
      if (mode != null) {
        requireMode(mode.mode)
      }
    }
    return modeObj
  }
}

loadMode(CodeMirror)

export default CodeMirror
