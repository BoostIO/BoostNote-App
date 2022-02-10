import { Hint } from 'codemirror'
import throttle from 'lodash.throttle'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { YText, YEvent } from 'yjs/dist/src/internals'
import { useToast } from '../../../../design/lib/stores/toast'
import { buildIconUrl } from '../../../api/files'
import { buildTeamFileUrl, uploadFile } from '../../../api/teams/files'
import { getDocLinkHref } from '../../../components/Link/DocLink'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedTemplate } from '../../../interfaces/db/template'
import { SerializedUser } from '../../../interfaces/db/user'
import useRealtime from '../../editor/hooks/useRealtime'
import attachFileHandlerToCodeMirrorEditor, {
  OnFileCallback,
} from '../../editor/plugins/fileHandler'
import {
  Callback,
  pasteFormatPlugin,
  PositionRange,
} from '../../editor/plugins/pasteFormatPlugin'
import { useLocalSnapshot } from '../../stores/localSnapshots'
import { useNav } from '../../stores/nav'
import { CodeMirrorKeyMap, useSettings } from '../../stores/settings'
import { freePlanUploadSizeMb, paidPlanUploadSizeMb } from '../../subscription'
import { nginxSizeLimitInMb } from '../../upload'
import { bytesToMegaBytes } from '../../utils/bytes'
import { getColorFromString, getRandomColor } from '../../utils/string'

interface DocEditorHookProps {
  doc: SerializedDocWithSupplemental
  collaborationToken: string
  team?: SerializedTeam
  user?: SerializedUser
  subscription?: SerializedSubscription
}

