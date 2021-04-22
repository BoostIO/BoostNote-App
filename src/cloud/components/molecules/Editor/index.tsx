import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { getColorFromString } from '../../../lib/utils/string'
import styled from '../../../lib/styled'
import {
  SerializedDoc,
  SerializedDocWithBookmark,
} from '../../../interfaces/db/doc'
import { useSettings, CodeMirrorKeyMap } from '../../../lib/stores/settings'
import useRealtime from '../../../lib/editor/hooks/useRealtime'
import Spinner from '../../atoms/CustomSpinner'
import attachFileHandlerToCodeMirrorEditor, {
  OnFileCallback,
} from '../../../lib/editor/plugins/fileHandler'
import { uploadFile, buildTeamFileUrl } from '../../../api/teams/files'
import { YText } from 'yjs/dist/src/internals'
import {
  useGlobalKeyDownHandler,
  preventKeyboardEventPropagation,
} from '../../../lib/keyboard'
import { SerializedTeam } from '../../../interfaces/db/team'
import { isEditSessionSaveShortcut } from '../../../lib/shortcuts'
import { getDocTitle, getTeamURL, getDocURL } from '../../../lib/utils/patterns'
import { SerializedUser } from '../../../interfaces/db/user'
import EditorToolbar from './EditorToolbar'
import { usePreferences } from '../../../lib/stores/preferences'
import { rightSidePageLayout } from '../../../lib/styled/styleFunctions'
import { useRouter } from '../../../lib/router'
import {
  pasteFormatPlugin,
  PositionRange,
  Callback,
} from '../../../lib/editor/plugins/pasteFormatPlugin'
import { buildIconUrl } from '../../../api/files'
import { SerializedRevision } from '../../../interfaces/db/revision'
import EditorTemplateButton from './EditorTemplateButton'
import Application from '../../Application'
import {
  mdiRepeat,
  mdiRepeatOff,
  mdiFileDocumentOutline,
  mdiStar,
  mdiStarOutline,
  mdiChevronLeft,
  mdiChevronRight,
  mdiPencil,
  mdiEyeOutline,
  mdiViewSplitVertical,
} from '@mdi/js'
import EditorToolButton from './EditorToolButton'
import { not } from 'ramda'
import EditorToolbarUpload from './EditorToolbarUpload'
import { useNav } from '../../../lib/stores/nav'
import { Hint } from 'codemirror'
import { EmbedDoc } from '../../../lib/docEmbedPlugin'
import { SerializedTemplate } from '../../../interfaces/db/template'
import TemplatesModal from '../../organisms/Modal/contents/TemplatesModal'
import { useModal } from '../../../lib/stores/modal'
import EditorSelectionStatus from './EditorSelectionStatus'
import EditorIndentationStatus from './EditorIndentationStatus'
import EditorKeyMapSelect from './EditorKeyMapSelect'
import EditorThemeSelect from './EditorThemeSelect'
import DocContextMenu from '../../organisms/Topbar/Controls/ControlsContextMenu/DocContextMenu'
import {
  focusTitleEventEmitter,
  focusEditorEventEmitter,
  toggleSplitEditModeEventEmitter,
  togglePreviewModeEventEmitter,
} from '../../../lib/utils/events'
import { ScrollSync, scrollSyncer } from '../../../lib/editor/scrollSync'
import CodeMirrorEditor from '../../../lib/editor/components/CodeMirrorEditor'
import MarkdownView from '../../atoms/MarkdownView'
import { usePage } from '../../../lib/stores/pageStore'
import { useToast } from '../../../../shared/lib/stores/toast'
import { mapTopbarBreadcrumbs } from '../../../../shared/lib/mappers/cloud/topbarBreadcrumbs'
import { LoadingButton } from '../../../../shared/components/atoms/Button'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'
import { useCloudUpdater } from '../../../lib/hooks/useCloudUpdater'
import { useCloudUI } from '../../../lib/hooks/useCloudUI'

