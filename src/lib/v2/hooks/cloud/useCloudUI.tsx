import { mdiFileDocumentOutline, mdiFolderOutline } from '@mdi/js'
import React, { useCallback } from 'react'
import { SerializedDoc } from '../../../../cloud/interfaces/db/doc'
import { SerializedFolder } from '../../../../cloud/interfaces/db/folder'
import { SerializedTeam } from '../../../../cloud/interfaces/db/team'
import { FormRowProps } from '../../../../components/v2/molecules/Form'
import EmojiInputForm from '../../../../components/v2/organisms/EmojiInputForm'
import { useModal } from '../../stores/modal'
import { useCloudUpdater } from './useCloudUpdater'

export function useCloudUI() {
  const { openModal, closeLastModal } = useModal()
  const {
    updateFolder,
    updateDocEmoji,
    createFolder,
    createDoc,
  } = useCloudUpdater()

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
          inputIsDisabled={updateTitle == null}
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

  const openNewFolderForm = useCallback(
    (
      body: {
        team?: SerializedTeam
        workspaceId?: string
        parentFolderId?: string
      },
      sending?: {
        before: () => void
        after: () => void
      },
      prevRows?: FormRowProps[]
    ) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFolderOutline}
          placeholder='Folder name'
          submitButtonProps={{
            label: 'Create',
          }}
          prevRows={prevRows}
          onSubmit={async (inputValue: string, emoji?: string) => {
            if (body.team == null || body.workspaceId == null) {
              return
            }

            if (sending != null) {
              sending.before()
            }
            await createFolder(
              body.team,
              {
                workspaceId: body.workspaceId,
                parentFolderId: body.parentFolderId,
                folderName: inputValue,
                description: '',
                emoji,
              },
              closeLastModal
            )
            if (sending != null) {
              sending.after()
            }
          }}
        />,
        {
          showCloseIcon: true,
          size: 'default',
          title: 'Create new folder',
        }
      )
    },
    [openModal, closeLastModal, createFolder]
  )

  const openNewDocForm = useCallback(
    (
      body: {
        team?: SerializedTeam
        workspaceId?: string
        parentFolderId?: string
      },
      sending?: {
        before: () => void
        after: () => void
      },
      prevRows?: FormRowProps[]
    ) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFileDocumentOutline}
          placeholder='Doc title'
          submitButtonProps={{
            label: 'Create',
          }}
          prevRows={prevRows}
          onSubmit={async (inputValue: string, emoji?: string) => {
            if (body.team == null || body.workspaceId == null) {
              return
            }

            if (sending != null) {
              sending.before()
            }
            await createDoc(
              body.team,
              {
                workspaceId: body.workspaceId,
                parentFolderId: body.parentFolderId,
                title: inputValue,
                emoji,
              },
              closeLastModal
            )
            if (sending != null) {
              sending.after()
            }
          }}
        />,
        {
          showCloseIcon: true,
          size: 'default',
          title: 'Create new doc',
        }
      )
    },
    [openModal, closeLastModal, createDoc]
  )

  return {
    openNewDocForm,
    openNewFolderForm,
    openRenameFolderForm,
    openRenameDocForm,
  }
}
