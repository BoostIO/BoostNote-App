import { mdiFileDocumentOutline, mdiFolderOutline } from '@mdi/js'
import React, { useCallback } from 'react'
import { FormRowProps } from '../../../design/components/molecules/Form/templates/FormRow'
import EmojiInputForm from '../../../design/components/organisms/EmojiInputForm'
import InputForm from '../../../design/components/organisms/InputForm'
import { DialogIconTypes, useDialog } from '../../../design/lib/stores/dialog'
import { useModal } from '../../../design/lib/stores/modal'
import { SubmissionWrappers } from '../../../design/lib/types'
import { removeCachedPageProps } from '../../../lib/routing/pagePropCache'
import DocPreviewModal from '../../components/DocPreview'
import WorkspaceModalForm from '../../components/Modal/contents/Workspace/WorkspaceModalForm'
import { SerializedDashboard } from '../../interfaces/db/dashboard'
import {
  SerializedDoc,
  SerializedDocWithSupplemental,
} from '../../interfaces/db/doc'
import { SerializedFolder } from '../../interfaces/db/folder'
import { PropData } from '../../interfaces/db/props'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { lngKeys } from '../i18n/types'
import { useRouter } from '../router'
import { useNav } from '../stores/nav'
import { usePage } from '../stores/pageStore'
import { modalEventEmitter, resourceDeleteEventEmitter } from '../utils/events'
import {
  getDocId,
  getFolderId,
  getFolderURL,
  getTeamURL,
  getWorkspaceURL,
} from '../utils/patterns'
import { useCloudApi } from './useCloudApi'
import { useI18n } from './useI18n'
import { stringify } from 'querystring'
import { docPreviewCloseEvent } from './useCloudDocPreview'

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
    updateDashboard,
  } = useCloudApi()
  const { translate } = useI18n()
  const { team } = usePage()
  const { foldersMap, workspacesMap } = useNav()
  const { pathname, push, query } = useRouter()

  const openWorkspaceCreateForm = useCallback(() => {
    openModal(<WorkspaceModalForm />, {
      showCloseIcon: true,
      title: translate(lngKeys.ModalsWorkspaceCreateTitle),
    })
  }, [openModal, translate])

  const openWorkspaceEditForm = useCallback(
    (wp: SerializedWorkspace) => {
      openModal(<WorkspaceModalForm workspace={wp} />, {
        showCloseIcon: true,
        title: translate(lngKeys.ModalsWorkspaceEditTitle),
      })
    },
    [openModal, translate]
  )

  const openRenameFolderForm = useCallback(
    (folder: SerializedFolder) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFolderOutline}
          defaultInputValue={folder.name}
          defaultEmoji={folder.emoji}
          placeholder={translate(lngKeys.FolderNamePlaceholder)}
          submitButtonProps={{
            label: translate(lngKeys.GeneralUpdateVerb),
          }}
          onSubmit={async (inputValue: string, emoji?: string) => {
            await updateFolder(folder, {
              workspaceId: folder.workspaceId,
              parentFolderId: folder.parentFolderId,
              folderName: inputValue,
              emoji: typeof emoji === 'string' ? emoji : null,
            })
            closeLastModal()
          }}
        />,
        {
          showCloseIcon: true,
          title: translate(lngKeys.RenameFolder),
        }
      )
    },
    [openModal, closeLastModal, updateFolder, translate]
  )

  const openRenameDocForm = useCallback(
    (doc: SerializedDoc) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFileDocumentOutline}
          defaultInputValue={doc.title}
          defaultEmoji={doc.emoji}
          placeholder={translate(lngKeys.DocTitlePlaceholder)}
          onSubmit={async (inputValue: string, emoji?: string) => {
            await updateDoc(doc, {
              workspaceId: doc.workspaceId,
              parentFolderId: doc.parentFolderId,
              title: inputValue,
              emoji: emoji == null ? null : emoji,
            })
            closeLastModal()
          }}
          onBlur={async (inputValue: string, emoji?: string) => {
            await updateDoc(doc, {
              workspaceId: doc.workspaceId,
              parentFolderId: doc.parentFolderId,
              title: inputValue,
              emoji: emoji == null ? null : emoji,
            })
          }}
        />,
        {
          showCloseIcon: false,
          width: 'small',
        }
      )
    },
    [closeLastModal, openModal, translate, updateDoc]
  )

  const openNewFolderForm = useCallback(
    (
      body: CloudNewResourceRequestBody,
      options?: UIFormOptions & { skipRedirect?: boolean }
    ) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFolderOutline}
          placeholder={translate(lngKeys.FolderNamePlaceholder)}
          submitButtonProps={{
            label: translate(lngKeys.GeneralCreate),
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
          title: translate(lngKeys.ModalsCreateNewFolder),
        }
      )
    },
    [openModal, closeLastModal, createFolder, translate]
  )

  const openNewDocForm = useCallback(
    (
      body: CloudNewResourceRequestBody,
      options?: UIFormOptions & { skipRedirect?: boolean; keepAll?: boolean }
    ) => {
      openModal(
        <EmojiInputForm
          defaultIcon={mdiFileDocumentOutline}
          placeholder={translate(lngKeys.DocTitlePlaceholder)}
          submitButtonProps={{
            label: translate(lngKeys.GeneralCreate),
          }}
          prevRows={options?.precedingRows}
          onSubmit={async (inputValue: string, emoji?: string) => {
            console.log(body)
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
                props: body.props,
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
          title: translate(lngKeys.ModalsCreateNewDocument),
          keepAll: options?.keepAll,
        }
      )
    },
    [openModal, closeLastModal, createDoc, translate]
  )

  const openRenameDashboardForm = useCallback(
    (dashboard: SerializedDashboard) => {
      openModal(
        <InputForm
          defaultInputValue={dashboard.name}
          placeholder={translate(lngKeys.DocTitlePlaceholder)}
          onSubmit={async (inputValue: string) => {
            await updateDashboard(dashboard, {
              name: inputValue,
            })
            closeLastModal()
          }}
          onBlur={async (inputValue: string) => {
            await updateDashboard(dashboard, {
              name: inputValue,
            })
          }}
        />,
        {
          showCloseIcon: false,
          width: 'small',
        }
      )
    },
    [closeLastModal, openModal, translate, updateDashboard]
  )

  const deleteWorkspace = useCallback(
    async (workspace: { id: string; teamId: string; default: boolean }) => {
      if (workspace.default) {
        return
      }
      messageBox({
        title: translate(lngKeys.ModalsDeleteWorkspaceTitle),
        message: translate(lngKeys.ModalsDeleteWorkspaceDisclaimer),
        buttons: [
          {
            variant: 'secondary',
            label: translate(lngKeys.GeneralCancel),
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: translate(lngKeys.GeneralDelete),
            onClick: async () => {
              await deleteWorkspaceApi(workspace)

              if (team == null) {
                return
              }

              resourceDeleteEventEmitter.dispatch({
                resourceType: 'workspace',
                resourceId: workspace.id,
                parentURL: getTeamURL(team),
              })
            },
          },
        ],
      })
    },
    [messageBox, deleteWorkspaceApi, translate, team]
  )

  const deleteFolder = useCallback(
    async (target: {
      id: string
      pathname: string
      teamId: string
      parentFolderId?: string
      workspaceId: string
    }) => {
      messageBox({
        title: translate(lngKeys.ModalsDeleteDocFolderTitle, {
          label: target.pathname,
        }),
        message: translate(lngKeys.ModalsDeleteFolderDisclaimer),
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
            label: translate(lngKeys.GeneralDelete),
            onClick: async () => {
              await deleteFolderApi(target)
              await removeCachedPageProps(getFolderId(target))
              if (team == null) {
                return
              }

              const parentFolder =
                target.parentFolderId != null
                  ? foldersMap.get(target.parentFolderId)
                  : null
              let parentURL = getTeamURL(team)
              if (parentFolder != null) {
                parentURL += getFolderURL(parentFolder)
              } else {
                const parentWorkspace = workspacesMap.get(target.workspaceId)
                if (parentWorkspace != null && !parentWorkspace.default) {
                  parentURL += getWorkspaceURL(parentWorkspace)
                }
              }

              resourceDeleteEventEmitter.dispatch({
                resourceType: 'folder',
                resourceId: target.id,
                parentURL,
              })
            },
          },
        ],
      })
    },
    [messageBox, deleteFolderApi, translate, team, workspacesMap, foldersMap]
  )

  const deleteDoc = useCallback(
    async (target: {
      id: string
      teamId: string
      title: string
      parentFolderId?: string
      workspaceId: string
    }) => {
      messageBox({
        title: translate(lngKeys.ModalsDeleteDocFolderTitle, {
          label: target.title,
        }),
        message: translate(lngKeys.ModalsDeleteDocDisclaimer),
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
            label: translate(lngKeys.GeneralDelete),
            onClick: async () => {
              await deleteDocApi(target)
              await removeCachedPageProps(getDocId(target))

              if (team == null) {
                return
              }

              const parentFolder =
                target.parentFolderId != null
                  ? foldersMap.get(target.parentFolderId)
                  : null
              let parentURL = getTeamURL(team)
              if (parentFolder != null) {
                parentURL += getFolderURL(parentFolder)
              } else {
                const parentWorkspace = workspacesMap.get(target.workspaceId)
                if (parentWorkspace != null && !parentWorkspace.default) {
                  parentURL += getWorkspaceURL(parentWorkspace)
                }
              }

              resourceDeleteEventEmitter.dispatch({
                resourceType: 'doc',
                resourceId: target.id,
                parentURL,
              })
            },
          },
        ],
      })
    },
    [messageBox, deleteDocApi, translate, team, workspacesMap, foldersMap]
  )

  const openDocPreview = useCallback(
    (doc: SerializedDocWithSupplemental, team: SerializedTeam) => {
      const cleanedupQuery = Object.assign({}, query)
      delete cleanedupQuery.preview
      const fallbackQuery = stringify(cleanedupQuery)
      const fallbackUrl = `${pathname}${
        fallbackQuery.trim() !== '' ? `?${fallbackQuery}` : ''
      }`
      return openModal(
        <DocPreviewModal doc={doc} team={team} fallbackUrl={fallbackUrl} />,
        {
          showCloseIcon: false,
          removePadding: true,
          navigation: {
            url: `${pathname}?preview=${doc.id}`,
            fallbackUrl,
          },
        }
      )
    },
    [openModal, pathname, query]
  )

  const goToDocPreview = useCallback(
    (doc: SerializedDocWithSupplemental) => {
      modalEventEmitter.dispatch({ type: docPreviewCloseEvent })
      return push(`${pathname}?preview=${doc.id}`)
    },
    [pathname, push]
  )

  return {
    openWorkspaceCreateForm,
    openWorkspaceEditForm,
    openNewDocForm,
    openNewFolderForm,
    openDocPreview,
    goToDocPreview,
    openRenameFolderForm,
    openRenameDocForm,
    deleteFolder,
    deleteWorkspace,
    deleteDoc,
    openRenameDashboardForm,
  }
}

export interface CloudNewResourceRequestBody {
  team?: SerializedTeam
  workspaceId?: string
  parentFolderId?: string
  props?: Record<string, PropData | null>
}

export type UIFormOptions = SubmissionWrappers & {
  precedingRows: FormRowProps[]
}
