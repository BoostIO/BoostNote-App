import {
  mdiCloudOffOutline,
  mdiCloudSyncOutline,
  mdiFileDocumentOutline,
} from '@mdi/js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import LoaderDocEditor from '../../../design/components/atoms/loaders/LoaderDocEditor'
import styled from '../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedUser } from '../../interfaces/db/user'
import CodeMirrorEditor from '../../lib/editor/components/CodeMirrorEditor'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import EditorIndentationStatus from '../Editor/EditorIndentationStatus'
import EditorKeyMapSelect from '../Editor/EditorKeyMapSelect'
import EditorSelectionStatus from '../Editor/EditorSelectionStatus'
import EditorTemplateButton from '../Editor/EditorTemplateButton'
import EditorThemeSelect from '../Editor/EditorThemeSelect'
import CustomizedMarkdownPreviewer from '../MarkdownView/CustomizedMarkdownPreviewer'
import { BaseTheme } from '../../../design/lib/styled/types'
import TemplatesModal from '../Modal/contents/TemplatesModal'
import { useModal } from '../../../design/lib/stores/modal'
import EditorToolbar from '../Editor/EditorToolbar'
import EditorToolbarUpload from '../Editor/EditorToolbarUpload'
import EditorToolButton from '../Editor/EditorToolButton'
import cc from 'classcat'
import WithTooltip from '../../../design/components/atoms/WithTooltip'
import { useEffectOnUnmount } from '../../../lib/hooks'
import { useDocEditor } from '../../lib/hooks/editor/docEditor'
import { SerializedSubscription } from '../../interfaces/db/subscription'

interface DocPreviewRealtimeProps {
  team: SerializedTeam
  subscription?: SerializedSubscription
  doc: SerializedDocWithSupplemental
  token: string
  mode?: 'preview' | 'editor'
  user?: SerializedUser
  setRenderHeader: React.Dispatch<React.SetStateAction<() => React.ReactNode>>
}

const DocPreviewRealtime = ({
  mode,
  team,
  doc,
  token,
  user,
  subscription,
  setRenderHeader,
}: DocPreviewRealtimeProps) => {
  const [loaded, setLoaded] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const [_timedOut, setTimedOut] = useState(false)
  const { translate } = useI18n()
  const { openModal } = useModal()

  const {
    selection,
    connState,
    editorContent,
    realtime,
    editorRef,
    editorConfig,
    shortcodeConvertMenu,
    shortcodeConvertMenuStyle,
    fontFamily,
    fontSize,
    showEditorToolbar,
    getEmbed,
    setEditorRefContent,
    bindCallback,
    handleYTextChange,
    onTemplatePickCallback,
    fileUploadHandlerRef,
  } = useDocEditor({
    user,
    team,
    doc,
    collaborationToken: token,
    subscription,
  })

  const onEditorTemplateToolClick = useCallback(() => {
    openModal(<TemplatesModal callback={onTemplatePickCallback} />, {
      width: 'large',
      keepAll: true,
    })
  }, [openModal, onTemplatePickCallback])

  useEffect(() => {
    if (connState === 'connected') {
      setTimedOut(false)
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current)
      }
    }

    if (
      (connState === 'reconnecting' || connState === 'disconnected') &&
      timeoutRef.current == null
    ) {
      timeoutRef.current = window.setTimeout(() => {
        setTimedOut(true)
      }, 30000)
    }

    if (connState === 'synced') {
      setLoaded(true)
    }
  }, [connState])

  useEffect(() => {
    if (mode === 'preview') {
      return
    }

    if (editorRef.current != null) {
      editorRef.current.focus()
    }
  }, [mode, editorRef])

  useEffect(() => {
    if (editorRef.current != null) {
      editorRef.current.refresh()
    }
  }, [mode, editorRef])

  useEffect(() => {
    switch (connState) {
      case 'disconnected':
        setRenderHeader(() => (
          <WithTooltip
            tooltip={
              <>
                {translate(lngKeys.EditorReconnectDisconnected1)}
                <br />
                {translate(lngKeys.EditorReconnectDisconnected2)}
              </>
            }
          >
            <Button
              iconPath={mdiCloudOffOutline}
              variant='danger'
              onClick={() => realtime.connect()}
            >
              {translate(lngKeys.EditorReconnectDisconnected)}
            </Button>
          </WithTooltip>
        ))
        break
      case 'reconnecting':
        setRenderHeader(() => (
          <WithTooltip
            tooltip={
              <>
                {translate(lngKeys.EditorReconnectAttempt1)}
                <br />
                {translate(lngKeys.EditorReconnectAttempt2)}
              </>
            }
          >
            <Button
              iconPath={mdiCloudSyncOutline}
              variant='danger'
              disabled={true}
            >
              {translate(lngKeys.EditorReconnectAttempt)}
            </Button>
          </WithTooltip>
        ))
        break
      case 'loaded':
        setRenderHeader(() => (
          <WithTooltip
            tooltip={
              <>
                {translate(lngKeys.EditorReconnectSyncing1)}
                <br />
                {translate(lngKeys.EditorReconnectSyncing2)}
              </>
            }
          >
            <Button variant='secondary' disabled={true}>
              {translate(lngKeys.EditorReconnectSyncing)}
            </Button>
          </WithTooltip>
        ))
        break
      default:
        setRenderHeader(() => null)
        break
    }
  }, [connState, translate, setRenderHeader, realtime])

  useEffectOnUnmount(() => {
    setRenderHeader(() => null)
  })

  if (!loaded) {
    return (
      <Flexbox>
        <LoaderDocEditor />
      </Flexbox>
    )
  }

  return (
    <>
      <Container>
        {mode !== 'preview' && showEditorToolbar && (
          <StyledLayoutDimensions className={mode}>
            <ToolbarRow>
              <EditorToolbar editorRef={editorRef} />
              <EditorToolbarUpload
                editorRef={editorRef}
                fileUploadHandlerRef={fileUploadHandlerRef}
              />
              <EditorToolButton
                tooltip={translate(lngKeys.EditorToolbarTooltipTemplate)}
                path={mdiFileDocumentOutline}
                onClick={onEditorTemplateToolClick}
              />
            </ToolbarRow>
          </StyledLayoutDimensions>
        )}
        <StyledEditor className={cc([mode, 'doc-preview__editor'])}>
          <StyledEditorWrapper
            className={`layout-${mode}`}
            fontFamily={fontFamily}
            fontSize={fontSize}
          >
            <>
              <CodeMirrorEditor
                bind={bindCallback}
                config={editorConfig}
                realtime={realtime}
                onYTextChange={handleYTextChange}
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
          <StyledPreview className={`layout-${mode}`}>
            <CustomizedMarkdownPreviewer
              content={editorContent}
              updateContent={setEditorRefContent}
              headerLinks={mode === 'preview'}
              className='doc-preview__content__scroller'
              getEmbed={getEmbed}
            />
          </StyledPreview>
        </StyledEditor>
      </Container>
      {mode !== 'preview' && (
        <StyledBottomBar className='doc-preview__toolbar'>
          <EditorSelectionStatus
            cursor={selection.currentCursor}
            selections={selection.currentSelections}
          />
          <EditorKeyMapSelect />
          <EditorThemeSelect />
          <EditorIndentationStatus />
        </StyledBottomBar>
      )}
    </>
  )
}

