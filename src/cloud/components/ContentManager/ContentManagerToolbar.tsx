import React, { useState, useCallback, useMemo } from 'react'
import {
  mdiFolderMoveOutline,
  mdiTagMultipleOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import {
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
import DocDueDateSelect from '../Props/Pickers/DatePropPicker'
import DocAssigneeSelect from '../Props/Pickers/AssigneeSelect'
import DocLabelSelectionModal from '../Props/Pickers/DocLabelSelectionModal'
import BulkActionProgress, {
  BulkActionState,
} from '../../../design/components/molecules/BulkActionProgress'
import {
  Column,
  getPropTypeFromColId,
  isStaticPropCol,
} from '../../lib/views/table'
import {
  FilledSerializedPropData,
  PropData,
  PropSubType,
  PropType,
} from '../../interfaces/db/props'
import { isPropFilled } from '../../lib/props'
import TimePeriodPicker from '../Props/Pickers/TimePeriodPicker'
import StatusSelect from '../Props/Pickers/StatusSelect'
import { SerializedStatus } from '../../interfaces/db/status'

interface ContentManagerToolbarProps {
  team: SerializedTeam
  selectedDocs: Set<string>
  documentsMap: Map<string, SerializedDocWithSupplemental>
  foldersMap: Map<string, SerializedFolderWithBookmark>
  workspacesMap: Map<string, SerializedWorkspace>
  selectedFolders: Set<string>
  updating: string[]
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
  propsColumns: Column[]
}

const ContentManagerToolbar = ({
  propsColumns,
  team,
  selectedDocs,
  selectedFolders,
  documentsMap,
  foldersMap,
  updating,
  setUpdating,
}: ContentManagerToolbarProps) => {
  const [sending, setSending] = useState<string>()
  const {
    updateDoc,
    updateFolder,
    deleteFolderApi,
    deleteDocApi,
    updateDocPropsApi,
    updateDocTagsBulkApi,
  } = useCloudApi()
  const { translate } = useI18n()
  const { messageBox } = useDialog()
  const { openModal, openContextModal, closeAllModals } = useModal()
  const [bulkActionState, setBulkActionState] =
    useState<BulkActionState | null>(null)

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
      setSending('move')
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
            setSending('delete')
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
    const values: Record<
      string,
      | { type: PropType; subType?: PropSubType; value: any }
      | { type: 'static'; prop: 'label'; value: string[] }
    > = {
      tags: {
        type: 'static',
        prop: 'label',
        value: [],
      },
    }

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

    values.tags.value = (docs[0].tags || []).map((tag) => tag.text)
    const props = docs[0].props || {}
    Object.keys(props).forEach((key) => {
      if (!isPropFilled(props[key])) {
        return
      }

      const docProp = props[key] as FilledSerializedPropData
      switch (docProp.type) {
        case 'json':
          if (docProp.data.dataType === 'timeperiod') {
            values[key] = {
              type: docProp.type,
              subType: 'timeperiod',
              value: docProp.data.data,
            }
          }
          break
        case 'user':
          values[key] = {
            type: docProp.type,
            value:
              docProp.data == null
                ? []
                : Array.isArray(docProp.data)
                ? docProp.data.map((assignee) => assignee.userId)
                : [docProp.data.userId],
          }
          break
        case 'status':
          values[key] = {
            type: docProp.type,
            value:
              docProp.data == null
                ? undefined
                : Array.isArray(docProp.data)
                ? docProp.data[0]
                : docProp.data,
          }
          break
        case 'number':
        case 'date':
        case 'string':
          values[key] = {
            type: docProp.type,
            value: docProp.data,
          }
          break
        default:
          break
      }
    })

    docs.forEach((doc) => {
      /** iterative */
      let newTagsArray = values['tags']['value'].slice()
      /****/

      const docTags = (doc.tags || []).map((tag) => tag.text)
      values.tags.value.forEach((tag: string) => {
        if (!docTags.includes(tag)) {
          newTagsArray = newTagsArray.filter((val: string) => val !== tag)
        }
      })
      values.tags.value = newTagsArray

      const props = doc.props || {}
      Object.keys(values).forEach((key) => {
        if (key === 'tags') {
          return
        }

        if (
          props[key] == null ||
          !isPropFilled(props[key]) ||
          props[key].type !== values[key].type
        ) {
          delete values[key]
          return
        }

        const docProp = props[key] as FilledSerializedPropData
        switch (docProp.type) {
          case 'json':
            if (
              docProp.data.dataType !== 'timeperiod' ||
              docProp.data.data !== values[key]['value']
            ) {
              delete values[key]
            }
            break
          case 'user':
            {
              let newUserArray = values[key].value.slice() as string[]
              const docUserIds: string[] = Array.isArray(docProp.data)
                ? docProp.data.map((user) => user.userId)
                : [docProp.data.userId]

              ;(values[key].value as string[]).forEach((user: string) => {
                if (!docUserIds.includes(user)) {
                  newUserArray = newUserArray.filter((val) => val !== user)
                }
              })
            }
            break
          case 'status':
            {
              const docPropStatus: SerializedStatus | undefined =
                props[key] == null
                  ? undefined
                  : Array.isArray(props[key].data)
                  ? props[key].data[0]
                  : props[key].data
              if (
                docPropStatus == null ||
                docPropStatus.id !== values[key].value.id
              ) {
                delete values[key]
              }
            }
            break
          case 'number':
          case 'date':
          case 'string':
            if (docProp.data !== values[key]['value']) {
              delete values[key]
            }
            break
          default:
            break
        }
      })
    })

    return values
  }, [selectedDocs, documentsMap])

  const sendTags = useCallback(
    async (newTags: string[]) => {
      closeAllModals()
      if (selectedDocsAreUpdating || selectedDocs.size === 0) {
        return
      }
      const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
      setUpdating((prev) => [...prev, ...patternedIds])
      setSending('label')
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

  const updateProp = useCallback(
    async (prop: [string, PropData | null]) => {
      closeAllModals()
      if (selectedDocsAreUpdating || selectedDocs.size === 0) {
        return
      }
      const patternedIds = [...selectedDocs.values()].map(getDocIdFromString)
      setUpdating((prev) => [...prev, ...patternedIds])
      setSending(prop[0])
      for (const docId of selectedDocs.values()) {
        const doc = documentsMap.get(docId)
        if (doc == null) {
          continue
        }
        const docProps = doc.props || {}
        if (
          docProps != null &&
          docProps[prop[0]] != null &&
          prop[1] != null &&
          docProps[prop[0]].type !== prop[1].type
        ) {
          continue
        }

        await updateDocPropsApi(doc, prop)
      }
      setSending(undefined)
      setUpdating((prev) => difference(prev, patternedIds))
    },
    [
      closeAllModals,
      documentsMap,
      selectedDocs,
      selectedDocsAreUpdating,
      setUpdating,
      updateDocPropsApi,
    ]
  )

  const propsButtons = useMemo(() => {
    const filteredColumns = propsColumns.filter((col) => !isStaticPropCol(col))
    if (filteredColumns.length === 0) {
      return []
    }

    return (
      <>
        {filteredColumns.map((propColumn) => {
          const columnType = getPropTypeFromColId(propColumn.id)
          switch (columnType) {
            case 'status':
              return (
                <StatusSelect
                  key={`cm__toolbar--${propColumn.id}`}
                  emptyLabel={propColumn.name}
                  status={
                    selectedDocumentsCommonValues[propColumn.name] != null
                      ? selectedDocumentsCommonValues[propColumn.name].value
                      : undefined
                  }
                  showIcon={
                    selectedDocumentsCommonValues[propColumn.name] == null
                  }
                  sending={sending === propColumn.name}
                  disabled={selectedDocsAreUpdating}
                  isReadOnly={selectedDocsAreUpdating}
                  popupAlignment='top-left'
                  onStatusChange={(val) =>
                    updateProp([
                      propColumn.name,
                      {
                        type: 'status',
                        data: val == null ? val : val.id,
                      },
                    ])
                  }
                />
              )

            case 'user':
              return (
                <DocAssigneeSelect
                  key={`cm__toolbar--${propColumn.id}`}
                  emptyLabel={propColumn.name}
                  isLoading={sending === propColumn.name}
                  disabled={selectedDocsAreUpdating}
                  defaultValue={
                    selectedDocumentsCommonValues[propColumn.name] != null
                      ? selectedDocumentsCommonValues[propColumn.name].value
                      : []
                  }
                  readOnly={selectedDocsAreUpdating}
                  showIcon={true}
                  popupAlignment='top-left'
                  update={(val: string[]) => {
                    updateProp([
                      propColumn.name,
                      {
                        type: 'user',
                        data: val.length > 0 ? val : null,
                      },
                    ])
                  }}
                />
              )
            case 'date':
              return (
                <DocDueDateSelect
                  key={`cm__toolbar--${propColumn.id}`}
                  emptyLabel={propColumn.name}
                  date={
                    selectedDocumentsCommonValues[propColumn.name] != null
                      ? selectedDocumentsCommonValues[propColumn.name].value
                      : undefined
                  }
                  isReadOnly={selectedDocsAreUpdating}
                  sending={sending === propColumn.name}
                  onDueDateChange={(newDate) => {
                    updateProp([
                      propColumn.name,
                      {
                        type: 'date',
                        data: newDate,
                      },
                    ])
                  }}
                  disabled={selectedDocsAreUpdating}
                />
              )
            case 'timeperiod':
              return (
                <TimePeriodPicker
                  key={`cm__toolbar--${propColumn.id}`}
                  modalLabel={propColumn.name}
                  isReadOnly={selectedDocsAreUpdating}
                  sending={sending === propColumn.name}
                  disabled={selectedDocsAreUpdating}
                  value={
                    selectedDocumentsCommonValues[propColumn.name] != null
                      ? selectedDocumentsCommonValues[propColumn.name].value
                      : undefined
                  }
                  emptyLabel={propColumn.name}
                  onPeriodChange={(val) => {
                    updateProp([
                      propColumn.name,
                      {
                        type: 'json',
                        data: { dataType: 'timeperiod', data: val },
                      },
                    ])
                  }}
                />
              )
            default:
              return null
          }
        })}
      </>
    )
  }, [
    propsColumns,
    selectedDocsAreUpdating,
    selectedDocumentsCommonValues,
    sending,
    updateProp,
  ])

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
              {propsButtons}
              <LoadingButton
                className='cm__tool'
                variant='bordered'
                iconPath={mdiTagMultipleOutline}
                onClick={(event) => {
                  openContextModal(
                    event,
                    <DocLabelSelectionModal
                      selectedTags={
                        selectedDocumentsCommonValues['tags']['value']
                      }
                      sendTags={sendTags}
                    />,
                    {
                      alignment: 'top-left',
                      width: 300,
                    }
                  )
                }}
                disabled={selectedDocsAreUpdating}
                spinning={sending === 'label'}
              >
                {translate(lngKeys.GeneralLabels)}
                {selectedDocumentsCommonValues['tags']['value'].length > 0
                  ? ` (${selectedDocumentsCommonValues['tags']['value'].length})`
                  : null}
              </LoadingButton>
            </>
          )}
          <LoadingButton
            className='cm__tool'
            variant='bordered'
            iconPath={mdiFolderMoveOutline}
            onClick={openMoveForm}
            disabled={selectedDocsAreUpdating || selectedFoldersAreUpdating}
            spinning={sending === 'move'}
          >
            {translate(lngKeys.GeneralMoveVerb)}
          </LoadingButton>
          <LoadingButton
            className='cm__tool'
            variant='bordered'
            iconPath={mdiTrashCanOutline}
            onClick={bulkDeleteCallback}
            disabled={selectedDocsAreUpdating || selectedFoldersAreUpdating}
            spinning={sending === 'delete'}
          >
            {translate(lngKeys.GeneralDelete)}
          </LoadingButton>
        </div>
      </Container>
      {sending === 'move' && (
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

  .item__due-date__select,
  .item__status__select,
  .item__assignee__select {
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
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px !important;
  }

  .item__status__select {
    height: 32px !important;
  }

  .item__property__button {
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
