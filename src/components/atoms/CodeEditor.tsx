import React from 'react'
import CodeMirror, { getCodeMirrorTheme } from '../../lib/CodeMirror'
import {
  EditorIndentTypeOptions,
  EditorIndentSizeOptions,
  EditorKeyMapOptions,
} from '../../lib/preferences'
import { osName } from '../../lib/platform'
import styled from '../../shared/lib/styled'
import { borderRight } from '../../shared/lib/styled/styleFunctions'

const StyledContainer = styled.div`
  .CodeMirror {
    font-family: inherit;
    z-index: 0 !important;
  }

  .CodeMirror-dialog button {
    background-color: transparent;
    cursor: pointer;
    height: 26px;
    line-height: 26px;
    padding: 0 15px;
    transition: color 200ms ease-in-out;
    color: ${({ theme }) => theme.colors.text.primary};
    border: none;
    ${borderRight}
    &:last-child {
      border-right: none;
    }
  }

  .CodeMirror-dialog button:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
    background-color: ${({ theme }) => theme.colors.background.primary};
  }

  .marked {
    background-color: ${({ theme }) =>
      theme.codeEditorMarkedTextBackgroundColor};
    color: #212121 !important;
    padding: 3px;
  }

  .marked + .marked {
    margin-left: -3px;
    padding-left: 0;
  }

  .selected {
    background-color: ${({ theme }) =>
      theme.codeEditorSelectedTextBackgroundColor};
    border: 1px solid #fffae3;
  }
`

const defaultCodeMirrorOptions: CodeMirror.EditorConfiguration = {
  lineWrapping: true,
  lineNumbers: true,
}

interface CodeEditorProps {
  value: string
  onChange?: (
    newValue: string,
    change: CodeMirror.EditorChangeLinkedList
  ) => void
  codeMirrorRef?: (codeMirror: CodeMirror.EditorFromTextArea) => void
  className?: string
  theme?: string
  fontSize?: number
  fontFamily?: string
  indentType?: EditorIndentTypeOptions
  indentSize?: EditorIndentSizeOptions
  keyMap?: EditorKeyMapOptions
  getCustomKeymap: (key: string) => string | null
  mode?: string
  readonly?: boolean
  onPaste?: (codeMirror: CodeMirror.Editor, event: ClipboardEvent) => void
  onDrop?: (codeMirror: CodeMirror.Editor, event: DragEvent) => void
  onCursorActivity?: (codeMirror: CodeMirror.Editor) => void
  onLocalSearchToggle?: (
    codeMirror: CodeMirror.Editor,
    showLocalSearch: boolean
  ) => void
  onLocalSearchReplaceToggle?: (
    codeMirror: CodeMirror.Editor,
    showLocalReplace: boolean
  ) => void
}

class CodeEditor extends React.Component<CodeEditorProps> {
  textAreaRef = React.createRef<HTMLTextAreaElement>()
  codeMirror?: CodeMirror.EditorFromTextArea
  prevLocalSearchShortcut?: string
  prevLocalReplaceShortcut?: string

  componentDidMount() {
    const indentSize = this.props.indentSize == null ? 2 : this.props.indentSize
    const keyMap =
      this.props.keyMap == null || this.props.keyMap === 'default'
        ? 'sublime'
        : this.props.keyMap

    const extraKeys = this.getExtraKeys(keyMap)
    this.codeMirror = CodeMirror.fromTextArea(this.textAreaRef.current!, {
      ...defaultCodeMirrorOptions,
      theme: getCodeMirrorTheme(this.props.theme),
      indentWithTabs: this.props.indentType === 'tab',
      indentUnit: indentSize,
      tabSize: indentSize,
      keyMap,
      mode: this.props.mode || 'gfm',
      readOnly: this.props.readonly === true,
      extraKeys: extraKeys,
      scrollPastEnd: true,
    })
    this.codeMirror.on('change', this.handleCodeMirrorChange)
    window.addEventListener('codemirror-mode-load', this.reloadMode)
    if (this.props.codeMirrorRef != null) {
      this.props.codeMirrorRef(this.codeMirror)
    }
    this.codeMirror.on('paste', this.handlePaste as any)
    this.codeMirror.on('drop', this.handleDrop)
    this.codeMirror.on('cursorActivity', this.handleCursorActivity)
  }

  reloadMode = () => {
    if (this.codeMirror != null) {
      this.codeMirror.setOption('mode', this.codeMirror.getOption('mode'))
    }
  }