type LayoutMode = 'split' | 'preview' | 'editor'

interface EditorProps {
  doc: SerializedDocWithBookmark
  team: SerializedTeam
  user: SerializedUser
  revisionHistory: SerializedRevision[]
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
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
  revisionHistory,
}: EditorProps) => {
  const { currentUserPermissions } = usePage()
  const { pushMessage, pushApiErrorMessage } = useToast()
  const [color] = useState(() => getColorFromString(user.id))
  const { preferences, setPreferences } = usePreferences()
  const editorRef = useRef<CodeMirror.Editor | null>(null)
  const [initialSyncDone, setInitialSyncDone] = useState(false)
  const fileUploadHandlerRef = useRef<OnFileCallback>()
  const [editorLayout, setEditorLayout] = useState<LayoutMode>('preview')
  const [title, setTitle] = useState(getDocTitle(doc))
  const previousTitle = useRef<string>()
  const [editorContent, setEditorContent] = useState('')
  const docRef = useRef<string>('')
  const { state, push } = useRouter()
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
  const { docsMap, workspacesMap, foldersMap } = useNav()
  const suggestionsRef = useRef<Hint[]>([])
  const { sendingMap, toggleDocBookmark } = useCloudUpdater()
  const {
    openRenameDocForm,
    openRenameFolderForm,
    openNewFolderForm,
    openNewDocForm,
    openWorkspaceEditForm,
    deleteOrArchiveDoc,
    deleteFolder,
    deleteWorkspace,
  } = useCloudUI()

  const userInfo = useMemo(() => {
    return {
      id: user.id,
      name: user.displayName,
      color: color,
      icon: user.icon != null ? buildIconUrl(user.icon.location) : undefined,
    }
  }, [user, color])

  const [realtime, connState, connectedUsers] = useRealtime({
    token: doc.collaborationToken || doc.id,
    id: doc.id,
    userInfo,
  })

  useEffect(() => {
    if (previousTitle.current !== doc.head?.title) {
      setTitle(getDocTitle(doc))
      previousTitle.current = doc.head?.title
    }
  }, [doc])

  const docIsNew = !!state.new
  useEffect(() => {
    if (docRef.current !== doc.id) {
      if (docIsNew) {
        setEditorLayout(preferences.lastUsedLayout)
        if (titleRef.current != null) {
          titleRef.current.focus()
        }
      } else {
        setEditorLayout('preview')
      }
      docRef.current = doc.id
    }
  }, [doc.id, docIsNew, preferences.lastUsedLayout])

  useEffect(() => {
    if (editorLayout === 'preview') {
      return
    }

    if (editorRef.current != null) {
      editorRef.current.focus()
    }
  }, [editorLayout])

  useEffect(() => {
    if (!initialSyncDone) {
      return
    }
    if (editorRef.current != null) {
      editorRef.current.focus()
    } else if (titleRef.current != null) {
      titleRef.current.focus()
    }
  }, [initialSyncDone, docIsNew])

  const changeEditorLayout = useCallback(
    (target: LayoutMode) => {
      setEditorLayout(target)
      if (target === 'preview') {
        return
      }

      setPreferences({
        lastUsedLayout: target,
      })
    },
    [setPreferences]
  )

  const editPageKeydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isEditSessionSaveShortcut(event)) {
        preventKeyboardEventPropagation(event)
        return
      }
    }
  }, [])
  useGlobalKeyDownHandler(editPageKeydownHandler)

  useEffect(() => {
    if (team != null) {
      fileUploadHandlerRef.current = async (file) => {
        try {
          const { file: fileInfo } = await uploadFile(team, file, doc)
          const url = buildTeamFileUrl(team, fileInfo.name)
          if (file.type.match(/image\/.*/)) {
            return { type: 'img', url, alt: file.name }
          } else {
            return { type: 'file', url, title: file.name }
          }
        } catch (err) {
          pushApiErrorMessage(err)
          return null
        }
      }
    } else {
      fileUploadHandlerRef.current = undefined
    }
  }, [team, pushMessage, pushApiErrorMessage, doc])

  useEffect(() => {
    return () => {
      setInitialSyncDone(false)
    }
  }, [doc.id])

  useEffect(() => {
    if (connState === 'synced') {
      setInitialSyncDone(true)
    }
  }, [connState])

  const titleChangeCallback = useCallback(
    (newTitle: string) => {
      if (realtime == null) {
        return
      }

      const realtimeTitle = realtime.doc.getText('title') as YText
      // TODO: switch to delta diff implementation
      realtimeTitle.delete(0, realtimeTitle.toString().length)
      realtimeTitle.insert(0, newTitle)
      //--------
    },
    [realtime]
  )

  useEffect(() => {
    if (realtime == null) {
      return
    }

    const titleYText = realtime.doc.getText('title') as YText
    const realtimeTitle = titleYText.toString()
    setTitle(realtimeTitle)

    titleYText.observe((textEvent, _transac) => {
      // TODO: switch to delta diff implementation
      const delta = textEvent.delta[0]
      if (delta == null || delta['insert'] == null) {
        return setTitle('')
      }
      setTitle(delta['insert'])
      //--------
    })
    return
  }, [realtime, setTitle])

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
  const [scrollSync, setScrollSync] = useState(true)

  useEffect(() => {
    if (syncScroll.current != null) {
      scrollSync ? syncScroll.current.unpause() : syncScroll.current.pause()
    }
  }, [scrollSync])

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
        const githubRegex = /https:\/\/github.com\/([^\/\s]+)\/([^\/\s]+)\/(pull|issues)\/(\d+)/
        const githubMatch = githubRegex.exec(pasted)
        if (githubMatch == null) {
          return null
        }
        const [, org, repo, type, num] = githubMatch
        const entityType = type === 'pull' ? 'github.pr' : 'github.issue'
        return `[[ ${entityType} id="${org}/${repo}#${num}" ]]`
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
  }, [editorLayout])

  const onTemplatePickCallback = useCallback(
    (template: SerializedTemplate) => {
      if (editorRef.current == null || realtime == null) {
        return
      }
      setTitle(template.title)
      const realtimeTitle = realtime.doc.getText('title') as YText
      // TODO: switch to delta diff implementation
      realtimeTitle.delete(0, realtimeTitle.toString().length)
      realtimeTitle.insert(0, template.title)
      editorRef.current.setValue(template.content)
    },
    [setTitle, realtime]
  )

  const { settings } = useSettings()
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
    const keyMap = resolveKeyMap(settings['general.editorKeyMap'])
    const editorIndentType = settings['general.editorIndentType']
    const editorIndentSize = settings['general.editorIndentSize']

    return {
      mode: 'markdown',
      lineNumbers: true,
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
    }
  }, [settings])

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

  const otherUsers = useMemo(() => {
    return connectedUsers.filter((pUser) => pUser.id !== user.id)
  }, [connectedUsers, user])

  const onRestoreRevisionCallback = useCallback(
    (rev: SerializedRevision) => {
      if (realtime == null) {
        return
      }
      const realtimeTitle = realtime.doc.getText('title') as YText
      realtimeTitle.delete(0, realtimeTitle.toString().length)
      realtimeTitle.insert(0, rev.title)
      setEditorRefContent(rev.content)
    },
    [realtime, setEditorRefContent]
  )

  const { openModal } = useModal()
  const onEditorTemplateToolClick = useCallback(() => {
    openModal(<TemplatesModal callback={onTemplatePickCallback} />, {
      classNames: 'size-XL',
      closable: false,
    })
  }, [openModal, onTemplatePickCallback])

  const toggleScrollSync = useCallback(() => {
    setScrollSync(not)
  }, [])

  const embeddableDocs = useMemo(() => {
    const embedMap = new Map<string, EmbedDoc>()
    if (team == null) {
      return embedMap
    }

    for (const doc of docsMap.values()) {
      if (doc.head != null) {
        const current = `${location.protocol}//${location.host}`
        const link = `${current}${getTeamURL(team)}${getDocURL(doc)}`
        embedMap.set(doc.id, {
          title: doc.head.title,
          content: doc.head.content,
          link,
        })
      }
    }
    return embedMap
  }, [docsMap, team])

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
    if (editorLayout === 'preview') {
      return
    }

    if (editorRef.current == null) {
      return
    }

    editorRef.current.focus()
  }, [editorLayout])

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

  const breadcrumbs = useMemo(() => {
    const breadcrumbs = mapTopbarBreadcrumbs(
      team,
      foldersMap,
      workspacesMap,
      push,
      {
        pageDoc: {
          ...doc,
          head: { ...(doc.head || {}), title },
        } as SerializedDoc,
      },
      openRenameFolderForm,
      (doc) => openRenameDocForm(doc, titleChangeCallback),
      openNewDocForm,
      openNewFolderForm,
      openWorkspaceEditForm,
      deleteOrArchiveDoc,
      deleteFolder,
      deleteWorkspace
    )
    return breadcrumbs
  }, [
    team,
    foldersMap,
    workspacesMap,
    doc,
    title,
    push,
    openRenameDocForm,
    openRenameFolderForm,
    titleChangeCallback,
    openNewFolderForm,
    openNewDocForm,
    deleteOrArchiveDoc,
    deleteFolder,
    openWorkspaceEditForm,
    deleteWorkspace,
  ])

  const updateLayout = useCallback(
    (mode: LayoutMode) => {
      changeEditorLayout(mode)
    },
    [changeEditorLayout]
  )

  const toggleViewMode = useCallback(() => {
    if (editorLayout === 'preview') {
      trackEvent(MixpanelActionTrackTypes.DocLayoutEdit, {
        team: doc.teamId,
        doc: doc.id,
      })
      updateLayout(preferences.lastUsedLayout)
      return
    }
    updateLayout('preview')
  }, [
    updateLayout,
    preferences.lastUsedLayout,
    editorLayout,
    doc.id,
    doc.teamId,
  ])

  useEffect(() => {
    togglePreviewModeEventEmitter.listen(toggleViewMode)
    return () => {
      togglePreviewModeEventEmitter.unlisten(toggleViewMode)
    }
  }, [toggleViewMode])

  const toggleSplitEditMode = useCallback(() => {
    updateLayout(editorLayout === 'split' ? 'editor' : 'split')
  }, [updateLayout, editorLayout])

  useEffect(() => {
    toggleSplitEditModeEventEmitter.listen(toggleSplitEditMode)
    return () => {
      toggleSplitEditModeEventEmitter.unlisten(toggleSplitEditMode)
    }
  }, [toggleSplitEditMode])

  if (!initialSyncDone) {
    return (
      <Application content={{}}>
        <StyledLoadingView>
          <h3>Loading..</h3>
          <span>
            <Spinner />
          </span>
        </StyledLoadingView>
      </Application>
    )
  }
  return (
    <Application
      content={{
        reduced: false,
        topbar: {
          breadcrumbs,
          children:
            currentUserPermissions != null ? (
              <LoadingButton
                variant='icon'
                disabled={sendingMap.has(doc.id)}
                spinning={sendingMap.has(doc.id)}
                size='sm'
                iconPath={doc.bookmarked ? mdiStar : mdiStarOutline}
                onClick={() =>
                  toggleDocBookmark(doc.teamId, doc.id, doc.bookmarked)
                }
              />
            ) : null,
          controls: [
            ...(connState === 'reconnecting'
              ? [
                  {
                    variant: 'secondary' as const,
                    disabled: true,
                    label: 'Connecting...',
                    tooltip: (
                      <>
                        Attempting auto-reconnection
                        <br />
                        Changes will not be synced with the server until
                        reconnection
                      </>
                    ),
                  },
                ]
              : connState === 'disconnected'
              ? [
                  {
                    variant: 'warning' as const,
                    onClick: () => realtime.connect(),
                    label: 'Reconnect',
                    tooltip: (
                      <>
                        Please try reconnecting.
                        <br />
                        Changes will not be synced with the server until
                        reconnection
                      </>
                    ),
                  },
                ]
              : []),
            {
              variant: 'icon',
              iconPath: mdiPencil,
              active: editorLayout === 'editor',
              onClick: () => updateLayout('editor'),
            },
            {
              variant: 'icon',
              iconPath: mdiViewSplitVertical,
              active: editorLayout === 'split',
              onClick: () => updateLayout('split'),
            },
            {
              variant: 'icon',
              iconPath: mdiEyeOutline,
              active: editorLayout === 'preview',
              onClick: () => updateLayout('preview'),
            },
            {
              variant: 'icon',
              iconPath: !preferences.docContextIsHidden
                ? mdiChevronLeft
                : mdiChevronRight,
              onClick: () =>
                setPreferences({
                  docContextIsHidden: !preferences.docContextIsHidden,
                }),
            },
          ],
        },
        right: !preferences.docContextIsHidden ? (
          <DocContextMenu
            currentDoc={doc}
            contributors={contributors}
            backLinks={backLinks}
            team={team}
            editorRef={editorRef}
            restoreRevision={onRestoreRevisionCallback}
            revisionHistory={revisionHistory}
            presence={{ user: userInfo, users: otherUsers, editorLayout }}
            openRenameDocForm={() =>
              openRenameDocForm(doc, titleChangeCallback)
            }
            sendingRename={sendingMap.has(doc.id)}
          />
        ) : null,
      }}
    >
      <Container>
        {editorLayout !== 'preview' && (
          <StyledLayoutDimensions className={editorLayout}>
            <ToolbarRow>
              <EditorToolButton
                tooltip={`${scrollSync ? 'Disable' : 'Enable'} scroll sync`}
                path={scrollSync ? mdiRepeatOff : mdiRepeat}
                onClick={toggleScrollSync}
                className='scroll-sync'
              />
              <EditorToolbar
                editorRef={editorRef}
                team={team}
                currentDoc={doc}
              />
              <EditorToolbarUpload
                editorRef={editorRef}
                fileUploadHandlerRef={fileUploadHandlerRef}
              />
              <EditorToolButton
                tooltip='Use a template'
                path={mdiFileDocumentOutline}
                onClick={onEditorTemplateToolClick}
              />
            </ToolbarRow>
          </StyledLayoutDimensions>
        )}
        <StyledEditor className={editorLayout}>
          <StyledEditorWrapper className={`layout-${editorLayout}`}>
            <>
              <CodeMirrorEditor
                bind={bindCallback}
                config={editorConfig}
                realtime={realtime}
              />
              {editorContent === '' && (
                <EditorTemplateButton
                  onTemplatePickCallback={onTemplatePickCallback}
                />
              )}
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
          <StyledPreview className={`layout-${editorLayout}`}>
            <MarkdownView
              content={editorContent}
              updateContent={setEditorRefContent}
              headerLinks={editorLayout === 'preview'}
              onRender={onRender.current}
              className='scroller'
              embeddableDocs={embeddableDocs}
              scrollerRef={previewRef}
            />
          </StyledPreview>
        </StyledEditor>

        {editorLayout !== 'preview' && (
          <StyledBottomBar>
            <EditorSelectionStatus
              cursor={selection.currentCursor}
              selections={selection.currentSelections}
            />
            <EditorKeyMapSelect />
            <EditorThemeSelect />
            <EditorIndentationStatus />
          </StyledBottomBar>
        )}
      </Container>
    </Application>
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
  border-top: solid 1px ${({ theme }) => theme.baseBorderColor};
  height: 24px;
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  box-sizing: content-box;
  & > :first-child {
    flex: 1;
  }
`

const StyledShortcodeConvertMenu = styled.div`
  margin-top: ${({ theme }) => theme.space.xsmall}px;
  border-radius: 5px;
  box-shadow: ${({ theme }) => theme.baseShadowColor};

  button {
    display: block;
    width: 200px;
    line-height: 25px;
    padding: ${({ theme }) => theme.space.xsmall}px
      ${({ theme }) => theme.space.small}px;
    background-color: ${({ theme }) => theme.contextMenuColor};
    color: ${({ theme }) => theme.baseTextColor};
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    text-align: left;

    &:first-child {
      border-radius: 5px 5px 0 0;
    }

    &:last-child {
      border-radius: 0 0 5px 5px;
    }

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
      color: ${({ theme }) => theme.emphasizedTextColor};
      cursor: pointer;
    }
  }
