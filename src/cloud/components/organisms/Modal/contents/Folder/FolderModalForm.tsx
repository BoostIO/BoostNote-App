import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../../lib/stores/modal'
import { usePage } from '../../../../../lib/stores/pageStore'
import { ModalBody, ModalContainer, ModalLabel, ModalSection } from '../styled'
import CustomButton from '../../../../atoms/buttons/CustomButton'
import { Spinner } from '../../../../atoms/Spinner'
import { Emoji } from 'emoji-mart'
import IconMdi from '../../../../atoms/IconMdi'
import { mdiFolderOutline } from '@mdi/js'
import { useEmojiPicker } from '../../../../../lib/stores/emoji'
import Tooltip from '../../../../atoms/Tooltip'
import ErrorBlock from '../../../../atoms/ErrorBlock'
import {
  StyledModalForm,
  StyledModalFormIconDiv,
  StyledModalFormFlexGrowDiv,
  StyledModalFormIconPicker,
  StyledModalFormInput,
} from '../Forms/styled'

interface FolderModalFormProps {
  parentFolderId?: string
  workspaceId?: string
  initialDescription?: string
  initialFolderName?: string
  initialEmoji?: string
  edit?: boolean
  filteredOutPathname?: string
  onSubmitHandler: (body: any) => void
}

const FolderModalForm = ({
  workspaceId,
  initialEmoji,
  initialFolderName = '',
  initialDescription = '',
  parentFolderId,
  edit = false,
  onSubmitHandler,
}: FolderModalFormProps) => {
  const [emoji, setEmoji] = useState<string | undefined>(initialEmoji)
  const [error, setError] = useState<unknown>()
  const [folderName, setFolderName] = useState<string>(initialFolderName)
  const [description] = useState<string>(initialDescription)
  const { team } = usePage()
  const [sending, setSending] = useState<boolean>(false)
  const { closeModal } = useModal()
  const { openEmojiPickerWithCallback } = useEmojiPicker()
  const formRef = React.createRef<HTMLDivElement>()

  const emojiPickerClickHandler = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      openEmojiPickerWithCallback(event, setEmoji)
    },
    [openEmojiPickerWithCallback]
  )

  const onChangeFolderNameHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFolderName(event.target.value)
    },
    [setFolderName]
  )

  const submitCreateFolder = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()

      const body = {
        folderName,
        workspaceId,
        parentFolderId,
        emoji,
        description,
      }

      setError(undefined)
      setSending(true)
      try {
        if (body.folderName.trim() === '') {
          throw Error(`Folder name has to be filled.`)
        }
        await onSubmitHandler(body)
        closeModal()
      } catch (error) {
        setError(error)
      } finally {
        setSending(false)
      }
    },
    [
      folderName,
      description,
      emoji,
      workspaceId,
      parentFolderId,
      onSubmitHandler,
      closeModal,
    ]
  )

  if (team == null) {
    return <ModalContainer>You need to select a valid team.</ModalContainer>
  }

  return (
    <ModalBody ref={formRef} tabIndex={0}>
      <StyledModalForm onSubmit={submitCreateFolder}>
        <ModalSection className='direction-row'>
          <StyledModalFormIconDiv>
            <ModalLabel>Icon</ModalLabel>
            <div className='form-icon-picker' onClick={emojiPickerClickHandler}>
              <Tooltip tooltip='Change Icon'>
                <StyledModalFormIconPicker>
                  {emoji != null ? (
                    <Emoji emoji={emoji} set='apple' size={25} />
                  ) : (
                    <IconMdi path={mdiFolderOutline} size={25} />
                  )}
                </StyledModalFormIconPicker>
              </Tooltip>
            </div>
          </StyledModalFormIconDiv>
          <StyledModalFormFlexGrowDiv>
            <ModalLabel>Name</ModalLabel>
            <StyledModalFormInput
              placeholder='Folder name'
              className='form-name-input'
              value={folderName}
              onChange={onChangeFolderNameHandler}
            />
          </StyledModalFormFlexGrowDiv>
        </ModalSection>

        {error != null && (
          <ModalSection>
            <ErrorBlock error={error} style={{ margin: 0, width: '100%' }} />
          </ModalSection>
        )}

        <ModalSection className='justify-end direction-row'>
          <CustomButton
            variant='transparent'
            className='rounded mr-2 size-l'
            onClick={closeModal}
            type='button'
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant='primary'
            className='rounded size-l'
            type='submit'
            disabled={sending}
          >
            {sending ? (
              <Spinner size={16} style={{ fontSize: 16, marginRight: 0 }} />
            ) : edit ? (
              'Save'
            ) : (
              'Create'
            )}
          </CustomButton>
        </ModalSection>
      </StyledModalForm>
    </ModalBody>
  )
}

export default FolderModalForm
