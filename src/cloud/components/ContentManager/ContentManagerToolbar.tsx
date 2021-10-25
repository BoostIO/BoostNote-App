import React, { useState, useCallback, useMemo } from 'react'
import {
  mdiFolderMoveOutline,
  mdiTagMultipleOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import {
  DocStatus,
  SerializedDoc,
  SerializedDocWithSupplemental,
} from '../../interfaces/db/doc'
import { SerializedTeam } from '../../interfaces/db/team'
import { difference } from 'ramda'
import {
  getDocIdFromString,
  getFolderIdFromString,
} from '../../lib/utils/patterns'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import { useDialog, DialogIconTypes } from '../../../design/lib/stores/dialog'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import MoveItemModal from '../Modal/contents/Forms/MoveItemModal'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { LoadingButton } from '../../../design/components/atoms/Button'
import { lngKeys } from '../../lib/i18n/types'
import { useI18n } from '../../lib/hooks/useI18n'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import DocDueDateSelect from '../DocProperties/DocDueDateSelect'
import DocStatusSelect from '../DocProperties/DocStatusSelect'
import ContentManagerToolbarStatusPopup from './ContentManagerToolbarStatusPopup'
import DocAssigneeSelect from '../DocProperties/DocAssigneeSelect'
import DocLabelSelectionModal from '../DocProperties/DocLabelSelectionModal'
import BulkActionProgress, {
  BulkActionState,
} from '../../../design/components/molecules/BulkActionProgress'

interface ContentManagerToolbarProps {
  team: SerializedTeam
  selectedDocs: Set<string>
  documentsMap: Map<string, SerializedDocWithSupplemental>
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
  assigned = 4,
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
  const [
    bulkActionState,
    setBulkActionState,
  ] = useState<BulkActionState | null>(null)

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
        { id: docId, teamId: team.id } as SerializedDocWithSupplemental,
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
      setBulkActionState(() => {
        return {
          jobCount: patternedIds.length,
          jobsCompleted: 0,
        }
      })

      for (const folderId of selectedFolders.values()) {
        await moveSingleFolder(folderId, workspaceId, parentFolderId)
        setBulkActionState((prev) => {
          return {
            jobCount: patternedIds.length,
            jobsCompleted: prev === null ? 0 : prev.jobsCompleted + 1,
          }
        })
      }

      for (const docId of selectedDocs.values()) {
        await moveSingleDoc(docId, workspaceId, parentFolderId)
        setBulkActionState((prev) => {
          return {
            jobCount: patternedIds.length,
            jobsCompleted: prev === null ? 0 : prev.jobsCompleted + 1,
          }
        })
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
      assigned: string[]
      status?: DocStatus
      tags: string[]
      dueDate?: string
    } = { tags: [], assigned: [] }

    if (selectedDocs.size === 0) {
      return values
    }

    const docs = [...selectedDocs.values()].reduce((acc, val) => {
      const doc = documentsMap.get(val)
      if (doc != null) {
        acc.push(doc)
      }
      return acc
    }, [] as SerializedDocWithSupplemental[])

    if (docs.length === 0) {
      return values
    }

    values.assigned =
      docs[0].props.assigned == null
        ? []
        : Array.isArray(docs[0].props.assigned.data)
        ? docs[0].props.assigned.data.map((assignee) => assignee.userId)
        : [docs[0].props.assigned.data.userId]

    values.status =
      docs[0].props.status != null &&
      docs[0].props.status.type === 'string' &&
      !Array.isArray(docs[0].props.status.data)
        ? (docs[0].props.status.data as DocStatus)
        : undefined
    values.tags = (docs[0].tags || []).map((tag) => tag.text)
    values.dueDate =
      docs[0].props.dueDate != null &&
      docs[0].props.dueDate.type === 'date' &&
      !Array.isArray(docs[0].props.dueDate.data)
        ? docs[0].props.dueDate.data.toString()
        : undefined

    docs.forEach((doc) => {
      /** iterative */
      let newAssigneeArray = values.assigned.slice()
      let newTagsArray = values.tags.slice()
      /****/

      const docAssignees =
        doc.props.assigned == null
          ? []
          : Array.isArray(doc.props.assigned.data)
          ? doc.props.assigned.data.map((assignee) => assignee.userId)
          : [doc.props.assigned.data.userId]

      const docTags = (doc.tags || []).map((tag) => tag.text)

      values.assigned.forEach((assignee) => {
        if (!docAssignees.includes(assignee)) {
          newAssigneeArray = newAssigneeArray.filter((val) => val !== assignee)
        }
      })

      values.tags.forEach((tag) => {
        if (!docTags.includes(tag)) {
          newTagsArray = newTagsArray.filter((val) => val !== tag)
        }
      })

      if (
        values.dueDate != null &&
        values.dueDate !== doc.props.dueDate?.data
      ) {
        values.dueDate = undefined
      }

      if (values.status != null && values.status !== doc.props.status?.data) {
        values.status = undefined
      }

      /** changes **/
      values.assigned = newAssigneeArray
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
        const doc = documentsMap.get(docId)
        if (doc == null) {
          continue
        }
        await updateDocDueDateApi(doc, newDate)
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [
      selectedDocs,
      selectedDocsAreUpdating,
      documentsMap,
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
        const doc = documentsMap.get(docId)
        if (doc == null) {
          continue
        }
        await updateDocStatusApi(doc, status)
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [
      selectedDocs,
      selectedDocsAreUpdating,
      documentsMap,
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
      setSending(BulkActions.assigned)
      for (const docId of selectedDocs.values()) {
        const doc = documentsMap.get(docId)
        if (doc == null) {
          continue
        }
        await updateDocAssigneeApi(doc, newAssignees)
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [
      selectedDocs,
      selectedDocsAreUpdating,
      updateDocAssigneeApi,
      setUpdating,
      documentsMap,
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
    <>
      <Container className='cm__toolbar'>
        <div className='cm__toolbar__wrapper'>
          <span className='cm__selection'>
            {selectedDocs.size + selectedFolders.size} selected
          </span>
          {selectedDocs.size > 0 && selectedFolders.size === 0 && (
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
                isLoading={sending === BulkActions.assigned}
                disabled={selectedDocsAreUpdating}
                defaultValue={selectedDocumentsCommonValues.assigned}
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
      {sending === BulkActions.move && (
        <BulkActionProgress bulkActionState={bulkActionState} />
      )}
    </>
  )
}

const Container = styled.div`
  width: fit-content;
  min-height: 40px;
  background: ${({ theme }) => theme.colors.background.secondary};
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  bottom: 6px;
  border-radius: ${({ theme }) => theme.borders.radius}px;
  max-width: 96%;

  .cm__toolbar__wrapper {
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px 0
      ${({ theme }) => theme.sizes.spaces.df}px;
    display: flex;
    align-items: center;
    height: 100%;
    flex: 0 1 auto;
    flex-wrap: wrap;
    justify-content: center !important;
  }

  .cm__toolbar__wrapper > * {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .cm__selection {
    white-space: nowrap;
  }

  .cm__selection,
  .cm__tool {
    min-width: 80px;
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
    width: fit-content !important;
    display: inline-flex;
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