  componentDidUpdate(prevProps: CodeEditorProps) {
    if (this.codeMirror == null) {
      return
    }
    if (this.props.value !== this.codeMirror.getValue()) {
      this.codeMirror.setValue(this.props.value)
    }
    if (this.props.theme !== prevProps.theme) {
      this.codeMirror.setOption('theme', getCodeMirrorTheme(this.props.theme))
    }
    if (
      this.props.fontSize !== prevProps.fontSize ||
      this.props.fontFamily !== prevProps.fontFamily
    ) {
      this.codeMirror.refresh()
    }
    if (this.props.indentType !== prevProps.indentType) {
      this.codeMirror.setOption(
        'indentWithTabs',
        this.props.indentType === 'tab'
      )
    }
    if (this.props.indentSize !== prevProps.indentSize) {
      const indentSize =
        this.props.indentSize == null ? 2 : this.props.indentSize
      this.codeMirror.setOption('indentUnit', indentSize)
      this.codeMirror.setOption('tabSize', indentSize)
    }

    const keyMap =
      this.props.keyMap == null || this.props.keyMap === 'default'
        ? 'sublime'
        : this.props.keyMap
    if (this.props.keyMap !== prevProps.keyMap) {
      this.codeMirror.setOption('keyMap', keyMap)
    }

    const [
      localSearchShortcut,
      localReplaceShortcut,
    ] = this.getCurrentSearchKeymaps()
    if (
      this.props.keyMap !== prevProps.keyMap ||
      this.prevLocalSearchShortcut != localSearchShortcut ||
      this.prevLocalReplaceShortcut != localReplaceShortcut
    ) {
      this.codeMirror.setOption('extraKeys', this.getExtraKeys(keyMap))
    }
  }

  componentWillUnmount() {
    if (this.codeMirror != null) {
      this.codeMirror.toTextArea()
      this.codeMirror.off('paste', this.handlePaste as any)
      this.codeMirror.off('drop', this.handleDrop)
      this.codeMirror.off('cursorActivity', this.handleCursorActivity)
    }
    window.removeEventListener('codemirror-mode-load', this.reloadMode)
  }

  getCurrentSearchKeymaps(): string[] {
    let localSearchShortcut = this.props.getCustomKeymap('toggleLocalSearch')
    let localReplaceShortcut = this.props.getCustomKeymap('toggleLocalReplace')
    if (localSearchShortcut == null) {
      localSearchShortcut = osName === 'macos' ? 'Cmd+F' : 'Ctrl+F'
    }
    if (localReplaceShortcut == null) {
      localReplaceShortcut = osName === 'macos' ? 'Cmd-H' : 'Ctrl-H'
    }
    return [localSearchShortcut, localReplaceShortcut]
  }

  getExtraKeys = (keyMapStyle: string) => {
    const [
      localSearchShortcut,
      localReplaceShortcut,
    ] = this.getCurrentSearchKeymaps()
    const extraKeys = {
      Enter: 'newlineAndIndentContinueMarkdownList',
      Tab: 'indentMore',
      Esc: (cm: CodeMirror.Editor) => {
        if (keyMapStyle === 'vim') {
          return CodeMirror.Pass
        } else {
          this.handleOnLocalSearchToggle(cm, false)
          return this.handleOnLocalSearchReplaceToggle(cm, false)
        }
      },
    }
    extraKeys[localSearchShortcut] = (cm: CodeMirror.Editor) =>
      this.handleOnLocalSearchToggle(cm, true)

    extraKeys[localReplaceShortcut] = (cm: CodeMirror.Editor) =>
      this.handleOnLocalSearchReplaceToggle(cm, true)

    this.prevLocalSearchShortcut = localSearchShortcut
    this.prevLocalReplaceShortcut = localReplaceShortcut
    return extraKeys
  }

  handleOnLocalSearchReplaceToggle = (
    editor: CodeMirror.Editor,
    showLocalReplace: boolean
  ) => {
    const { onLocalSearchReplaceToggle } = this.props
    if (onLocalSearchReplaceToggle == null) {
      return
    }

    onLocalSearchReplaceToggle(editor, showLocalReplace)
  }

  handleOnLocalSearchToggle = (
    editor: CodeMirror.Editor,
    showLocalSearch: boolean
  ) => {
    const { onLocalSearchToggle } = this.props
    if (onLocalSearchToggle == null) {
      return
    }

    onLocalSearchToggle(editor, showLocalSearch)
  }

  handlePaste = (editor: CodeMirror.Editor, event: ClipboardEvent) => {
    const { onPaste } = this.props
    if (onPaste == null) {
      return
    }

    onPaste(editor, event)
  }

  handleDrop = (editor: CodeMirror.Editor, event: DragEvent) => {
    const { onDrop } = this.props
    if (onDrop == null) {
      return
    }

    onDrop(editor, event)
  }

  handleCodeMirrorChange = (
    editor: CodeMirror.Editor,
    change: CodeMirror.EditorChangeLinkedList
  ) => {
    if (change.origin !== 'setValue' && this.props.onChange != null) {
      this.props.onChange(editor.getValue(), change)
    }
  }

  handleCursorActivity = (editor: CodeMirror.Editor) => {
    if (this.props.onCursorActivity != null) {
      this.props.onCursorActivity(editor)
    }
  }

  render() {
    const { fontSize, fontFamily, value, className } = this.props

    return (
      <StyledContainer
        className={className}
        style={{
          fontSize: fontSize == null ? 'inherit' : `${fontSize}px`,
          fontFamily: fontFamily == null ? 'monospace' : fontFamily,
        }}
      >
        <textarea ref={this.textAreaRef} defaultValue={value} />
      </StyledContainer>
    )
  }
}

export default CodeEditor
