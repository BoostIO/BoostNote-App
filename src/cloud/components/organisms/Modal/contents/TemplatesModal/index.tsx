import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { ModalContainer } from '../styled'
import { useNav } from '../../../../../lib/stores/nav'
import { usePage } from '../../../../../lib/stores/pageStore'
import styled from '../../../../../lib/styled'
import {
  inputStyle,
  baseIconStyle,
} from '../../../../../lib/styled/styleFunctions'
import {
  isFocusLeftSideShortcut,
  isFocusRightSideShortcut,
} from '../../../../../lib/shortcuts'
import {
  preventKeyboardEventPropagation,
  useCapturingGlobalKeyDownHandler,
  useUpDownNavigationListener,
} from '../../../../../lib/keyboard'
import { focusFirstChildFromElement } from '../../../../../lib/dom'
import Spinner from '../../../../atoms/CustomSpinner'
import { getHexFromUUID } from '../../../../../lib/utils/string'
import CustomButton from '../../../../atoms/buttons/CustomButton'
import { trackEvent } from '../../../../../api/track'
import { MixpanelActionTrackTypes } from '../../../../../interfaces/analytics/mixpanel'
import { SerializedTemplate } from '../../../../../interfaces/db/template'
import Flexbox from '../../../../atoms/Flexbox'
import ClickableListItem from '../../../../molecules/ClickableListItem'
import EditableInput from '../../../../atoms/EditableInput'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../../../shared/lib/stores/dialog'
import {
  destroyDocTemplate,
  updateTemplate,
} from '../../../../../api/teams/docs/templates'
import {
  mdiTrashCanOutline,
  mdiFileDocumentOutline,
  mdiClose,
  mdiContentSaveOutline,
} from '@mdi/js'
import Icon from '../../../../atoms/Icon'
import EmojiIcon from '../../../../atoms/EmojiIcon'
import { useSettings } from '../../../../../lib/stores/settings'
import cc from 'classcat'
import { useEmojiPicker } from '../../../../../lib/stores/emoji'
import Tooltip from '../../../../atoms/Tooltip'
import CodeMirrorEditor from '../../../../../lib/editor/components/CodeMirrorEditor'
import MarkdownView from '../../../../atoms/MarkdownView'
import { useToast } from '../../../../../../shared/lib/stores/toast'
import { useModal } from '../../../../../../shared/lib/stores/modal'
import Switch from '../../../../../../shared/components/atoms/Switch'

interface TemplatesModalProps {
  callback?: (template: SerializedTemplate) => void
}

