import { mdiFileDocumentOutline, mdiFolderOutline } from '@mdi/js'
import React, { useCallback } from 'react'
import { FormRowProps } from '../../../shared/components/molecules/Form/layouts/FormRow'
import EmojiInputForm from '../../../shared/components/organisms/EmojiInputForm'
import { DialogIconTypes, useDialog } from '../../../shared/lib/stores/dialog'
import { useModal } from '../../../shared/lib/stores/modal'
import { SubmissionWrappers } from '../../../shared/lib/types'
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
    updateDoc,
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
          title: 'Rename folder',
        }
      )
    },
    [openModal, closeLastModal, updateFolder]
  )

  const openRenameDocForm = useCallback(
    (doc: SerializedDoc) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFileDocumentOutline}
          defaultInputValue={doc.title}
          defaultEmoji={doc.emoji}
          placeholder='Doc title'
          submitButtonProps={{
            label: 'Update',
          }}
          onSubmit={async (inputValue: string, emoji?: string) => {
            await updateDoc(doc, {
              workspaceId: doc.workspaceId,
              parentFolderId: doc.parentFolderId,
              title: inputValue,
              emoji: emoji == null ? null : emoji,
            })
            closeLastModal()
          }}
        />,
        {
          showCloseIcon: true,
          title: 'Rename doc',
        }
      )
    },
    [openModal, closeLastModal, updateDoc]
  )

  const openNewFolderForm = useCallback(
    (body: CloudNewResourceRequestBody, options?: UIFormOptions) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFolderOutline}
          placeholder='Folder name'
          submitButtonProps={{
            label: 'Create',
          }}
          prevRows={options?.precedingRows}
          onSubmit={async (inputValue: string, emoji?: string) => {
            if (body.team == null || body.workspaceId == null) {
              return
            }

            if (options?.beforeSubmitting != null) {
              options.beforeSubmitting()
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
            if (options?.afterSubmitting != null) {
              options.afterSubmitting()
            }
          }}
        />,
        {
          showCloseIcon: true,
          title: 'Create new folder',
        }
      )
    },
    [openModal, closeLastModal, createFolder]
  )

  const openNewDocForm = useCallback(
    (body: CloudNewResourceRequestBody, options?: UIFormOptions) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFileDocumentOutline}
          placeholder='Doc title'
          submitButtonProps={{
            label: 'Create',
          }}
          prevRows={options?.precedingRows}
          onSubmit={async (inputValue: string, emoji?: string) => {
            if (body.team == null || body.workspaceId == null) {
              return
            }

            if (options?.beforeSubmitting != null) {
              options.beforeSubmitting()
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
            if (options?.afterSubmitting != null) {
              options.afterSubmitting()
            }
          }}
        />,
        {
          showCloseIcon: true,
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

export type UIFormOptions = SubmissionWrappers & {
  precedingRows: FormRowProps[]
}
