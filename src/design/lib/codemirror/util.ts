import CodeMirror from 'codemirror'
import debounce from 'lodash/debounce'

const dispatchModeLoad = debounce(() => {
  window.dispatchEvent(new CustomEvent('codemirror-mode-load'))
}, 300)

export async function requireMode(mode: string) {
  await import(`codemirror/mode/${mode}/${mode}.js`)
  dispatchModeLoad()
}

export function loadMode(_CodeMirror: any) {
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
      if (
        mode != null &&
        mode.mode != null &&
        mode.mode !== 'null' &&
        // the user set mime string to 'null', leads codemirror to constantly rerender the mode PEG.js ('pegjs')
        mode.mime !== 'null'
      ) {
        requireMode(mode.mode).catch((error) => {
          console.warn(error)
        })
      }
    }
    return modeObj
  }
}
