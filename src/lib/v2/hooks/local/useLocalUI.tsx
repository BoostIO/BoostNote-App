import React, { useCallback, useEffect, useRef, useState } from 'react'
import { mdiFileDocumentOutline, mdiFolderOutline, mdiPencil } from '@mdi/js'
import { FolderDoc, NoteDoc, NoteStorage } from '../../../db/types'
import { useDb } from '../../../db'
import {
  getFolderHref,
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
import ExportProgressItem, {
  ExportProcedureData,
} from '../../../../components/molecules/Export/ExportProgressItem'
import ExportSettingsComponent from '../../../../components/molecules/Export/ExportSettingsComponent'
import { useTranslation } from 'react-i18next'
import { useRouter } from '../../../router'

export function useLocalUI() {
  const { openSideNavFolderItemRecursively } = useGeneralStatus()
  const { openModal, closeLastModal, closeAllModals } = useModal()
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
    removeStorage,
    removeAttachment,
  } = useDb()
  const { pushMessage } = useToast()
  const { push } = useRouter()
  const { t } = useTranslation()

  const [openingModal, setOpeningModal] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (openingModal && inputRef.current != null) {
      inputRef.current.focus()
    }
  }, [inputRef, openingModal])

  const closeModalAndUpdateState = useCallback(() => {
    closeLastModal()
    setOpeningModal(false)
  }, [closeLastModal])

  const openWorkspaceEditForm = useCallback(
    (workspace: NoteStorage) => {
      setOpeningModal(true)
      openModal(
        <BasicInputFormLocal
          inputRef={inputRef}
          defaultIcon={mdiPencil}
          defaultInputValue={workspace.name}
          submitButtonProps={{
            label: t('storage.rename'),
          }}
          onSubmit={async (workspaceName: string) => {
            if (workspaceName == '') {
              pushMessage({
                title: 'Cannot rename workspace',
                description: 'Workspace name should not be empty.',
              })
              closeModalAndUpdateState()
              return
            }
            renameStorage(workspace.id, workspaceName)
            closeModalAndUpdateState()
          }}
        />,
        {
          showCloseIcon: true,
          title: `Rename "${workspace.name}" Space`,
        }
      )
    },
    [closeModalAndUpdateState, openModal, pushMessage, renameStorage, t]
  )

  const openRenameFolderForm = useCallback(
    (workspaceId: string, folder: FolderDoc) => {
      const folderPathname = getFolderPathname(folder._id)
      const folderName = getFolderNameFromPathname(folderPathname)
      setOpeningModal(true)
      openModal(
        <BasicInputFormLocal
          inputRef={inputRef}
          defaultIcon={mdiFolderOutline}
          defaultInputValue={folderName != null ? folderName : 'Untitled'}
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
              closeModalAndUpdateState()
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
            })

            // todo: [komediruzecki-05/06/2021] Test if this works correct, no hidden notes in sidebar
            push(`/app/storages/${workspaceId}/notes${newFolderPathname}`)
            openSideNavFolderItemRecursively(workspaceId, newFolderPathname)
            closeModalAndUpdateState()
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
      push,
      openSideNavFolderItemRecursively,
      closeModalAndUpdateState,
      pushMessage,
    ]
  )

  const openRenameDocForm = useCallback(
    (workspaceId: string, doc: NoteDoc) => {
      setOpeningModal(true)
      openModal(
        <BasicInputFormLocal
          inputRef={inputRef}
          defaultIcon={mdiFileDocumentOutline}
          defaultInputValue={getNoteTitle(doc, 'Untitled')}
          placeholder='Note title'
          submitButtonProps={{
            label: 'Update',
          }}
          inputIsDisabled={false}
          onSubmit={async (inputValue: string) => {
            if (inputValue.trim() == '') {
              pushMessage({
                title: 'Cannot rename document',
                description: 'Document name should not be empty.',
              })
              closeModalAndUpdateState()
            } else {
              await updateNote(workspaceId, doc._id, { title: inputValue })
            }
            closeModalAndUpdateState()
          }}
        />,
        {
          showCloseIcon: true,
          title: 'Rename document',
        }
      )
    },
    [closeModalAndUpdateState, openModal, pushMessage, updateNote]
  )

  const openNewFolderForm = useCallback(
    (body: LocalNewResourceRequestBody, prevRows?: FormRowProps[]) => {
      setOpeningModal(true)
      openModal(
        <BasicInputFormLocal
          inputRef={inputRef}
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
              const folderDoc = await createFolder(
                body.workspaceId,
                folderPathname
              ).catch((err) => {
                pushMessage({
                  title: 'Error',
                  description: `Cannot create folder, reason: ${err}`,
                })
              })

              if (
                folderDoc != null &&
                body.navigateToFolder != null &&
                body.navigateToFolder
              ) {
                push(getFolderHref(folderDoc, body.workspaceId))
              }
            } finally {
              closeModalAndUpdateState()
            }
          }}
        />,
        {
          showCloseIcon: true,
          title: 'Create new folder',
        }
      )
    },
    [openModal, createFolder, pushMessage, push, closeModalAndUpdateState]
  )

  const openNewDocForm = useCallback(
    (body: LocalNewResourceRequestBody, prevRows?: FormRowProps[]) => {
      setOpeningModal(true)
      openModal(
        <BasicInputFormLocal
          inputRef={inputRef}
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
            closeModalAndUpdateState()
          }}
        />,
        {
          showCloseIcon: true,
          title: 'Create new document',
        }
      )
    },
    [openModal, createNote, closeModalAndUpdateState]
  )

  const removeWorkspace = useCallback(
    async (workspace: NoteStorage) => {
      messageBox({
        title: `Remove "${workspace.name}" Space`,
        message:
          workspace.type === 'fs'
            ? "This operation won't delete the actual space folder. You can add it to the app again."
            : t('storage.removeMessage'),
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'warning',
            label: t('storage.remove'),
            onClick: () => {
              removeStorage(workspace.id)
            },
          },
          {
            label: t('general.cancel'),
            cancelButton: true,
            defaultButton: true,
            variant: 'secondary',
          },
        ],
      })
    },
    [messageBox, removeStorage, t]
  )

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

  const exportDocuments = useCallback(
    (
      workspace: NoteStorage,
      exportSettings: LocalExportResourceRequestBody
    ) => {
      openModal(
        <ExportSettingsComponent
          exportSettings={exportSettings}
          onStartExport={(exportProcedureData: ExportProcedureData) => {
            openModal(
              <ExportProgressItem
                workspaceId={workspace.id}
                exportProcedureData={exportProcedureData}
                onFinish={() => closeAllModals()}
              />
            )
          }}
        />
      )
    },
    [closeAllModals, openModal]
  )
  const removeAttachmentApi = useCallback(
    (workspaceId: string, attachmentId: string) => {
      messageBox({
        title: `Remove Attachment`,
        message: 'The attachment will be deleted permanently.',
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'warning',
            label: 'Delete Attachment',
            onClick: () => {
              removeAttachment(workspaceId, attachmentId)
            },
          },
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
        ],
      })
    },
    [messageBox, removeAttachment]
  )

  return {
    openWorkspaceEditForm,
    openNewDocForm,
    openNewFolderForm,
    openRenameFolderForm,
    openRenameDocForm,
    deleteFolder,
    removeWorkspace,
    deleteOrTrashNote: deleteOrArchiveDoc,
    exportDocuments,
    removeAttachment: removeAttachmentApi,
  }
}

export interface LocalNewResourceRequestBody {
  workspaceId?: string
  parentFolderPathname?: string
  navigateToFolder?: boolean
}

export interface LocalExportResourceRequestBody {
  folderName: string
  folderPathname: string
  exportingStorage: boolean
}
