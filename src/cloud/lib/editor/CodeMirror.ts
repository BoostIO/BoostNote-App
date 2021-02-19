import CodeMirror from 'codemirror'
import debounce from 'lodash.debounce'
import 'codemirror/addon/runmode/runmode'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/keymap/vim'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/keymap/sublime'
import 'codemirror/keymap/emacs'

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

export interface EditorPosition {
  line: number
  ch: number
}
