import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { ModalContainer } from '../styled'
import { useNav } from '../../../../../lib/stores/nav'
import { usePage } from '../../../../../lib/stores/pageStore'
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
import { capitalize, getHexFromUUID } from '../../../../../lib/utils/string'
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
import Tooltip from '../../../../atoms/Tooltip'
import CodeMirrorEditor from '../../../../../lib/editor/components/CodeMirrorEditor'
import MarkdownView from '../../../../atoms/MarkdownView'
import { useToast } from '../../../../../../shared/lib/stores/toast'
import { useModal } from '../../../../../../shared/lib/stores/modal'
import Switch from '../../../../../../shared/components/atoms/Switch'
import { useEmoji } from '../../../../../../shared/lib/stores/emoji'
import { useI18n } from '../../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../../lib/i18n/types'
import Button, {
  LoadingButton,
} from '../../../../../../shared/components/atoms/Button'
import FormInput from '../../../../../../shared/components/molecules/Form/atoms/FormInput'
import styled from '../../../../../../shared/lib/styled'

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
  const { openEmojiPicker } = useEmoji()
  const { translate } = useI18n()

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
        title: `${translate(lngKeys.GeneralDelete)}${
          template.title.trim() !== '' ? `: ${template.title}` : ''
        }`,
        message: translate(lngKeys.ModalsTemplatesDeleteDisclaimer),
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: translate(lngKeys.GeneralCancel),
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: translate(lngKeys.GeneralUpdate),
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
    [messageBox, pushApiErrorMessage, removeFromTemplatesMap, translate]
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
      openEmojiPicker(event, setEmoji)
    },
    [openEmojiPicker]
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
          <h5>{capitalize(translate(lngKeys.GeneralTemplates))}</h5>
          <FormInput
            value={filter}
            onChange={onFilterChangeHandler}
            placeholder={capitalize(translate(lngKeys.GeneralSearchVerb))}
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
            <small>{translate(lngKeys.ModalsTemplatesSearchEmpty)}</small>
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
                  <Button
                    variant='icon'
                    iconPath={mdiClose}
                    className='smallButton'
                    onClick={closeModal}
                  />
                </Flexbox>
              </div>
              <div className='scroll preview'>
                <div className='preview'>
                  <p>{translate(lngKeys.ModalsTemplatesSelectTemplate)}</p>
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
                  <Tooltip tooltip={translate(lngKeys.GeneralChangeIcon)}>
                    <EmojiIcon
                      defaultIcon={mdiFileDocumentOutline}
                      emoji={emoji}
                      size={18}
                      onClick={emojiPickerClickHandler}
                    />
                  </Tooltip>
                  <EditableInput
                    placeholder={translate(lngKeys.GeneralTitle)}
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
                  />{' '}
                  <LoadingButton
                    spinning={sendingState === 'delete'}
                    variant='icon'
                    iconPath={mdiTrashCanOutline}
                    className='smallButton'
                    disabled={sendingState != null}
                    onClick={() => deleteTemplate(selectedTemplate)}
                  />
                  <div className='separator' />
                  {changesAreUnsaved ? (
                    <LoadingButton
                      spinning={sendingState === 'update'}
                      variant='primary'
                      onClick={saveTemplate}
                      disabled={sendingState != null}
                    >
                      <Flexbox>
                        <Icon path={mdiContentSaveOutline} size={18} />
                        <span style={{ paddingLeft: 4 }}>
                          {translate(lngKeys.GeneralSaveVerb)}
                        </span>
                      </Flexbox>
                    </LoadingButton>
                  ) : callback == null ? (
                    <LoadingButton
                      spinning={sendingState === 'newDoc'}
                      variant='primary'
                      onClick={useTemplateCallback}
                      disabled={sendingState != null}
                    >
                      <span>{translate(lngKeys.GeneralUse)}</span>
                    </LoadingButton>
                  ) : (
                    <Button
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
                      <span>{translate(lngKeys.ModalsTemplatesUseInDoc)}</span>
                    </Button>
                  )}
                  <Button
                    variant='icon'
                    iconPath={mdiClose}
                    className='smallButton'
                    onClick={closeModal}
                  />
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
  h5 {
    margin-top: 0;
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
  }

  .list {
    width: 250px;
    height: 100%;
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
    border: 0;
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};

    input {
      margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    .sideNavItemStyle {
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
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
    background: ${({ theme }) => theme.colors.border.second};
    margin: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
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
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    display: block;

    .CodeMirrorWrapper,
    .CodeMirror {
      height: 100%;
    }

    .btn-primary {
      svg + span {
        padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
      }
    }

    .scroll {
      flex: 1 1 auto;
      height: 400px;
      overflow: auto;
      width: 100%;

      .preview {
        display: none;
        padding: ${({ theme }) => theme.sizes.spaces.df}px
          ${({ theme }) => theme.sizes.spaces.l}px
          ${({ theme }) => theme.sizes.spaces.l}px;
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

    .topbar {
      display: flex;
      flex: 0 0 auto;
      width: 100%;
      height: 44px;
      background: ${({ theme }) => theme.colors.background.primary};
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
      align-items: center;
      justify-content: space-between;
      min-width: 0;
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px !important;
      flex: 0 0 auto;
      padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;

      & > div {
        height: 100%;
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