const TemplatesModal = ({ callback }: TemplatesModalProps) => {
  const { team } = usePage()
  const {
    templatesMap,
    removeFromTemplatesMap,
    updateTemplatesMap,
    currentWorkspaceId,
    createDocHandler,
    currentParentFolderId,
  } = useNav()
  const { pushApiErrorMessage } = useToast()
  const contentSideRef = React.createRef<HTMLDivElement>()
  const menuRef = React.createRef<HTMLDivElement>()
  const [filter, setFilter] = useState<string>('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>()
  const [templateTitle, setTemplateTitle] = useState<string>('')
  const [templateContent, setTemplateContent] = useState<string>('')
  const [initialContent, setInitialContent] = useState<string>()
  const [emoji, setEmoji] = useState<string>()
  const [inPreview, setInPreview] = useState(true)
  const [sendingState, setSendingState] = useState<
    'delete' | 'update' | 'newDoc'
  >()
  const { messageBox } = useDialog()
  const { closeLastModal: closeModal } = useModal()
  const { settings } = useSettings()
  const editorRef = useRef<CodeMirror.Editor | null>(null)
  const { openEmojiPickerWithCallback } = useEmojiPicker()

  useEffect(() => {
    if (selectedTemplateId == null || templatesMap.has(selectedTemplateId)) {
      return
    }

    setSelectedTemplateId(undefined)
    setTemplateTitle('')
    setTemplateContent('')
  }, [selectedTemplateId, templatesMap])

  const editorConfig: CodeMirror.EditorConfiguration = useMemo(() => {
    const editorTheme = settings['general.editorTheme']
    const theme =
      editorTheme == null || editorTheme === 'default'
        ? settings['general.theme'] === 'light'
          ? 'default'
          : 'material-darker'
        : editorTheme
    const keyMap = settings['general.editorKeyMap'] || 'default'

    return {
      mode: 'markdown',
      lineNumbers: true,
      lineWrapping: true,
      theme,
      indentWithTabs: false,
      indentUnit: 2,
      tabSize: 2,
      keyMap,
    }
  }, [settings])

  const selectTemplate = useCallback((template: SerializedTemplate) => {
    setSelectedTemplateId(template.id)
    setTemplateTitle(template.title)
    setTemplateContent(template.content)
    setEmoji(template.emoji)
    setInPreview(true)
  }, [])

  const toggleMode = useCallback(() => {
    setInPreview((prev) => {
      if (prev) {
        setInitialContent(templateContent)
      }
      return !prev
    })
  }, [templateContent])

  const onFilterChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value)
    },
    [setFilter]
  )

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (closed) {
        return
      }
      if (isFocusLeftSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(menuRef.current)
        return
      }

      if (isFocusRightSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(contentSideRef.current)
        return
      }
    }
  }, [menuRef, contentSideRef])
  useCapturingGlobalKeyDownHandler(keydownHandler)
  useUpDownNavigationListener(menuRef, { inactive: closed })

  const filteredTemplates = useMemo(() => {
    const templates = [...templatesMap.values()]
    if (filter === '') {
      return sortByTitleASC(templates)
    }

    return sortByTitleASC(
      templates.filter((template) => {
        return template.title.includes(filter)
      })
    )
  }, [filter, templatesMap])

  const selectedTemplate = useMemo(() => {
    if (selectedTemplateId == null || !templatesMap.has(selectedTemplateId)) {
      return undefined
    }

    return templatesMap.get(selectedTemplateId) as SerializedTemplate
  }, [templatesMap, selectedTemplateId])

  const useTemplateCallback = useCallback(() => {
    if (selectedTemplate == null) {
      return
    }

    setSendingState('newDoc')
    try {
      createDocHandler({
        workspaceId: currentWorkspaceId,
        parentFolderId: currentParentFolderId,
        template: selectedTemplate.id.toString(),
      })
      trackEvent(MixpanelActionTrackTypes.TemplateUse, {
        workspaceId: currentWorkspaceId,
        parentFolderId: currentParentFolderId,
        template: selectedTemplate.id.toString(),
      })
      closeModal()
    } catch (error) {
      if (error.response.data.includes('exceeds the free tier')) {
        return
      }

      pushApiErrorMessage(error)
      setSendingState(undefined)
    }
  }, [
    currentParentFolderId,
    currentWorkspaceId,
    createDocHandler,
    closeModal,
    selectedTemplate,
    pushApiErrorMessage,
  ])

  const deleteTemplate = useCallback(
    (template: SerializedTemplate) => {
      messageBox({
        title: `Delete template?`,
        message: `Are you sure to delete ${
          template.title.trim() !== '' ? template.title : 'this template'
        }?`,
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Delete',
            onClick: async () => {
              //remove
              setSendingState('delete')
              try {
                await destroyDocTemplate(template.id)
                removeFromTemplatesMap(template.id)
              } catch (error) {
                pushApiErrorMessage(error)
              }
              setSendingState(undefined)
              return
            },
          },
        ],
      })
    },
    [messageBox, pushApiErrorMessage, removeFromTemplatesMap]
  )

  const saveTemplate = useCallback(async () => {
    if (sendingState != null || selectedTemplateId == null) {
      return
    }

    setSendingState('update')
    try {
      const { template } = await updateTemplate(selectedTemplateId, {
        content: templateContent,
        title: templateTitle,
        emoji,
      })
      updateTemplatesMap([template.id, template])
    } catch (error) {
      pushApiErrorMessage(error)
    }
    setSendingState(undefined)
  }, [
    sendingState,
    templateContent,
    templateTitle,
    emoji,
    selectedTemplateId,
    updateTemplatesMap,
    pushApiErrorMessage,
  ])

  const bindCallback = useCallback((editor: CodeMirror.Editor) => {
    setTemplateContent(editor.getValue())
    editorRef.current = editor
    editor.on('change', (instance) => {
      setTemplateContent(instance.getValue())
    })
  }, [])

  const emojiPickerClickHandler = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      openEmojiPickerWithCallback(event, setEmoji)
    },
    [openEmojiPickerWithCallback]
  )

  const changesAreUnsaved =
    selectedTemplate != null &&
    (selectedTemplate.title !== templateTitle ||
      selectedTemplate.content !== templateContent ||
      selectedTemplate.emoji !== emoji)

  if (team == null) {
    return <ModalContainer>You need to select a valid team.</ModalContainer>
  }

  return (
    <ModalContainer style={{ padding: 0 }}>
      <StyledTemplatesModal>
        <div className='list' ref={menuRef}>
          <h5>Templates</h5>
          <input
            value={filter}
            onChange={onFilterChangeHandler}
            placeholder='Search templates'
          />
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <ClickableListItem
                key={template.id}
                label={
                  <Flexbox>
                    <EmojiIcon
                      defaultIcon={mdiFileDocumentOutline}
                      emoji={template.emoji}
                      size={16}
                    />
                    {template.title}
                  </Flexbox>
                }
                onClick={() => selectTemplate(template)}
                id={`template-${getHexFromUUID(template.id)}`}
                className={selectedTemplateId === template.id ? 'active' : ''}
              />
            ))
          ) : (
            <small>Could not find any templates</small>
          )}
        </div>
        <div className='content' ref={contentSideRef}>
          {selectedTemplate == null ? (
            <Flexbox
              direction='column'
              style={{ height: '100%' }}
              alignItems='baseline'
            >
              <div className='topbar'>
                <Flexbox justifyContent='flex-end' flex='1 1 auto'>
                  <button className='smallButton' onClick={closeModal}>
                    <Icon path={mdiClose} />
                  </button>
                </Flexbox>
              </div>
              <div className='scroll preview'>
                <div className='preview'>
                  <p>Select a template</p>
                </div>
              </div>
            </Flexbox>
          ) : (
            <Flexbox
              direction='column'
              style={{ height: '100%' }}
              alignItems='baseline'
            >
              <div className='topbar'>
                <Flexbox flex='1 1 0'>
                  <Tooltip tooltip='Change icon'>
                    <EmojiIcon
                      defaultIcon={mdiFileDocumentOutline}
                      emoji={emoji}
                      size={18}
                      onClick={emojiPickerClickHandler}
                    />
                  </Tooltip>
                  <EditableInput
                    placeholder='Template title...'
                    text={templateTitle}
                    onTextChange={setTemplateTitle}
                  />
                </Flexbox>
                <Flexbox flex='0 0 auto'>
                  <Switch
                    className='switch'
                    checked={!inPreview}
                    width={50}
                    height={20}
                    onChange={toggleMode}
                  />
                  <button
                    className='smallButton'
                    disabled={sendingState != null}
                    onClick={() => deleteTemplate(selectedTemplate)}
                  >
                    {sendingState === 'delete' ? (
                      <Spinner style={{ width: 16, height: 16 }} />
                    ) : (
                      <Icon path={mdiTrashCanOutline} />
                    )}
                  </button>
                  <div className='separator' />
                  {changesAreUnsaved ? (
                    <CustomButton
                      variant='primary'
                      onClick={saveTemplate}
                      disabled={sendingState != null}
                    >
                      {sendingState === 'update' ? (
                        <Spinner className='emphasized' />
                      ) : (
                        <Flexbox>
                          <Icon path={mdiContentSaveOutline} size={18} />
                          <span>Save</span>
                        </Flexbox>
                      )}
                    </CustomButton>
                  ) : callback == null ? (
                    <CustomButton
                      variant='primary'
                      onClick={useTemplateCallback}
                      disabled={sendingState != null}
                      style={{ marginLeft: '10px' }}
                    >
                      {sendingState === 'newDoc' ? (
                        <Spinner className='emphasized' />
                      ) : (
                        <span>Use template</span>
                      )}
                    </CustomButton>
                  ) : (
                    <CustomButton
                      variant='primary'
                      onClick={(e) => {
                        e.preventDefault()
                        callback(selectedTemplate)
                        trackEvent(MixpanelActionTrackTypes.TemplateUse, {
                          template: selectedTemplate.id.toString(),
                        })
                        closeModal()
                      }}
                    >
                      <span>Use in your doc</span>
                    </CustomButton>
                  )}
                  <button className='smallButton' onClick={closeModal}>
                    <Icon path={mdiClose} />
                  </button>
                </Flexbox>
              </div>
              <div className={cc(['scroll', inPreview && 'preview'])}>
                <div className='preview'>
                  <MarkdownView content={templateContent} headerLinks={false} />
                </div>
                {!inPreview && (
                  <CodeMirrorEditor
                    config={{ ...editorConfig, value: initialContent }}
                    bind={bindCallback}
                  />
                )}
              </div>
            </Flexbox>
          )}
        </div>
      </StyledTemplatesModal>
    </ModalContainer>
  )
}

