import { mdiFileDocumentOutline, mdiFolderOutline } from '@mdi/js'
import React, { useCallback } from 'react'
import { FormRowProps } from '../../../components/v2/molecules/Form'
import EmojiInputForm from '../../../components/v2/organisms/EmojiInputForm'
import { DialogIconTypes, useDialog } from '../../../shared/lib/stores/dialog'
import { useModal } from '../../../shared/lib/stores/modal'
import { PromiseWrapperCallbacks } from '../../../shared/lib/types'
import EditWorkspaceModal from '../../components/organisms/Modal/contents/Workspace/EditWorkspaceModal'
import { SerializedDoc } from '../../interfaces/db/doc'
import { SerializedFolder } from '../../interfaces/db/folder'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { useCloudUpdater } from './useCloudUpdater'

export function useCloudUI() {
  const { openModal, closeLastModal } = useModal()
  const { messageBox } = useDialog()
  const {
    updateFolder,
    updateDocEmoji,
    createFolder,
    createDoc,
    deleteWorkspaceApi,
    deleteFolderApi,
    deleteDocApi,
    toggleDocArchive,
  } = useCloudUpdater()

  const openWorkspaceEditForm = useCallback(
    (wp: SerializedWorkspace) => {
      openModal(<EditWorkspaceModal workspace={wp} />)
    },
    [openModal]
  )

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
      body: CloudNewResourceRequestBody,
      sending?: PromiseWrapperCallbacks,
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
      body: CloudNewResourceRequestBody,
      sending?: PromiseWrapperCallbacks,
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

  const deleteWorkspace = useCallback(
    async (workspace: { id: string; teamId: string; default: boolean }) => {
      if (workspace.default) {
        return
      }
      messageBox({
        title: `Delete the workspace?`,
        message: `Are you sure to delete this workspace? You will not be able to revert this action.`,
        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Destroy All',
            onClick: async () => await deleteWorkspaceApi(workspace),
          },
        ],
      })
    },
    [messageBox, deleteWorkspaceApi]
  )

  const deleteFolder = useCallback(
    async (target: { id: string; pathname: string; teamId: string }) => {
      messageBox({
        title: `Delete ${target.pathname}`,
        message: `Are you sure to remove this folder and delete completely its notes`,
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
              await deleteFolderApi(target)
            },
          },
        ],
      })
    },
    [messageBox, deleteFolderApi]
  )

  const deleteOrArchiveDoc = useCallback(
    async (
      target: { id: string; archivedAt?: string; teamId: string },
      title = 'this document'
    ) => {
      if (target.archivedAt == null) {
        return messageBox({
          title: `Archive ${title}`,
          message: `Are you sure to archive this content?`,
          iconType: DialogIconTypes.Warning,
          buttons: [
            {
              variant: 'secondary',
              label: 'Cancel',
              cancelButton: true,
              defaultButton: true,
            },
            {
              variant: 'warning',
              label: 'archive',
              onClick: async () => {
                await toggleDocArchive(
                  target.teamId,
                  target.id,
                  target.archivedAt
                )
              },
            },
          ],
        })
      }
      messageBox({
        title: `Delete ${title}`,
        message: `Are you sure to remove for good this content?`,
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
              await deleteDocApi(target)
            },
          },
        ],
      })
    },
    [messageBox, deleteDocApi, toggleDocArchive]
  )

  return {
    openWorkspaceEditForm,
    openNewDocForm,
    openNewFolderForm,
    openRenameFolderForm,
    openRenameDocForm,
    deleteFolder,
    deleteWorkspace,
    deleteOrArchiveDoc,
  }
}

export interface CloudNewResourceRequestBody {
  team?: SerializedTeam
  workspaceId?: string
  parentFolderId?: string
}
