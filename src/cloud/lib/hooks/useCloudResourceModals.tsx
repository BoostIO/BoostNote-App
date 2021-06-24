import { mdiFileDocumentOutline, mdiFolderOutline } from '@mdi/js'
import React, { useCallback } from 'react'
import { FormRowProps } from '../../../shared/components/molecules/Form/templates/FormRow'
import EmojiInputForm from '../../../shared/components/organisms/EmojiInputForm'
import { DialogIconTypes, useDialog } from '../../../shared/lib/stores/dialog'
import { useModal } from '../../../shared/lib/stores/modal'
import { SubmissionWrappers } from '../../../shared/lib/types'
import WorkspaceModalForm from '../../components/organisms/Modal/contents/Workspace/WorkspaceModalForm'
import { SerializedDoc } from '../../interfaces/db/doc'
import { SerializedFolder } from '../../interfaces/db/folder'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { lngKeys } from '../i18n/types'
import { useCloudApi } from './useCloudApi'
import { useI18n } from './useI18n'

export function useCloudResourceModals() {
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
  } = useCloudApi()
  const { t } = useI18n()

  const openWorkspaceCreateForm = useCallback(() => {
    openModal(<WorkspaceModalForm />, {
      showCloseIcon: true,
      title: t(lngKeys.ModalsWorkspaceCreateTitle),
    })
  }, [openModal, t])

  const openWorkspaceEditForm = useCallback(
    (wp: SerializedWorkspace) => {
      openModal(<WorkspaceModalForm workspace={wp} />, {
        showCloseIcon: true,
        title: t(lngKeys.ModalsWorkspaceEditTitle),
      })
    },
    [openModal, t]
  )

  const openRenameFolderForm = useCallback(
    (folder: SerializedFolder) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFolderOutline}
          defaultInputValue={folder.name}
          defaultEmoji={folder.emoji}
          placeholder={t(lngKeys.FolderNamePlaceholder)}
          submitButtonProps={{
            label: t(lngKeys.Update),
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
          title: t(lngKeys.RenameFolder),
        }
      )
    },
    [openModal, closeLastModal, updateFolder, t]
  )

  const openRenameDocForm = useCallback(
    (doc: SerializedDoc) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFileDocumentOutline}
          defaultInputValue={doc.title}
          defaultEmoji={doc.emoji}
          placeholder={t(lngKeys.DocTitlePlaceholder)}
          submitButtonProps={{
            label: t(lngKeys.Update),
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
          title: t(lngKeys.RenameDoc),
        }
      )
    },
    [openModal, closeLastModal, updateDoc, t]
  )

  const openNewFolderForm = useCallback(
    (
      body: CloudNewResourceRequestBody,
      options?: UIFormOptions & { skipRedirect?: boolean }
    ) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFolderOutline}
          placeholder={t(lngKeys.FolderNamePlaceholder)}
          submitButtonProps={{
            label: t(lngKeys.GeneralCreate),
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
              {
                skipRedirect: options?.skipRedirect,
                afterSuccess: closeLastModal,
              }
            )
            if (options?.afterSubmitting != null) {
              options.afterSubmitting()
            }
          }}
        />,
        {
          showCloseIcon: true,
          title: t(lngKeys.ModalsCreateNewFolder),
        }
      )
    },
    [openModal, closeLastModal, createFolder, t]
  )

  const openNewDocForm = useCallback(
    (
      body: CloudNewResourceRequestBody,
      options?: UIFormOptions & { skipRedirect?: boolean }
    ) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFileDocumentOutline}
          placeholder={t(lngKeys.DocTitlePlaceholder)}
          submitButtonProps={{
            label: t(lngKeys.GeneralCreate),
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
              {
                skipRedirect: options?.skipRedirect,
                afterSuccess: closeLastModal,
              }
            )
            if (options?.afterSubmitting != null) {
              options.afterSubmitting()
            }
          }}
        />,
        {
          showCloseIcon: true,
          title: t(lngKeys.ModalsCreateNewDocument),
        }
      )
    },
    [openModal, closeLastModal, createDoc, t]
  )

  const deleteWorkspace = useCallback(
    async (workspace: { id: string; teamId: string; default: boolean }) => {
      if (workspace.default) {
        return
      }
      messageBox({
        title: t(lngKeys.ModalsDeleteWorkspaceTitle),
        message: t(lngKeys.ModalsDeleteWorkspaceDisclaimer),
        buttons: [
          {
            variant: 'secondary',
            label: t(lngKeys.GeneralCancel),
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: t(lngKeys.GeneralDelete),
            onClick: async () => await deleteWorkspaceApi(workspace),
          },
        ],
      })
    },
    [messageBox, deleteWorkspaceApi, t]
  )

  const deleteFolder = useCallback(
    async (target: { id: string; pathname: string; teamId: string }) => {
      messageBox({
        title: t(lngKeys.ModalsDeleteDocFolderTitle, {
          label: target.pathname,
        }),
        message: t(lngKeys.ModalsDeleteFolderDisclaimer),
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: t(lngKeys.GeneralCancel),
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: t(lngKeys.GeneralDelete),
            onClick: async () => {
              await deleteFolderApi(target)
            },
          },
        ],
      })
    },
    [messageBox, deleteFolderApi, t]
  )

  const deleteDoc = useCallback(
    async (
      target: { id: string; archivedAt?: string; teamId: string },
      title = ''
    ) => {
      messageBox({
        title: t(lngKeys.ModalsDeleteDocFolderTitle, { label: title }),
        message: t(lngKeys.ModalsDeleteDocDisclaimer),
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: t(lngKeys.GeneralCancel),
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: t(lngKeys.GeneralDelete),
            onClick: async () => {
              await deleteDocApi(target)
            },
          },
        ],
      })
    },
    [messageBox, deleteDocApi, t]
  )

  return {
    openWorkspaceCreateForm,
    openWorkspaceEditForm,
    openNewDocForm,
    openNewFolderForm,
    openRenameFolderForm,
    openRenameDocForm,
    deleteFolder,
    deleteWorkspace,
    deleteDoc,
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
