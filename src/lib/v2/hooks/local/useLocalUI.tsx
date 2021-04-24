import React, { useCallback } from 'react'
import { mdiFileDocumentOutline, mdiFolderOutline, mdiPencil } from '@mdi/js'
import { FolderDoc, NoteDoc, NoteStorage } from '../../../db/types'
import { useDb } from '../../../db'
import {
  getFolderNameFromPathname,
  getFolderPathname,
  getNoteTitle,
  getParentFolderPathname,
} from '../../../db/utils'
import { join } from 'path'
import BasicInputFormLocal from '../../../../components/v2/organisms/BasicInputFormLocal'
import { useModal } from '../../../../shared/lib/stores/modal'
import {
  DialogIconTypes,
  useDialog,
} from '../../../../shared/lib/stores/dialog'
import { useToast } from '../../../../shared/lib/stores/toast'
import { useGeneralStatus } from '../../../generalStatus'
import { FormRowProps } from '../../../../shared/components/molecules/Form/templates/FormRow'

export function useLocalUI() {
  const { openSideNavFolderItemRecursively } = useGeneralStatus()
  const { openModal, closeLastModal } = useModal()
  const { messageBox } = useDialog()
  const {
    updateNote,
    createNote,
    createFolder,
    renameFolder,
    removeFolder,
    trashNote,
    purgeNote,
    renameStorage,
  } = useDb()
  const { pushMessage } = useToast()

  const openWorkspaceEditForm = useCallback(
    (workspace: NoteStorage) => {
      openModal(
        <BasicInputFormLocal
          defaultIcon={mdiFolderOutline}
          defaultInputValue={workspace != null ? workspace.name : 'Untitled'}
          defaultEmoji={undefined}
          placeholder='Workspace name'
          submitButtonProps={{
            label: 'Update',
          }}
          onSubmit={async (workspaceName: string) => {
            if (workspaceName == '') {
              pushMessage({
                title: 'Cannot rename workspace',
                description: 'Workspace name should not be empty.',
              })
              closeLastModal()
              return
            }
            await renameStorage(workspace.id, workspaceName)
            closeLastModal()
          }}
        />,
        {
          showCloseIcon: true,
          title: 'Rename workspace',
        }
      )
    },
    [closeLastModal, openModal, pushMessage, renameStorage]
  )

  const openRenameFolderForm = useCallback(
    (workspaceId: string, folder: FolderDoc) => {
      const folderPathname = getFolderPathname(folder._id)
      const folderName = getFolderNameFromPathname(folderPathname)
      openModal(
        <BasicInputFormLocal
          defaultIcon={mdiFolderOutline}
          defaultInputValue={folderName != null ? folderName : 'Untitled'}
          defaultEmoji={undefined}
          placeholder='Folder name'
          submitButtonProps={{
            label: 'Update',
          }}
          onSubmit={async (folderName: string) => {
            if (folderName == '') {
              pushMessage({
                title: 'Cannot rename folder',
                description: 'Folder name should not be empty.',
              })
              closeLastModal()
              return
            }
            const newFolderPathname = join(
              getParentFolderPathname(folderPathname),
              folderName
            )
            await renameFolder(
              workspaceId,
              folderPathname,
              newFolderPathname
            ).catch((err) => {
              pushMessage({
                title: 'Cannot rename folder',
                description:
                  err != null
                    ? err.message != null
                      ? err.message
                      : `${err}`
                    : 'Unknown error',
              })
              return
            })

            // Should update the UI, again works weirdly in pouch DB, works ok in FS storage
            // does not update the note properly?
            // push(`/app/storages/${storageId}/notes${newFolderPathname}`)
            openSideNavFolderItemRecursively(workspaceId, newFolderPathname)
            closeLastModal()
          }}
        />,
        {
          showCloseIcon: true,
          title: 'Rename folder',
        }
      )
    },
    [
      openModal,
      renameFolder,
      closeLastModal,
      openSideNavFolderItemRecursively,
      pushMessage,
    ]
  )

  const openRenameDocForm = useCallback(
    (workspaceId: string, doc: NoteDoc) => {
      openModal(
        <BasicInputFormLocal
          defaultIcon={mdiFileDocumentOutline}
          defaultInputValue={getNoteTitle(doc, 'Untitled')}
          defaultEmoji={mdiPencil}
          placeholder='Note title'
          submitButtonProps={{
            label: 'Update',
          }}
          inputIsDisabled={false}
          onSubmit={async (inputValue: string) => {
            // todo: [komediruzecki-22/05/2021] handle empty values - test
            if (inputValue == '') {
              pushMessage({
                title: 'Cannot rename document',
                description: 'Document name should not be empty.',
              })
            } else {
              await updateNote(workspaceId, doc._id, { title: inputValue })
            }
            closeLastModal()
          }}
        />,
        {
          showCloseIcon: true,
          title: 'Rename document',
        }
      )
    },
    [closeLastModal, openModal, pushMessage, updateNote]
  )

  const openNewFolderForm = useCallback(
    (body: LocalNewResourceRequestBody, prevRows?: FormRowProps[]) => {
      openModal(
        <BasicInputFormLocal
          defaultIcon={mdiFolderOutline}
          placeholder='Folder name'
          submitButtonProps={{
            label: 'Create',
          }}
          prevRows={prevRows}
          onSubmit={async (inputValue: string) => {
            if (body.workspaceId == null) {
              return
            }

            try {
              if (inputValue.endsWith('/')) {
                inputValue = inputValue.slice(0, inputValue.length - 1)
              }
              const folderPathname = join(
                body.parentFolderPathname != null
                  ? body.parentFolderPathname
                  : '/',
                inputValue
              )
              await createFolder(body.workspaceId, folderPathname)
            } finally {
              closeLastModal()
            }
          }}
        />,
        {
          showCloseIcon: true,
          title: 'Create new folder',
        }
      )
    },
    [openModal, createFolder, closeLastModal]
  )

  const openNewDocForm = useCallback(
    (body: LocalNewResourceRequestBody, prevRows?: FormRowProps[]) => {
      openModal(
        <BasicInputFormLocal
          defaultIcon={mdiFileDocumentOutline}
          placeholder='Document title'
          submitButtonProps={{
            label: 'Create',
          }}
          prevRows={prevRows}
          onSubmit={async (inputValue: string) => {
            if (body.workspaceId == null) {
              return
            }

            await createNote(body.workspaceId, {
              title: inputValue,
              folderPathname:
                body.parentFolderPathname != null
                  ? body.parentFolderPathname
                  : '/',
            })
            closeLastModal()
          }}
        />,
        {
          showCloseIcon: true,
          title: 'Create new document',
        }
      )
    },
    [openModal, createNote, closeLastModal]
  )

  // const deleteWorkspace = useCallback(
  //   async (workspace: { id: string; teamId: string; default: boolean }) => {
  //     if (workspace.default) {
  //       return
  //     }
  //     messageBox({
  //       title: `Delete the workspace?`,
  //       message: `Are you sure to delete this workspace? You will not be able to revert this action.`,
  //       buttons: [
  //         {
  //           variant: 'secondary',
  //           label: 'Cancel',
  //           cancelButton: true,
  //           defaultButton: true,
  //         },
  //         {
  //           variant: 'danger',
  //           label: 'Destroy All',
  //           onClick: async () => await deleteWorkspaceApi(workspace),
  //         },
  //       ],
  //     })
  //   },
  //   [messageBox, deleteWorkspaceApi]
  // )

  const deleteFolder = useCallback(
    async (target: { workspaceName: string; folder: FolderDoc }) => {
      const folderPathname = getFolderPathname(target.folder._id)
      messageBox({
        title: `Delete folder '${
          folderPathname.startsWith('/')
            ? folderPathname.substr(1)
            : folderPathname
        }'`,
        message: `Are you sure you want to remove this folder and its documents?`,
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
              await removeFolder(target.workspaceName, folderPathname)
            },
          },
        ],
      })
    },
    [messageBox, removeFolder]
  )

  const deleteOrArchiveDoc = useCallback(
    async (
      workspaceId: string,
      docId: string,
      trashed: boolean,
      title = 'this document'
    ) => {
      if (!trashed) {
        return messageBox({
          title: `Archive ${title}`,
          message: `Are you sure you want to archive this content?`,
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
              label: 'Archive',
              onClick: async () => {
                await trashNote(workspaceId, docId)
              },
            },
          ],
        })
      }
      messageBox({
        title: `Delete ${title}`,
        message: `Are you sure you want to delete this document?`,
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
              await purgeNote(workspaceId, docId)
            },
          },
        ],
      })
    },
    [messageBox, purgeNote, trashNote]
  )

  return {
    openWorkspaceEditForm,
    openNewDocForm,
    openNewFolderForm,
    openRenameFolderForm,
    openRenameDocForm,
    deleteFolder,
    // deleteWorkspace,
    deleteOrTrashNote: deleteOrArchiveDoc,
  }
}

export interface LocalNewResourceRequestBody {
  workspaceId?: string
  parentFolderPathname?: string
}