export default DocPreviewRealtime

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 10px;
  width: 100%;
`

const StyledShortcodeConvertMenu = styled.div`
  margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
  border-radius: 5px;
  box-shadow: ${({ theme }) => theme.colors.shadow};

  button {
    display: block;
    width: 200px;
    line-height: 25px;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
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
      background-color: ${({ theme }) => theme.colors.background.tertiary};
      opacity: 0.8;
      cursor: pointer;
    }
  }
`

const StyledLayoutDimensions = styled.div`
  width: 100%;
  &.preview,
  .preview {
    width: 100%;
    height: auto;
  }
`

const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  position: absolute;
  bottom: ${({ theme }) => theme.sizes.spaces.l}px;
  right: 0;
  left: 0;
  margin: auto;
  z-index: 1;
  width: fit-content;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: solid 1px ${({ theme }) => theme.colors.border.second};
  border-radius: 5px;
`
interface FontOptionsProps {
  fontSize: string
  fontFamily: string
}
const StyledEditorWrapper = styled.div<BaseTheme & FontOptionsProps>`
  position: relative;
  height: auto;
  width: 50%;
  &.layout-editor {
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
  &.layout-editor {
    display: none;
  }

  & .inline-comment.active,
  .inline-comment.hv-active {
    background-color: rgba(112, 84, 0, 0.8);
  }
`

const StyledEditor = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  position: relative;
  top: 0;
  bottom: 0;
  width: 100%;
  height: auto;
  min-height: 0;
  font-size: 15px;
  & .CodeMirrorWrapper {
    height: 100%;
    word-break: break-word;
  }
  & .CodeMirror {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 0 !important;
    line-height: 1.4em;
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
      font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
    }
    li.CodeMirror-hint-active {
      color: ${({ theme }) => theme.colors.variants.primary.base};
      &:before {
        content: '';
        display: block;
        position: absolute;
        top: 3px;
        left: ${({ theme }) => theme.sizes.spaces.xsm}px;
        width: 3px;
        height: 22px;
        background-color: ${({ theme }) => theme.colors.variants.primary.base};
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
    width: 100%;
  }
  .CodeMirror-code,
  .CodeMirror-gutters {
    padding-bottom: 32px;
  }
  & .file-loading-widget {
    transform: translate3d(0, -100%, 0);
  }
`