const StyledTemplatesModal = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

  .list {
    width: 250px;
    height: 100%;
    padding: ${({ theme }) => theme.space.default}px;
    border: 0;
    border-right: 1px solid ${({ theme }) => theme.baseBorderColor};

    input {
      ${inputStyle}
      padding-left: ${({ theme }) => theme.space.small}px;
      height: 30px;
      width: 100%;
      margin-bottom: ${({ theme }) => theme.space.small}px;
    }

    .sideNavItemStyle {
      padding-left: ${({ theme }) => theme.space.xxsmall}px;
      .emoji-mart-emoji {
        display: flex !important;
      }
    }


    h3 {
      margin: 0;
    }
  }

  .separator {
    width: 1px;
    height: 30px;
    background: ${({ theme }) => theme.subtleBackgroundColor};
    margin: 0 ${({ theme }) => theme.space.xsmall}px;
  }

  .content {
    position: relative;
    width: 100%;
    height: 100%;
    border: 0;
    outline: 0;
    resize: none;
    background: none;
    padding: 0;
    color: ${({ theme }) => theme.emphasizedTextColor};
    font-size: ${({ theme }) => theme.fontSizes.default}px;
    display: block;

    .CodeMirrorWrapper,
    .CodeMirror {
      height: 100%;
    }

    .btn-primary {
      height: 30px;
      line-height: 30px;
      font-size: ${({ theme }) => theme.fontSizes.small}px;

      svg + span {
        padding-left: ${({ theme }) => theme.space.xsmall}px;
      }
    }

    .scroll {
      flex: 1 1 auto;
      height: 400px;
      overflow: auto;
      width: 100%;

      .preview {
        display: none;
        padding: ${({ theme }) => theme.space.default}px
        ${({ theme }) => theme.space.large}px
        ${({ theme }) => theme.space.large}px;
      }

      &.preview {
        .preview {
          display: block;
        }
        .CodeMirrorWrapper {
          display: none;
        }
      }
    }

    .switch {
      .react-switch-bg {
        padding: 0 3px;

        svg {
          color: ${({ theme }) => theme.whiteTextColor};
        }

        > div {
          line-height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .topbar {
      display: flex;
      flex: 0 0 auto;
      width: 100%;
      height: 44px;
      background: ${({ theme }) => theme.baseBackgroundColor};
      border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
      align-items: center;
      justify-content: space-between;
      min-width: 0;
      font-size: ${({ theme }) => theme.fontSizes.small}px !important;
      flex: 0 0 auto;
      padding-left: ${({ theme }) => theme.space.small}px;

      & > div {
        height: 100%
      }

      .smallButton {
        ${baseIconStyle}
        display: flex;
        flex: 0 0 auto;
        line-height: 18px;
        background: none;
        border: 0;
        cursor: pointer;
        font-size: ${({ theme }) => theme.fontSizes.xxlarge}px;
        margin-left: ${({ theme }) => theme.space.xsmall}px;
        flex: 0 0 auto;
        min-width: 0;

        span {
          font-size: ${({ theme }) => theme.fontSizes.default}px;
        }
      }
    }
  }
`

function sortByTitleASC(templates: SerializedTemplate[]) {
  return templates.sort((a, b) => {
    if (a.title < b.title) {
      return 1
    } else {
      return -1
    }
  })
}

export default TemplatesModal