export function useDocEditor({
  doc,
  collaborationToken,
  user,
  team,
  subscription,
}: DocEditorHookProps) {
  const { settings } = useSettings()
  const [editorContent, setEditorContent] = useState('')
  const editorRef = useRef<CodeMirror.Editor | null>(null)
  const fileUploadHandlerRef = useRef<OnFileCallback>()
  const [shortcodeConvertMenu, setShortcodeConvertMenu] = useState<{
    pos: PositionRange
    cb: Callback
  } | null>(null)
  const suggestionsRef = useRef<Hint[]>([])
  const { loadDoc } = useNav()
  const { pushApiErrorMessage, pushMessage } = useToast()
  const [selection, setSelection] = useState<SelectionState>({
    currentCursor: {
      line: 0,
      ch: 0,
    },
    currentSelections: [
      {
        head: {
          line: 0,
          ch: 0,
        },
        anchor: {
          line: 0,
          ch: 0,
        },
      },
    ],
  })

  const userInfo = useMemo(() => {
    if (user == null) {
      return {
        id: '#Guest',
        name: 'Guest',
        color: getRandomColor(),
      }
    }
    return {
      id: user.id,
      name: user.displayName,
      color: getColorFromString(user.id),
      icon: user.icon != null ? buildIconUrl(user.icon.location) : undefined,
    }
  }, [user])

  const [realtime, connState, connectedUsers] = useRealtime({
    token: collaborationToken,
    id: doc.id,
    userInfo,
  })

  const editorConfig = useMemo<CodeMirror.EditorConfiguration>(() => {
    const editorTheme = settings['general.editorTheme']
    const theme =
      editorTheme == null || editorTheme === 'default'
        ? settings['general.theme'] === 'light'
          ? 'default'
          : 'material-darker'
        : editorTheme === 'solarized-dark'
        ? 'solarized dark'
        : editorTheme
    const keyMap = resolveKeyMap(settings['general.editorKeyMap'])
    const editorIndentType = settings['general.editorIndentType']
    const editorIndentSize = settings['general.editorIndentSize']
    const showEditorLineNumbers = settings['general.editorShowLineNumbers']
    const enableSpellCheck = settings['general.enableSpellcheck']

    return {
      mode: 'markdown',
      lineNumbers: showEditorLineNumbers,
      lineWrapping: true,
      theme,
      indentWithTabs: editorIndentType === 'tab',
      indentUnit: editorIndentSize,
      tabSize: editorIndentSize,
      keyMap,
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList',
        Tab: 'indentMore',
      },
      scrollPastEnd: true,
      // fixes IME being on top of current line, Codemirror issue: https://github.com/codemirror/CodeMirror/issues/3137
      spellcheck: enableSpellCheck,
      inputStyle: 'contenteditable',
    }
  }, [settings])

  const shortcodeConvertMenuStyle: React.CSSProperties = useMemo(() => {
    if (shortcodeConvertMenu == null || editorRef.current == null) {
      return {}
    }

    const editorScroll = editorRef.current.getScrollInfo()
    const bottomPositioning =
      shortcodeConvertMenu.pos.from.bottom - editorScroll.top

    return {
      position: 'absolute',
      top: `${
        bottomPositioning + 125 > editorScroll.clientHeight
          ? bottomPositioning - 140
          : bottomPositioning
      }px`,
      left: `${
        (shortcodeConvertMenu.pos.to.left -
          shortcodeConvertMenu.pos.from.left) /
          2 +
        shortcodeConvertMenu.pos.from.left
      }px`,
    }
  }, [shortcodeConvertMenu])

  const onTemplatePickCallback = useCallback(
    (template: SerializedTemplate) => {
      if (editorRef.current == null || realtime == null) {
        return
      }
      editorRef.current.setValue(template.content)
    },
    [realtime]
  )

  const setEditorRefContent = useCallback(
    (newValueOrUpdater: string | ((prevValue: string) => string)) => {
      if (editorRef.current == null) {
        return
      }
      const updater =
        typeof newValueOrUpdater === 'string'
          ? () => newValueOrUpdater
          : newValueOrUpdater
      editorRef.current.setValue(updater(editorContent))
    },
    [editorRef, editorContent]
  )

  const onRestoreRevisionCallback = useCallback(
    (revisionContent: string) => {
      if (realtime == null) {
        return
      }

      setEditorRefContent(revisionContent)
    },
    [realtime, setEditorRefContent]
  )

  const bindCallback = useCallback((editor: CodeMirror.Editor) => {
    setEditorContent(editor.getValue())
    editorRef.current = editor
    attachFileHandlerToCodeMirrorEditor(editor, {
      onFile: async (file) => {
        return fileUploadHandlerRef.current != null
          ? fileUploadHandlerRef.current(file)
          : null
      },
    })
    pasteFormatPlugin(editor, {
      openMenu: (pos, cb) => {
        setShortcodeConvertMenu({ pos, cb })
      },
      closeMenu: () => {
        setShortcodeConvertMenu(null)
      },
      formatter: (pasted) => {
        if (pasted.length === 1) {
          const githubRegex =
            /https:\/\/github.com\/([^\/\s]+)\/([^\/\s]+)\/(pull|issues)\/(\d+)/
          const githubMatch = githubRegex.exec(pasted[0])

          if (githubMatch !== null) {
            const [, org, repo, type, num] = githubMatch
            const entityType = type === 'pull' ? 'github.pr' : 'github.issue'
            return {
              replacement: `[[ ${entityType} id="${org}/${repo}#${num}" ]]`,
              promptMenu: true,
            }
          }
        }

        if (pasted.length > 1) {
          const tableRegex = /\t/
          const tableMatch = tableRegex.test(pasted[0])

          if (tableMatch) {
            const linesInCols = pasted.map((line) => line.split('\t'))
            const cols = Math.max(...linesInCols.map((line) => line.length))

            linesInCols.splice(1, 0, new Array(cols).fill('-'))

            return {
              replacement: linesInCols
                .map((cols) => '| ' + cols.join(' | ') + ' |')
                .join('\n'),
              promptMenu: false,
            }
          }
        }

        return { replacement: null, promptMenu: false }
      },
    })
    editor.on('change', (instance) => {
      setEditorContent(instance.getValue())
    })
    editor.on('inputRead', (_, change) => {
      if (change.origin !== '+input') return

      if (editor.getLine(change.to.line) === '[[') {
        editor.showHint({
          container: editor.getWrapperElement(),
          closeOnUnfocus: false,
          alignWithWord: true,
          closeCharacters: /[\n]/,
          hint: () => {
            const line = editor.getLine(editor.getCursor().line)
            const filter = line.slice(2)
            const list = suggestionsRef.current.filter((hint) => {
              return (
                hint.displayText != null &&
                hint.displayText.toLowerCase().includes(filter.toLowerCase())
              )
            })
            return {
              from: { ch: 0, line: change.to.line },
              to: { ch: line.length, line: change.to.line },
              list,
            }
          },
        })
      }
    })
    editor.on(
      'cursorActivity',
      throttle(
        (codeMirror: CodeMirror.Editor) => {
          const doc = codeMirror.getDoc()
          const { line, ch } = doc.getCursor()
          const selections = doc.listSelections()

          setSelection({
            currentCursor: {
              line,
              ch,
            },
            currentSelections: selections,
          })
        },
        500,
        { trailing: true }
      )
    )
  }, [])

  const updateContent = useCallback(() => {
    if (realtime == null) {
      return
    }
    setEditorContent(realtime.doc.getText('content').toString())
  }, [realtime])

  const { takeSnapshot } = useLocalSnapshot()

  const handleYTextChange = useCallback(
    (_event: YEvent, ytext: YText) => {
      takeSnapshot(doc.id, ytext.toString())
    },
    [takeSnapshot, doc.id]
  )

  const getEmbed = useCallback(
    async (id: string) => {
      if (team == null) {
        return undefined
      }
      const doc = await loadDoc(id, team.id)
      if (doc == null) {
        return undefined
      }
      const current = `${location.protocol}//${location.host}`
      const link = `${current}${getDocLinkHref(doc, team, 'index')}`
      return {
        title: doc.title,
        content: doc.head != null ? doc.head.content : '',
        link,
      }
    },
    [loadDoc, team]
  )

  useEffect(() => {
    updateContent()
  }, [updateContent])

  useEffect(() => {
    if (realtime != null) {
      realtime.doc.on('update', () => {
        updateContent()
      })
      return () =>
        realtime.doc.off('update', () => {
          updateContent()
        })
    }
    return undefined
  }, [realtime, updateContent])

  useEffect(() => {
    if (team != null) {
      fileUploadHandlerRef.current = async (file) => {
        if (bytesToMegaBytes(file.size) > nginxSizeLimitInMb) {
          pushMessage({
            title: '',
            description: `File size exceeding limit. ${
              subscription == null ? freePlanUploadSizeMb : paidPlanUploadSizeMb
            }Mb limit per upload allowed.`,
          })
          return null
        }
        try {
          const { file: fileInfo } = await uploadFile(team, file, doc)
          const url = buildTeamFileUrl(team, fileInfo.name)
          if (file.type.match(/image\/.*/)) {
            return { type: 'img', url, alt: file.name }
          } else {
            return { type: 'file', url, title: file.name }
          }
        } catch (err) {
          console.log(err)
          pushApiErrorMessage(err)
          return null
        }
      }
    } else {
      fileUploadHandlerRef.current = undefined
    }
  }, [team, pushMessage, pushApiErrorMessage, subscription, doc])

  return {
    editorConfig,
    editorContent,
    editorRef,
    selection,
    realtime,
    connState,
    connectedUsers,
    fileUploadHandlerRef,
    shortcodeConvertMenu,
    shortcodeConvertMenuStyle,
    showEditorToolbar: settings['general.showEditorToolbar'],
    fontFamily: settings['general.editorFontFamily'],
    fontSize: settings['general.editorFontSize'],
    getEmbed,
    handleYTextChange,
    bindCallback,
    onRestoreRevisionCallback,
    onTemplatePickCallback,
    setEditorRefContent,
  }
}

function resolveKeyMap(keyMap: CodeMirrorKeyMap) {
  switch (keyMap) {
    case 'vim':
      return 'vim'
    case 'default':
    default:
      return 'sublime'
  }
}

interface EditorPosition {
  line: number
  ch: number
}

interface SelectionState {
  currentCursor: EditorPosition
  currentSelections: {
    head: EditorPosition
    anchor: EditorPosition
  }[]
}
