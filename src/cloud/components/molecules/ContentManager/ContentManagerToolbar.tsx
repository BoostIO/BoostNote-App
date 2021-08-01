import React, { useState, useCallback, useMemo } from 'react'
import {
  mdiFolderMoveOutline,
  mdiTagMultipleOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import {
  DocStatus,
  SerializedDoc,
  SerializedDocWithBookmark,
} from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { difference } from 'ramda'
import {
  getDocIdFromString,
  getFolderIdFromString,
} from '../../../lib/utils/patterns'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../shared/lib/stores/dialog'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import MoveItemModal from '../../organisms/Modal/contents/Forms/MoveItemModal'
import { useModal } from '../../../../shared/lib/stores/modal'
import styled from '../../../../shared/lib/styled'
import { LoadingButton } from '../../../../shared/components/atoms/Button'
import { lngKeys } from '../../../lib/i18n/types'
import { useI18n } from '../../../lib/hooks/useI18n'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import DocDueDateSelect from '../../organisms/DocProperties/DocDueDateSelect'
import DocStatusSelect from '../../organisms/DocProperties/DocStatusSelect'
import ContentManagerToolbarStatusPopup from './ContentManagerToolbarStatusPopup'
import DocAssigneeSelect from '../../organisms/DocProperties/DocAssigneeSelect'
import DocLabelSelectionModal from '../../organisms/DocProperties/DocLabelSelectionModal'

interface ContentManagerToolbarProps {
  team: SerializedTeam
  selectedDocs: Set<string>
  documentsMap: Map<string, SerializedDocWithBookmark>
  foldersMap: Map<string, SerializedFolderWithBookmark>
  workspacesMap: Map<string, SerializedWorkspace>
  selectedFolders: Set<string>
  updating: string[]
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
}

enum BulkActions {
  move = 0,
  delete = 1,
  duedate = 2,
  status = 3,
  assignees = 4,
  label = 5,
}

const ContentManagerToolbar = ({
  team,
  selectedDocs,
  selectedFolders,
  documentsMap,
  foldersMap,
  updating,
  setUpdating,
}: ContentManagerToolbarProps) => {
  const [sending, setSending] = useState<number>()
  const {
    updateDoc,
    updateFolder,
    deleteFolderApi,
    deleteDocApi,
    updateDocStatusApi,
    updateDocDueDateApi,
    updateDocAssigneeApi,
    updateDocTagsBulkApi,
  } = useCloudApi()
  const { translate } = useI18n()
  const { messageBox } = useDialog()
  const { openModal, openContextModal, closeAllModals } = useModal()

  const selectedDocsAreUpdating = useMemo(() => {
    return (
      difference([...selectedDocs.values()].map(getDocIdFromString), updating)
        .length !== selectedDocs.size
    )
  }, [selectedDocs, updating])

  const selectedFoldersAreUpdating = useMemo(() => {
    return (
      difference(
        [...selectedFolders.values()].map(getDocIdFromString),
        updating
      ).length !== selectedFolders.size
    )
  }, [selectedFolders, updating])

  const moveSingleDoc = useCallback(
    async (docId: string, workspaceId: string, parentFolderId?: string) => {
      await updateDoc(
        { id: docId, teamId: team.id } as SerializedDocWithBookmark,
        {
          workspaceId,
          parentFolderId,
        }
      )
    },
    [updateDoc, team]
  )

  const moveSingleFolder = useCallback(
    async (folderId: string, workspaceId: string, parentFolderId?: string) => {
      await updateFolder(
        { id: folderId, teamId: team.id } as SerializedFolderWithBookmark,
        {
          workspaceId,
          parentFolderId,
          emoji: 'unchanged',
        }
      )
    },
    [updateFolder, team]
  )

  const bulkMoveCallback = useCallback(
    async (workspaceId: string, parentFolderId?: string) => {
      if (
        selectedDocs.size + selectedFolders.size === 0 ||
        selectedDocsAreUpdating ||
        selectedFoldersAreUpdating
      ) {
        return
      }
      const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
      patternedIds.push(
        ...[...selectedFolders.values()].map(getFolderIdFromString)
      )
      setUpdating((prev) => [...prev, ...patternedIds])
      setSending(BulkActions.move)
      for (const folderId of selectedFolders.values()) {
        await moveSingleFolder(folderId, workspaceId, parentFolderId)
      }

      for (const docId of selectedDocs.values()) {
        await moveSingleDoc(docId, workspaceId, parentFolderId)
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [
      moveSingleFolder,
      moveSingleDoc,
      selectedDocs,
      selectedFolders,
      selectedDocsAreUpdating,
      selectedFoldersAreUpdating,
      setUpdating,
    ]
  )

  const openMoveForm = useCallback(
    () => openModal(<MoveItemModal onSubmit={bulkMoveCallback} />),
    [openModal, bulkMoveCallback]
  )

  const bulkDeleteCallback = useCallback(async () => {
    if (
      selectedDocs.size + selectedFolders.size === 0 ||
      selectedDocsAreUpdating ||
      selectedFoldersAreUpdating
    ) {
      return
    }

    messageBox({
      title: `Delete the selected items?`,
      message: `Selected folders, their content, and the selected documents will be permanently deleted.`,
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
            const patternedIds = [...selectedDocs.values()].map(
              getDocIdFromString
            )
            patternedIds.push(
              ...[...selectedFolders.values()].map(getFolderIdFromString)
            )
            setUpdating((prev) => [...prev, ...patternedIds])
            setSending(BulkActions.delete)
            for (const folderId of selectedFolders.values()) {
              const target = foldersMap.get(folderId)
              if (target != null) {
                await deleteFolderApi(target)
              }
            }

            for (const docId of selectedDocs.values()) {
              const target = documentsMap.get(docId)
              if (target != null) {
                await deleteDocApi(target)
              }
            }
            setSending(undefined)
            setUpdating((prev) => difference(prev, patternedIds))

            return
          },
        },
      ],
    })
  }, [
    selectedDocs,
    selectedFolders,
    selectedDocsAreUpdating,
    selectedFoldersAreUpdating,
    foldersMap,
    documentsMap,
    messageBox,
    deleteDocApi,
    deleteFolderApi,
    setUpdating,
  ])

  const selectedDocumentsCommonValues = useMemo(() => {
    const values: {
      assignees: string[]
      status?: DocStatus
      tags: string[]
      dueDate?: string
    } = { tags: [], assignees: [] }

    if (selectedDocs.size === 0) {
      return values
    }

    const docs = [...selectedDocs.values()].reduce((acc, val) => {
      const doc = documentsMap.get(val)
      if (doc != null) {
        acc.push(doc)
      }
      return acc
    }, [] as SerializedDocWithBookmark[])

    if (docs.length === 0) {
      return values
    }

    values.assignees = (docs[0].assignees || []).map(
      (assignee) => assignee.userId
    )
    values.status = docs[0].status
    values.tags = (docs[0].tags || []).map((tag) => tag.text)
    values.dueDate = docs[0].dueDate

    docs.forEach((doc) => {
      /** iterative */
      let newAssigneeArray = values.assignees.slice()
      let newTagsArray = values.tags.slice()
      /****/

      const docAssignees = (doc.assignees || []).map(
        (assignee) => assignee.userId
      )
      const docTags = (doc.tags || []).map((tag) => tag.text)

      values.assignees.forEach((assignee) => {
        if (!docAssignees.includes(assignee)) {
          newAssigneeArray = newAssigneeArray.filter((val) => val !== assignee)
        }
      })

      values.tags.forEach((tag) => {
        if (!docTags.includes(tag)) {
          newTagsArray = newTagsArray.filter((val) => val !== tag)
        }
      })

      if (values.dueDate != null && values.dueDate !== doc.dueDate) {
        values.dueDate = undefined
      }

      if (values.status != null && values.status !== doc.status) {
        values.status = undefined
      }

      /** changes **/
      values.assignees = newAssigneeArray
      values.tags = newTagsArray
    })

    return values
  }, [selectedDocs, documentsMap])

  const sendUpdateDocDueDate = useCallback(
    async (newDate: Date | null) => {
      if (selectedDocsAreUpdating || selectedDocs.size === 0) {
        return
      }
      const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
      setUpdating((prev) => [...prev, ...patternedIds])
      setSending(BulkActions.duedate)
      for (const docId of selectedDocs.values()) {
        await updateDocDueDateApi(
          { id: docId, teamId: team.id } as SerializedDoc,
          newDate
        )
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [
      selectedDocs,
      selectedDocsAreUpdating,
      team.id,
      updateDocDueDateApi,
      setUpdating,
    ]
  )

  const sendUpdateStatus = useCallback(
    async (status: DocStatus | null) => {
      closeAllModals()
      if (selectedDocsAreUpdating || selectedDocs.size === 0) {
        return
      }
      const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
      setUpdating((prev) => [...prev, ...patternedIds])
      setSending(BulkActions.status)
      for (const docId of selectedDocs.values()) {
        await updateDocStatusApi(
          { id: docId, teamId: team.id } as SerializedDoc,
          status
        )
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [
      selectedDocs,
      selectedDocsAreUpdating,
      team.id,
      updateDocStatusApi,
      setUpdating,
      closeAllModals,
    ]
  )

  const sendUpdateAssignees = useCallback(
    async (newAssignees: string[]) => {
      if (selectedDocsAreUpdating || selectedDocs.size === 0) {
        return
      }
      const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
      setUpdating((prev) => [...prev, ...patternedIds])
      setSending(BulkActions.assignees)
      for (const docId of selectedDocs.values()) {
        await updateDocAssigneeApi(
          { id: docId, teamId: team.id } as SerializedDoc,
          newAssignees
        )
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [
      selectedDocs,
      selectedDocsAreUpdating,
      team.id,
      updateDocAssigneeApi,
      setUpdating,
    ]
  )

  const sendTags = useCallback(
    async (newTags: string[]) => {
      closeAllModals()
      if (selectedDocsAreUpdating || selectedDocs.size === 0) {
        return
      }
      const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
      setUpdating((prev) => [...prev, ...patternedIds])
      setSending(BulkActions.label)
      for (const docId of selectedDocs.values()) {
        await updateDocTagsBulkApi(
          { id: docId, teamId: team.id } as SerializedDoc,
          newTags
        )
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [
      selectedDocs,
      selectedDocsAreUpdating,
      team.id,
      updateDocTagsBulkApi,
      setUpdating,
      closeAllModals,
    ]
  )

  if (selectedDocs.size === 0 && selectedFolders.size === 0) {
    return null
  }

  return (
    <Container className='cm__toolbar'>
      <div className='cm__toolbar__wrapper'>
        <span className='cm__selection'>
          {selectedDocs.size + selectedFolders.size} selected
        </span>
        {selectedDocs.size > 0 && (
          <>
            <LoadingButton
              className='cm__tool'
              variant='bordered'
              iconPath={mdiTagMultipleOutline}
              onClick={(event) => {
                openContextModal(
                  event,
                  <DocLabelSelectionModal
                    selectedTags={selectedDocumentsCommonValues.tags}
                    sendTags={sendTags}
                  />,
                  {
                    alignment: 'top-left',
                    width: 300,
                  }
                )
              }}
              disabled={selectedDocsAreUpdating}
              spinning={sending === BulkActions.label}
            >
              {translate(lngKeys.GeneralLabels)}
              {selectedDocumentsCommonValues.tags.length > 0
                ? ` (${selectedDocumentsCommonValues.tags.length})`
                : null}
            </LoadingButton>
            <DocAssigneeSelect
              isLoading={sending === BulkActions.assignees}
              disabled={selectedDocsAreUpdating}
              defaultValue={selectedDocumentsCommonValues.assignees}
              readOnly={selectedDocsAreUpdating}
              update={sendUpdateAssignees}
              popupAlignment='top-left'
            />
            <DocStatusSelect
              status={selectedDocumentsCommonValues.status}
              sending={sending === BulkActions.status}
              onStatusChange={sendUpdateStatus}
              disabled={selectedDocsAreUpdating}
              isReadOnly={selectedDocsAreUpdating}
              onClick={(event) => {
                openContextModal(
                  event,
                  <ContentManagerToolbarStatusPopup
                    onStatusChange={sendUpdateStatus}
                  />,
                  {
                    alignment: 'top-left',
                    width: 300,
                  }
                )
              }}
            />
            <DocDueDateSelect
              dueDate={selectedDocumentsCommonValues.dueDate}
              isReadOnly={selectedDocsAreUpdating}
              sending={sending === BulkActions.duedate}
              shortenedLabel={true}
              onDueDateChange={sendUpdateDocDueDate}
            />
          </>
        )}
        <LoadingButton
          className='cm__tool'
          variant='bordered'
          iconPath={mdiFolderMoveOutline}
          onClick={openMoveForm}
          disabled={selectedDocsAreUpdating || selectedFoldersAreUpdating}
          spinning={sending === BulkActions.move}
        >
          {translate(lngKeys.GeneralMoveVerb)}
        </LoadingButton>
        <LoadingButton
          className='cm__tool'
          variant='bordered'
          iconPath={mdiTrashCanOutline}
          onClick={bulkDeleteCallback}
          disabled={selectedDocsAreUpdating || selectedFoldersAreUpdating}
          spinning={sending === BulkActions.delete}
        >
          {translate(lngKeys.GeneralDelete)}
        </LoadingButton>
      </div>
    </Container>
  )
}

const Container = styled.div`
  width: fit-content;
  height: 40px;
  background: ${({ theme }) => theme.colors.background.secondary};

  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  bottom: 10px;
  border-radius: ${({ theme }) => theme.borders.radius}px;

  .cm__toolbar__wrapper {
    padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;
    display: flex;
    align-items: center;
    height: 100%;
    flex: 0 1 auto;
  }

  .cm__selection {
    white-space: nowrap;
  }

  .cm__selection,
  .cm__tool {
    min-wdith: 80px;
    width: auto;
  }

  .cm__selection + .cm__tool,
  .cm__tool + .cm__tool,
  .doc__due-date__select + .cm__tool {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .doc__due-date__select,
  .doc__status__select,
  .doc__assignee__select {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px !important;
  }

  .cm__tool,
  .cm__selection {
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  button.cm__tool {
    white-space: nowrap;
  }

  .doc__status__select {
    height: 32px !important;
  }

  .doc__property__button {
    height: 32px;
    border: 1px solid ${({ theme }) => theme.colors.border.second};
    width: fit-content;
    white-space: nowrap;

    &:focus {
      background: ${({ theme }) =>
        theme.colors.variants.secondary.base} !important;
      filter: brightness(103%);
    }
    &:hover {
      background: ${({ theme }) =>
        theme.colors.variants.secondary.base} !important;
      filter: brightness(106%);
    }
  }
`

export default ContentManagerToolbar
