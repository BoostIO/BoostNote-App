import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { useSet } from 'react-use'
import {
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../lib/utils/array'
import { getDocTitle, getDocId, getFolderId } from '../../../lib/utils/patterns'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import {
  StyledContentManager,
  StyledContentManagerHeaderRow,
  StyledContentManagerList,
} from './styled'
import Flexbox from '../../atoms/Flexbox'
import Checkbox from '../../atoms/Checkbox'
import { SerializedTeam } from '../../../interfaces/db/team'
import { CustomSelectOption } from '../../atoms/Select/CustomSelect'
import SortingOption, { sortingOrders } from './SortingOption'
import { Spinner } from '../../atoms/Spinner'
import Selector, { SeletorAction } from './Selector'
import cc from 'classcat'
import ContentmanagerDocRow from './Rows/ContentManagerDocRow'
import ContentmanagerFolderRow from './Rows/ContentManagerFolderRow'
import { difference } from 'ramda'
import ContentManagerArchivesBulkActions from './Actions/ContentManagerArchivesBulkActions'
import ContentManagerBulkActions from './Actions/ContentManagerBulkActions'
import Tooltip from '../../atoms/Tooltip'

export type ContentManagerParent =
  | { type: 'folder'; item: SerializedFolderWithBookmark }
  | { type: 'workspace'; item: SerializedWorkspace }

interface ContentManagerProps {
  team: SerializedTeam
  documents: SerializedDocWithBookmark[]
  folders: SerializedFolderWithBookmark[]
  workspacesMap: Map<string, SerializedWorkspace>
  page?: 'archive' | 'tag' | 'shared'
}

const ContentManager = ({
  team,
  documents,
  folders,
  page,
  workspacesMap,
}: ContentManagerProps) => {
  const [sending] = useState<boolean>(false)
  const [order, setOrder] = useState<typeof sortingOrders[number]['data']>(
    'Latest Updated'
  )
  const [showArchived, setShowArchived] = useState<boolean>(page === 'archive')
  const [
    selectedFolderSet,
    {
      add: addFolder,
      has: hasFolder,
      toggle: toggleFolder,
      reset: resetFolders,
      remove: removeFolder,
    },
  ] = useSet<string>(new Set())
  const [
    selectedDocSet,
    {
      add: addDoc,
      has: hasDoc,
      toggle: toggleDoc,
      remove: removeDoc,
      reset: resetDocs,
    },
  ] = useSet<string>(new Set())
  const currentDocumentsRef = useRef(
    new Map<string, SerializedDocWithBookmark>(
      documents.map((doc) => [doc.id, doc])
    )
  )
  const currentFoldersRef = useRef(
    new Map<string, SerializedFolderWithBookmark>(
      folders.map((folder) => [folder.id, folder])
    )
  )
  const [updating, setUpdating] = useState<string[]>([])

  useEffect(() => {
    const newMap = new Map(documents.map((doc) => [doc.id, doc]))
    const idsToClean: string[] = difference(
      [...currentDocumentsRef.current.keys()],
      [...newMap.keys()]
    )
    idsToClean.forEach(removeDoc)
    currentDocumentsRef.current = newMap
  }, [documents, removeDoc])

  useEffect(() => {
    const newMap = new Map(folders.map((folder) => [folder.id, folder]))
    const idsToClean: string[] = difference(
      [...currentFoldersRef.current.keys()],
      [...newMap.keys()]
    )
    idsToClean.forEach(removeFolder)
    currentFoldersRef.current = newMap
  }, [folders, removeFolder])

  const orderedDocs = useMemo(() => {
    const filteredDocs = documents
      .filter(
        (doc) =>
          doc.archivedAt == null || (showArchived && doc.archivedAt != null)
      )
      .map((doc) => {
        return {
          ...doc,
          title: getDocTitle(doc, 'untitled'),
        }
      })
    switch (order) {
      case 'Title A-Z':
        return sortByAttributeAsc('title', filteredDocs)
      case 'Title Z-A':
        return sortByAttributeDesc('title', filteredDocs)
      case 'Latest Updated':
      default:
        return sortByAttributeDesc('updatedAt', filteredDocs)
    }
  }, [order, documents, showArchived])

  const orderedFolders = useMemo(() => {
    switch (order) {
      case 'Title A-Z':
        return sortByAttributeAsc('name', folders)
      case 'Title Z-A':
        return sortByAttributeDesc('name', folders)
      case 'Latest Updated':
      default:
        return sortByAttributeDesc('updatedAt', folders)
    }
  }, [order, folders])

  const onGlobalcheckboxClick = useCallback(() => {
    if (selectedFolderSet.size + selectedDocSet.size !== 0) {
      resetDocs()
      resetFolders()
      return
    }

    orderedDocs.forEach((doc) => addDoc(doc.id))
    orderedFolders.forEach((folder) => addFolder(folder.id))
  }, [
    orderedDocs,
    orderedFolders,
    selectedFolderSet,
    selectedDocSet,
    resetDocs,
    resetFolders,
    addDoc,
    addFolder,
  ])

  const onToggleDisplayArchived = useCallback(
    (val: boolean) => {
      if (!val) {
        documents.forEach((doc) => {
          if (doc.archivedAt != null) {
            removeDoc(doc.id)
          }
        })
      }
      setShowArchived(val)
    },
    [removeDoc, documents]
  )

  const selectAll = useCallback(
    (type?: 'docs' | 'folders') => {
      switch (type) {
        case 'folders':
          orderedFolders.forEach((folder) => addFolder(folder.id))
          break
        case 'docs':
          orderedDocs.forEach((doc) => addDoc(doc.id))
          break
        default:
          orderedDocs.forEach((doc) => addDoc(doc.id))
          orderedFolders.forEach((folder) => addFolder(folder.id))
          break
      }

      return
    },
    [addDoc, addFolder, orderedDocs, orderedFolders]
  )

  const SelectArchivedDocuments = useCallback(() => {
    setShowArchived(true)
    documents
      .filter((doc) => doc.archivedAt != null)
      .forEach((doc) => addDoc(doc.id))
  }, [addDoc, documents])

  const selectorActions: SeletorAction[] = useMemo(() => {
    const actions: SeletorAction[] = []
    actions.push({ label: 'All', onClick: selectAll })
    actions.push({
      label: 'All folders',
      onClick: () => selectAll('folders'),
      disabled: orderedFolders.length === 0,
    })
    actions.push({
      label: 'All documents',
      onClick: () => selectAll('docs'),
      disabled: orderedDocs.length === 0,
    })
    actions.push({
      label: 'All archived documents',
      onClick: SelectArchivedDocuments,
      disabled: documents.filter((doc) => doc.archivedAt != null).length === 0,
    })
    return actions
  }, [
    SelectArchivedDocuments,
    selectAll,
    orderedDocs.length,
    orderedFolders.length,
    documents,
  ])

  const onChangeOrder = useCallback((val: CustomSelectOption) => {
    setOrder(val.data)
  }, [])

  return (
    <StyledContentManager>
      <StyledContentManagerHeaderRow>
        <Flexbox justifyContent='space-between' wrap='wrap'>
          <Flexbox flex={'0 0 auto'} style={{ height: 30 }}>
            <Tooltip tooltip='select'>
              <Selector
                checked={
                  orderedDocs.length + orderedFolders.length !== 0 &&
                  selectedFolderSet.size + selectedDocSet.size ===
                    orderedDocs.length + orderedFolders.length
                }
                disabled={orderedDocs.length + orderedFolders.length === 0}
                className={cc([
                  selectedFolderSet.size + selectedDocSet.size !== 0 &&
                    'reducer',
                ])}
                onChange={onGlobalcheckboxClick}
                actions={selectorActions}
              />
            </Tooltip>
            {page === 'archive' ? (
              <ContentManagerArchivesBulkActions
                team={team}
                selectedDocs={selectedDocSet}
                documentsMap={currentDocumentsRef.current}
                updating={updating}
                setUpdating={setUpdating}
              />
            ) : (
              <ContentManagerBulkActions
                selectedDocs={selectedDocSet}
                selectedFolders={selectedFolderSet}
                documentsMap={currentDocumentsRef.current}
                foldersMap={currentFoldersRef.current}
                workspacesMap={workspacesMap}
                team={team}
                updating={updating}
                setUpdating={setUpdating}
                setShowArchived={setShowArchived}
              />
            )}
          </Flexbox>
          <Flexbox flex={'0 0 auto'}>
            {sending && (
              <Spinner
                className='relative'
                style={{ top: -4, left: 0, marginRight: 10 }}
              />
            )}
            {documents.filter((doc) => doc.archivedAt != null).length !== 0 && (
              <Checkbox
                checked={showArchived}
                onChange={onToggleDisplayArchived}
                label='Archived'
                style={{ fontSize: 13 }}
              />
            )}
            <SortingOption value={order} onChange={onChangeOrder} />
          </Flexbox>
        </Flexbox>
      </StyledContentManagerHeaderRow>
      <StyledContentManagerList>
        {orderedFolders.map((folder) => (
          <ContentmanagerFolderRow
            folder={folder}
            key={folder.id}
            team={team}
            updating={updating.includes(getFolderId(folder))}
            setUpdating={setUpdating}
            checked={hasFolder(folder.id)}
            onSelect={() => toggleFolder(folder.id)}
          />
        ))}
        {orderedDocs.map((doc) => (
          <ContentmanagerDocRow
            doc={doc}
            key={doc.id}
            workspace={workspacesMap.get(doc.workspaceId)}
            team={team}
            updating={updating.includes(getDocId(doc))}
            setUpdating={setUpdating}
            checked={hasDoc(doc.id)}
            onSelect={() => toggleDoc(doc.id)}
            showPath={page != null}
          />
        ))}
      </StyledContentManagerList>
    </StyledContentManager>
  )
}

export default ContentManager
