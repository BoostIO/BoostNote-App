import CodeMirror from 'codemirror'
import 'codemirror/addon/runmode/runmode'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/keymap/vim'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/keymap/sublime'
import 'codemirror/keymap/emacs'
import { loadMode } from '../../../shared/lib/codemirror/util'

loadMode(CodeMirror)

export default CodeMirror

export interface EditorPosition {
  line: number
  ch: number
}
