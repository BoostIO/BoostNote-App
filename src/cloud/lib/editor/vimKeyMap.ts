import CodeMirror from 'codemirror'

export function copySelectionOnVimCtrlC(cm: CodeMirror.Editor) {
  if (`${cm.getOption('keyMap')}`.startsWith('vim')) {
    document.execCommand('copy')
  }

  return CodeMirror.Pass
}
