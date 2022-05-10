import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { getColorFromString } from '../../../cloud/lib/utils/string'
import styled from '../../../design/lib/styled'
import {
  SerializedDocWithSupplemental,
  SerializedDoc,
} from '../../../cloud/interfaces/db/doc'
import { useSettings } from '../../../cloud/lib/stores/settings'
import useRealtime from '../../../cloud/lib/editor/hooks/useRealtime'
import attachFileHandlerToCodeMirrorEditor, {
  OnFileCallback,
} from '../../../cloud/lib/editor/plugins/fileHandler'
import { uploadFile, buildTeamFileUrl } from '../../../cloud/api/teams/files'
import { SerializedTeam } from '../../../cloud/interfaces/db/team'
import { getDocTitle } from '../../../cloud/lib/utils/patterns'
import { SerializedUser } from '../../../cloud/interfaces/db/user'
import { usePreferences } from '../../lib/preferences'
import { useRouter } from '../../../cloud/lib/router'
import {
  pasteFormatPlugin,
  PositionRange,
  Callback,
} from '../../../cloud/lib/editor/plugins/pasteFormatPlugin'
import { buildIconUrl } from '../../../cloud/api/files'
import { mdiPencilOutline, mdiEyeOutline, mdiDotsHorizontal } from '@mdi/js'
import { useNav } from '../../../cloud/lib/stores/nav'
import { Hint } from 'codemirror'
import {
  focusTitleEventEmitter,
  focusEditorEventEmitter,
} from '../../../cloud/lib/utils/events'
import { ScrollSync, scrollSyncer } from '../../../cloud/lib/editor/scrollSync'
import CodeMirrorEditor from '../../../cloud/lib/editor/components/CodeMirrorEditor'
import { useToast } from '../../../design/lib/stores/toast'
import EditorSelectionStatus from '../../../cloud/components/Editor/EditorSelectionStatus'
import EditorThemeSelect from '../../../cloud/components/Editor/EditorThemeSelect'
import AppLayout from '../layouts/AppLayout'
import EditorIndentationStatus from '../../../cloud/components/Editor/EditorIndentationStatus'
import { getDocLinkHref } from '../../lib/href'
import NavigationBarButton from '../atoms/NavigationBarButton'
import { useModal } from '../../../design/lib/stores/modal'
import DocInfoModal from '../organisms/modals/DocInfoModal'
import { SerializedRevision } from '../../../cloud/interfaces/db/revision'
import { osName } from '../../../lib/platform'
import { BaseTheme } from '../../../design/lib/styled/types'
import Spinner from '../../../design/components/atoms/Spinner'
import { rightSidePageLayout } from '../../../design/lib/styled/styleFunctions'
import Icon from '../../../design/components/atoms/Icon'
import { bytesToMegaBytes } from '../../../cloud/lib/utils/bytes'
import { nginxSizeLimitInMb } from '../../../cloud/lib/upload'
import { SerializedSubscription } from '../../../cloud/interfaces/db/subscription'
import {
  freePlanUploadSizeMb,
  paidPlanUploadSizeMb,
} from '../../../cloud/lib/subscription'
import CustomizedMarkdownPreviewer from '../../../cloud/components/MarkdownView/CustomizedMarkdownPreviewer'
import { scrollEditorToLine } from '../../../cloud/lib/hooks/editor/docEditor'