`

const StyledLayoutDimensions = styled.div`
  width: 100%;
  &.preview,
  .preview {
    ${rightSidePageLayout}
    margin: ${({ theme }) => theme.space.default}px auto 0;
    height: auto;
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

const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: end;
  margin-bottom: ${({ theme }) => theme.space.xxsmall}px;
  border-bottom: solid 1px ${({ theme }) => theme.divideBorderColor};
`

const StyledEditorWrapper = styled.div`
  position: relative;
  height: auto;
  width: 50%;
  &.layout-editor {
    width: 100%;
  }
  &.layout-preview {
    display: none;
  }
`

const StyledPreview = styled.div`
  height: 100%;
  width: 50%;
  &.layout-split {
    width: 50%;
    .scroller {
      height: 100%;
      overflow: auto;
      border-left: 1px solid ${({ theme }) => theme.baseBorderColor};
    }
  }
  &.layout-preview {
    padding-top: ${({ theme }) => theme.space.small}px;
    margin: 0 auto;
    width: 100%;
  }
  &.layout-editor {
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
    padding: 0 ${({ theme }) => theme.space.xlarge}px;
  }
  & .CodeMirrorWrapper {
    height: 100%;
    word-break: break-word;
  }
  & .CodeMirror {
    width: 100%;
    height: 100%;
    position: relative;
    .CodeMirror-hints {
      position: absolute;
      z-index: 10;
      overflow: auto;
      max-width: 90%;
      max-height: 20em;
      margin: 0;
      padding: 0;
      border-radius: 3px;
      border: 1px solid ${({ theme }) => theme.baseBorderColor};
      background: ${({ theme }) => theme.baseBackgroundColor};
      color: ${({ theme }) => theme.baseTextColor};
      font-size: 90%;
      font-family: monospace;
      list-style: none;
    }
    .CodeMirror-hint {
      position: relative;
      margin: 0;
      padding: ${({ theme }) => theme.space.xxsmall}px
        ${({ theme }) => theme.space.small}px;
      white-space: pre;
      color: ${({ theme }) => theme.baseTextColor};
      cursor: pointer;
      font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
    }
    li.CodeMirror-hint-active {
      color: ${({ theme }) => theme.primaryTextColor};
      &:before {
        content: '';
        display: block;
        position: absolute;
        top: 3px;
        left: ${({ theme }) => theme.space.xsmall}px;
        width: 3px;
        height: 22px;
        background-color: ${({ theme }) => theme.primaryBackgroundColor};
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
        font-size: ${({ theme }) => theme.fontSizes.xxsmall}px;
        height: ${({ theme }) => theme.fontSizes.xxsmall + 4}px;
        line-height: ${({ theme }) => theme.fontSizes.xxsmall + 4}px;
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
    padding-bottom: ${({ theme }) => theme.space.xxxlarge}px;
  }
  & .file-loading-widget {
    transform: translate3d(0, -100%, 0);
  }
`

export default Editor

function resolveKeyMap(keyMap: CodeMirrorKeyMap) {
  switch (keyMap) {
    case 'vim':
      return 'vim'
    case 'default':
    default:
      return 'sublime'
  }
}
