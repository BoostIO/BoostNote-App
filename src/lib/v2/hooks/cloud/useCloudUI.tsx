import { mdiFileDocumentOutline, mdiFolderOutline } from '@mdi/js'
import React, { useCallback } from 'react'
import { SerializedDoc } from '../../../../cloud/interfaces/db/doc'
import { SerializedFolder } from '../../../../cloud/interfaces/db/folder'
import EmojiInputForm from '../../../../components/v2/organisms/EmojiInputForm'
import { useModal } from '../../stores/modal'
import { useCloudUpdater } from './useCloudUpdater'

export function useCloudUI() {
  const { openModal, closeLastModal } = useModal()
  const { updateFolder, updateDocEmoji } = useCloudUpdater()

  const openRenameFolderForm = useCallback(
    (folder: SerializedFolder) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFolderOutline}
          defaultInputValue={folder.name}
          defaultEmoji={folder.emoji}
          placeholder='Folder name'
          submitButtonProps={{
            label: 'Update',
          }}
          onSubmit={async (inputValue: string, emoji?: string) => {
            await updateFolder(folder, {
              workspaceId: folder.workspaceId,
              parentFolderId: folder.parentFolderId,
              folderName: inputValue,
              emoji,
            })
            closeLastModal()
          }}
        />,
        {
          showCloseIcon: true,
          size: 'default',
          title: 'Rename folder',
        }
      )
    },
    [openModal, closeLastModal, updateFolder]
  )

  const openRenameDocForm = useCallback(
    (doc: SerializedDoc, updateTitle?: (title: string) => void) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFileDocumentOutline}
          defaultInputValue={doc.head?.title}
          defaultEmoji={doc.emoji}
          placeholder='Doc title'
          submitButtonProps={{
            label: 'Update',
          }}
          onSubmit={async (inputValue: string, emoji?: string) => {
            if (updateTitle != null) {
              await Promise.all([
                updateDocEmoji(doc, emoji),
                updateTitle(inputValue),
              ])
            } else {
              //fix backend
              await updateDocEmoji(doc, emoji)
            }
            closeLastModal()
          }}
        />,
        {
          showCloseIcon: true,
          size: 'default',
          title: 'Rename doc',
        }
      )
    },
    [openModal, closeLastModal, updateDocEmoji]
  )

  return {
    openRenameFolderForm,
    openRenameDocForm,
  }
}