interface EditorProps {
  doc: SerializedDocWithSupplemental
  team: SerializedTeam
  user: SerializedUser
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
  subscription?: SerializedSubscription
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

const Editor = ({
  doc,
  team,
  user,
  contributors,
  backLinks,
  subscription,
}: EditorProps) => {
  const { pushMessage, pushApiErrorMessage } = useToast()
  const { preferences, setPreferences } = usePreferences()
  const { state } = useRouter()
  const { openModal } = useModal()
  const [color] = useState(() => getColorFromString(user.id))
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const editorRef = useRef<CodeMirror.Editor | null>(null)
  const fileUploadHandlerRef = useRef<OnFileCallback>()
  const docRef = useRef<string>('')
  const [shortcodeConvertMenu, setShortcodeConvertMenu] = useState<{
    pos: PositionRange
    cb: Callback
  } | null>(null)
  const initialRenderDone = useRef(false)
  const titleRef = useRef<HTMLInputElement>(null)
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
  const { docsMap, workspacesMap, loadDoc } = useNav()
  const suggestionsRef = useRef<Hint[]>([])

  const { editorMode } = preferences

  const userInfo = useMemo(() => {
    return {
      id: user.id,
      name: user.displayName,
      color: color,
      icon: user.icon != null ? buildIconUrl(user.icon.location) : undefined,
    }
  }, [user, color])

  const [realtime, connState] = useRealtime({
    token: doc.collaborationToken || doc.id,
    id: doc.id,
    userInfo,
  })

  const docIsNew = !!state?.new
  useEffect(() => {
    if (docRef.current !== doc.id) {
      if (docIsNew) {
        if (titleRef.current != null) {
          titleRef.current.focus()
        }

        setPreferences({
          editorMode: 'edit',
        })
      } else {
        setPreferences({
          editorMode: 'preview',
        })
      }
      docRef.current = doc.id
    }
  }, [doc.id, docIsNew, editorMode, setPreferences])

  useEffect(() => {
    if (editorMode === 'preview') {
      return
    }

    if (editorRef.current != null) {
      editorRef.current.focus()
    }
  }, [editorMode])

  useEffect(() => {
    if (!initialLoadDone) {
      return
    }
    if (editorRef.current != null) {
      editorRef.current.focus()
    } else if (titleRef.current != null) {
      titleRef.current.focus()
    }
  }, [initialLoadDone, docIsNew])

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

  useEffect(() => {
    return () => {
      setInitialLoadDone(false)
    }
  }, [doc.id])

  useEffect(() => {
    if (connState === 'synced' || connState === 'loaded') {
      setInitialLoadDone(true)
    }
  }, [connState])

  useEffect(() => {
    suggestionsRef.current = Array.from(docsMap.values()).map((doc) => {
      const workspace = workspacesMap.get(doc.workspaceId)
      const path = `${workspace != null ? workspace.name : ''}${
        doc.folderPathname === '/' ? '' : doc.folderPathname
      }`
      return {
        text: `[[ boostnote.doc id="${doc.id}" ]]`,
        displayText: `${path}/${getDocTitle(doc)}`,
      }
    })
  }, [docsMap, workspacesMap])

  const previewRef = useRef<HTMLDivElement>(null)
  const syncScroll = useRef<ScrollSync>()

  const onRender = useRef(() => {
    if (!initialRenderDone.current && window.location.hash) {
      const ele = document.getElementById(window.location.hash.substr(1))
      if (ele != null) {
        ele.scrollIntoView(true)
      }
      initialRenderDone.current = true
    }
    if (previewRef.current != null && editorRef.current != null) {
      if (syncScroll.current == null) {
        syncScroll.current = scrollSyncer(editorRef.current, previewRef.current)
      } else {
        syncScroll.current.rebuild()
      }
    }
  })

  useEffect(() => {
    return () => {
      if (syncScroll.current != null) {
        syncScroll.current.destroy()
        syncScroll.current = undefined
      }
    }
  }, [doc])

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
    editor.on('cursorActivity', (codeMirror: CodeMirror.Editor) => {
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
    })
  }, [])

  useEffect(() => {
    if (editorRef.current != null) {
      editorRef.current.refresh()
    }
  }, [editorMode])

  const { settings } = useSettings()
  const fontSize = useMemo(() => {
    return settings['general.editorFontSize']
  }, [settings])
  const fontFamily = useMemo(() => {
    return settings['general.editorFontFamily']
  }, [settings])
  const editorConfig: CodeMirror.EditorConfiguration = useMemo(() => {
    const editorTheme = settings['general.editorTheme']
    const theme =
      editorTheme == null || editorTheme === 'default'
        ? settings['general.theme'] === 'light'
          ? 'default'
          : 'material-darker'
        : editorTheme === 'solarized-dark'
        ? 'solarized dark'
        : editorTheme
    const editorIndentType = settings['general.editorIndentType']
    const editorIndentSize = settings['general.editorIndentSize']
    const editorLineNumbers = settings['general.editorShowLineNumbers']

    return {
      mode: 'markdown',
      lineNumbers: editorLineNumbers,
      lineWrapping: true,
      theme,
      indentWithTabs: editorIndentType === 'tab',
      indentUnit: editorIndentSize,
      tabSize: editorIndentSize,
      inputStyle: osName === 'android' ? 'textarea' : 'contenteditable',
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList',
        Tab: 'indentMore',
      },
      scrollPastEnd: true,
    }
  }, [settings])

  const setEditorRefContent = useCallback(
    (
      newValueOrUpdater: string | ((prevValue: string) => string),
      refocusEditorAndCursor = false
    ) => {
      if (editorRef.current == null) {
        return
      }
      const updater =
        typeof newValueOrUpdater === 'string'
          ? () => newValueOrUpdater
          : newValueOrUpdater
      const { line } = editorRef.current?.getCursor()
      editorRef.current.setValue(updater(editorContent))
      if (refocusEditorAndCursor) {
        editorRef.current.focus()
        editorRef.current.setCursor(line)
        scrollEditorToLine(editorRef.current, line)
      }
    },
    [editorContent]
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

  const focusEditor = useCallback(() => {
    if (editorMode === 'preview') {
      return
    }

    if (editorRef.current == null) {
      return
    }

    editorRef.current.focus()
  }, [editorMode])

  const focusTitleInputRef = useRef<() => void>()
  useEffect(() => {
    const handler = () => {
      if (focusTitleInputRef.current == null) {
        return
      }
      focusTitleInputRef.current()
    }
    focusTitleEventEmitter.listen(handler)

    return () => {
      focusTitleEventEmitter.unlisten(handler)
    }
  }, [])

  useEffect(() => {
    focusEditorEventEmitter.listen(focusEditor)
    return () => {
      focusEditorEventEmitter.unlisten(focusEditor)
    }
  }, [focusEditor])

  const toggleEditorMode = useCallback(() => {
    setPreferences({
      editorMode: editorMode === 'edit' ? 'preview' : 'edit',
    })
  }, [setPreferences, editorMode])

  const onRestoreRevisionCallback = useCallback(
    (rev: SerializedRevision) => {
      if (realtime == null) {
        return
      }
      const realtimeTitle = realtime.doc.getText('title')
      realtimeTitle.delete(0, realtimeTitle.toString().length)
      setEditorRefContent(rev.content)
    },
    [realtime, setEditorRefContent]
  )

  const openDocInfoModal = useCallback(() => {
    openModal(
      <DocInfoModal
        team={team}
        currentDoc={doc}
        contributors={contributors}
        backLinks={backLinks}
        restoreRevision={onRestoreRevisionCallback}
      />
    )
  }, [openModal, team, doc, contributors, backLinks, onRestoreRevisionCallback])

  if (!initialLoadDone) {
    return (
      <AppLayout>
        <StyledLoadingView>
          <h3>Loading..</h3>
          <span>
            <Spinner />
          </span>
        </StyledLoadingView>
      </AppLayout>
    )
  }
  return (
    <AppLayout
      title={doc.title}
      navigatorBarRight={
        <>
          <NavigationBarButton onClick={toggleEditorMode}>
            <Icon
              size={20}
              path={editorMode === 'preview' ? mdiPencilOutline : mdiEyeOutline}
            />
          </NavigationBarButton>
          <NavigationBarButton onClick={openDocInfoModal}>
            <Icon size={20} path={mdiDotsHorizontal} />
          </NavigationBarButton>
        </>
      }
    >
      <Container>
        <StyledEditor className={editorMode}>
          <StyledEditorWrapper
            className={`layout-${editorMode}`}
            fontFamily={fontFamily}
            fontSize={fontSize}
          >
            <>
              <CodeMirrorEditor
                bind={bindCallback}
                config={editorConfig}
                realtime={realtime}
              />
              {shortcodeConvertMenu !== null && (
                <StyledShortcodeConvertMenu style={shortcodeConvertMenuStyle}>
                  <button onClick={() => shortcodeConvertMenu.cb(false)}>
                    Dismiss
                  </button>
                  <button onClick={() => shortcodeConvertMenu.cb(true)}>
                    Create embed
                  </button>
                </StyledShortcodeConvertMenu>
              )}
            </>
          </StyledEditorWrapper>
          <StyledPreview className={`layout-${editorMode}`}>
            <CustomizedMarkdownPreviewer
              content={editorContent}
              updateContent={setEditorRefContent}
              headerLinks={editorMode === 'preview'}
              onRender={onRender.current}
              className='scroller'
              getEmbed={getEmbed}
              scrollerRef={previewRef}
            />
          </StyledPreview>
        </StyledEditor>

        {editorMode !== 'preview' && (
          <StyledBottomBar>
            <EditorSelectionStatus
              cursor={selection.currentCursor}
              selections={selection.currentSelections}
            />
            <EditorThemeSelect />
            <EditorIndentationStatus />
          </StyledBottomBar>
        )}
      </Container>
    </AppLayout>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  height: 100%;
`

const StyledBottomBar = styled.div`
  display: flex;
  position: relative;
  flex: 0 0 auto;
  border-top: solid 1px ${({ theme }) => theme.colors.border.main};
  height: 24px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  box-sizing: content-box;
  & > :first-child {
    flex: 1;
  }
`

const StyledShortcodeConvertMenu = styled.div`
  margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
  border-radius: 5px;

  button {
    display: block;
    width: 200px;
    line-height: 25px;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    background-color: ${({ theme }) => theme.colors.variants.primary.base};
    color: ${({ theme }) => theme.colors.variants.primary.text};
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    text-align: left;

    &:first-child {
      border-radius: 5px 5px 0 0;
    }

    &:last-child {
      border-radius: 0 0 5px 5px;
    }

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
      color: ${({ theme }) => theme.colors.text.primary};
      cursor: pointer;
    }
  }
`

const StyledLoadingView = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
  & span {
    width: 100%;
    height: 38px;
    position: relative;
  }
`

interface FontOptionsProps {
  fontSize: string
  fontFamily: string
}

const StyledEditorWrapper = styled.div<BaseTheme & FontOptionsProps>`
  position: relative;
  height: auto;
  &.layout-edit {
    width: 100%;
  }
  &.layout-preview {
    display: none;
  }

  & .CodeMirror * {
    font-size: ${({ fontSize }) =>
      fontSize == null ? 'inherit' : `${fontSize}px`};
    font-family: ${({ fontFamily }) =>
      fontFamily == null ? 'monospace' : fontFamily};
  }
`

const StyledPreview = styled.div`
  height: 100%;
  width: 50%;
  &.layout-preview {
    padding-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin: 0 auto;
    width: 100%;
  }
  &.layout-edit {
    display: none;
  }
`

const StyledEditor = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  position: relative;
  top: 0;
  bottom: 0px;
  width: 100%;
  height: auto;
  min-height: 0;
  font-size: 15px;
  &.preview,
  .preview {
    ${rightSidePageLayout}
    margin: auto;
    .scroller {
      padding: 0 ${({ theme }) => theme.sizes.spaces.md}px
        ${({ theme }) => theme.sizes.spaces.xl}px;
    }
  }
  & .CodeMirrorWrapper {
    height: 100%;
    word-break: break-word;
  }
  & .CodeMirror {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 0 !important;
    .CodeMirror-hints {
      position: absolute;
      z-index: 10;
      overflow: auto;
      max-width: 90%;
      max-height: 20em;
      margin: 0;
      padding: 0;
      border-radius: 3px;
      border: 1px solid ${({ theme }) => theme.colors.border.main};
      background: ${({ theme }) => theme.colors.background.primary};
      color: ${({ theme }) => theme.colors.text.primary};
      font-size: 90%;
      font-family: monospace;
      list-style: none;
    }
    .CodeMirror-hint {
      position: relative;
      margin: 0;
      padding: ${({ theme }) => theme.sizes.spaces.xsm}px
        ${({ theme }) => theme.sizes.spaces.sm}px;
      white-space: pre;
      color: ${({ theme }) => theme.colors.text.primary};
      cursor: pointer;
      font-size: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
    li.CodeMirror-hint-active {
      color: ${({ theme }) => theme.colors.text.primary};
      &:before {
        content: '';
        display: block;
        position: absolute;
        top: 3px;
        left: ${({ theme }) => theme.sizes.spaces.xsm}px;
        width: 3px;
        height: 22px;
        background-color: ${({ theme }) => theme.colors.background.primary};
      }
    }
    & .remote-caret {
      position: relative;
      border-left: 1px solid black;
      margin-left: -1px;
      box-sizing: border-box;
      &:hover > div {
        opacity: 1;
        transition-delay: 0s;
      }
      & > div {
        position: absolute;
        left: -1px;
        height: 100%;
        top: 0;
        transform: translate3d(0, -100%, 0);
        font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
        height: ${({ theme }) => theme.sizes.fonts.xsm + 4}px;
        line-height: ${({ theme }) => theme.sizes.fonts.xsm + 4}px;
        vertical-align: middle;
        background-color: rgb(250, 129, 0);
        user-select: none;
        color: white;
        padding-left: 2px;
        padding-right: 2px;
        z-index: 3;
        transition: opacity 0.3s ease-in-out;
        white-space: nowrap;
      }
    }
  }
  .CodeMirror-scroll {
    position: relative;
    z-index: 0;
  }
  .CodeMirror-code,
  .CodeMirror-gutters {
    padding-bottom: ${({ theme }) => theme.sizes.fonts.xl}px;
  }
  & .file-loading-widget {
    transform: translate3d(0, -100%, 0);
  }
`

export default Editor
