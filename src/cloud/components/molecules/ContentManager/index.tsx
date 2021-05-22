import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  FocusEvent,
} from 'react'
import {
  SerializedDocWithBookmark,
  DocStatus,
} from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { useSet } from 'react-use'
import {
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../lib/utils/array'
import { getDocTitle, getDocId, getFolderId } from '../../../lib/utils/patterns'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { StyledContentManager, StyledContentManagerList } from './styled'
import Checkbox from '../../atoms/Checkbox'
import { SerializedTeam } from '../../../interfaces/db/team'
import { CustomSelectOption } from '../../atoms/Select/CustomSelect'
import SortingOption, { sortingOrders } from './SortingOption'
import { Spinner } from '../../atoms/Spinner'
import ContentmanagerDocRow from './Rows/ContentManagerDocRow'
import ContentmanagerFolderRow from './Rows/ContentManagerFolderRow'
import { difference } from 'ramda'
import ContentManagerBulkActions from './Actions/ContentManagerBulkActions'
import { mdiFormatListChecks } from '@mdi/js'
import Button from '../../../../shared/components/atoms/Button'
import styled from '../../../../shared/lib/styled'
import DocStatusIcon from '../../atoms/DocStatusIcon'
import { isChildNode } from '../../../../shared/lib/dom'
import { usePreferences } from '../../../lib/stores/preferences'
import EmptyRow from './Rows/EmptyRow'
import cc from 'classcat'

export type ContentManagerParent =
  | { type: 'folder'; item: SerializedFolderWithBookmark }
  | { type: 'workspace'; item: SerializedWorkspace }

type ContentTab = 'all' | 'folders' | 'docs'

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
  const { preferences, setPreferences } = usePreferences()
  const [sending] = useState<boolean>(false)
  const [contentTab, setContentTab] = useState<ContentTab>('all')
  const [order, setOrder] = useState<typeof sortingOrders[number]['data']>(
    preferences.folderSortingOrder
  )
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

  const [statusFilterSet, setStatusFilterSet] = useState(
    new Set<DocStatus>(['in_progress', 'paused'])
  )

  const orderedDocs = useMemo(() => {
    const filteredDocs = documents
      .filter((doc) => {
        if (doc.status == null) {
          if (doc.archivedAt == null) {
            return true
          }
          return statusFilterSet.has('archived')
        }

        return statusFilterSet.has(doc.status)
      })
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
  }, [order, documents, statusFilterSet])

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

  const toggleStatusFilter = useCallback((status: DocStatus) => {
    setStatusFilterSet((previousSet) => {
      const newSet = new Set(previousSet)
      if (newSet.has(status)) {
        newSet.delete(status)
      } else {
        newSet.add(status)
      }
      return newSet
    })
  }, [])

  const selectingAllDocs = useMemo(() => {
    return orderedDocs.every((doc) => hasDoc(doc.id))
  }, [orderedDocs, hasDoc])

  const selectingAllFolders = useMemo(() => {
    return orderedFolders.every((folder) => hasFolder(folder.id))
  }, [orderedFolders, hasFolder])

  const selectingAllItems = selectingAllDocs && selectingAllFolders

  const selectAllDocs = useCallback(() => {
    orderedDocs.forEach((doc) => addDoc(doc.id))
  }, [orderedDocs, addDoc])

  const selectAllFolders = useCallback(() => {
    orderedFolders.forEach((folder) => addFolder(folder.id))
  }, [orderedFolders, addFolder])

  const selectAllItems = useCallback(() => {
    orderedDocs.forEach((doc) => addDoc(doc.id))
    orderedFolders.forEach((folder) => addFolder(folder.id))
  }, [orderedDocs, orderedFolders, addDoc, addFolder])

  const unselectAllItems = useCallback(() => {
    resetDocs()
    resetFolders()
  }, [resetDocs, resetFolders])

  const onChangeOrder = useCallback(
    (val: CustomSelectOption) => {
      setOrder(val.data)
      setPreferences({ folderSortingOrder: val.data })
    },
    [setPreferences]
  )

  const [
    showingStatusFilterContextMenu,
    setShowingStatusFilterContextMenu,
  ] = useState(false)

  const filterMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (filterMenuRef.current == null) {
      return
    }
    if (!showingStatusFilterContextMenu) {
      return
    }
    filterMenuRef.current.focus()
  }, [showingStatusFilterContextMenu])

  const handleStatusFilterContextMenuBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!isChildNode(event.target, event.relatedTarget as Node)) {
        setShowingStatusFilterContextMenu(false)
      }
    },
    []
  )

  const folderCategoryChecked = orderedFolders.length > 0 && selectingAllFolders
  const documentCategoryChecked = orderedDocs.length > 0 && selectingAllDocs

  return (
    <StyledContentManager>
      <StyledContentManagerHeader>
        <div className='header__left'>
          <Checkbox
            checked={
              orderedDocs.length + orderedFolders.length > 0 &&
              selectingAllItems
            }
            disabled={orderedDocs.length + orderedFolders.length === 0}
            className='header__left__checkbox'
            onChange={selectingAllItems ? unselectAllItems : selectAllItems}
          />

          <Button
            variant='transparent'
            active={contentTab === 'all'}
            onClick={() => setContentTab('all')}
          >
            ALL
          </Button>
          <Button
            variant='transparent'
            active={contentTab === 'folders'}
            onClick={() => setContentTab('folders')}
          >
            FOLDERS
          </Button>
          <Button
            variant='transparent'
            active={contentTab === 'docs'}
            onClick={() => setContentTab('docs')}
          >
            DOCUMENTS
          </Button>

          <ContentManagerBulkActions
            selectedDocs={selectedDocSet}
            selectedFolders={selectedFolderSet}
            documentsMap={currentDocumentsRef.current}
            foldersMap={currentFoldersRef.current}
            workspacesMap={workspacesMap}
            team={team}
            updating={updating}
            setUpdating={setUpdating}
          />
        </div>

        <div className='header__right'>
          {sending && (
            <Spinner
              className='relative'
              style={{ top: -4, left: 0, marginRight: 10 }}
            />
          )}
          <SortingOption value={order} onChange={onChangeOrder} />
        </div>
      </StyledContentManagerHeader>
      <StyledContentManagerList>
        {(contentTab === 'all' || contentTab === 'folders') && (
          <>
            <StyledContentManagerListHeader>
              <Checkbox
                className={cc([
                  'header__checkbox',
                  folderCategoryChecked && 'header__checkbox--checked',
                ])}
                checked={folderCategoryChecked}
                onChange={selectingAllFolders ? resetFolders : selectAllFolders}
              />
              <div className='header__label'>FOLDERS</div>
            </StyledContentManagerListHeader>
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

            {orderedFolders.length === 0 && <EmptyRow label='No Folders' />}
          </>
        )}
        {(contentTab === 'all' || contentTab === 'docs') && (
          <>
            <StyledContentManagerListHeader>
              <Checkbox
                className={cc([
                  'header__checkbox',
                  documentCategoryChecked && 'header__checkbox--checked',
                ])}
                checked={documentCategoryChecked}
                onChange={selectingAllDocs ? resetDocs : selectAllDocs}
              />
              <div className='header__label'>DOCUMENTS</div>
              <div className='header__control'>
                <Button
                  variant='transparent'
                  className='header__control__button'
                  iconPath={mdiFormatListChecks}
                  iconSize={16}
                  onClick={() => setShowingStatusFilterContextMenu(true)}
                />
              </div>
              {showingStatusFilterContextMenu && (
                <div
                  className='header__filter-menu'
                  ref={filterMenuRef}
                  onBlur={handleStatusFilterContextMenuBlur}
                  tabIndex={-1}
                >
                  <div className='header__filter-menu__menu-item'>
                    <Checkbox
                      className='header__filter-menu__menu-item__checkbox'
                      checked={statusFilterSet.has('in_progress')}
                      onChange={() => toggleStatusFilter('in_progress')}
                      label={
                        <div className='header__filter-menu__menu-item__checkbox__label'>
                          <DocStatusIcon
                            className='header__filter-menu__menu-item__checkbox__label__icon'
                            size={16}
                            status='in_progress'
                          />
                          <div className='header__filter-menu__menu-item__checkbox__label__text'>
                            In Progress
                          </div>
                        </div>
                      }
                    />
                  </div>
                  <div className='header__filter-menu__menu-item'>
                    <Checkbox
                      className='header__filter-menu__menu-item__checkbox'
                      checked={statusFilterSet.has('paused')}
                      onChange={() => toggleStatusFilter('paused')}
                      label={
                        <div className='header__filter-menu__menu-item__checkbox__label'>
                          <DocStatusIcon
                            className='header__filter-menu__menu-item__checkbox__label__icon'
                            size={16}
                            status='paused'
                          />
                          <div className='header__filter-menu__menu-item__checkbox__label__text'>
                            Paused
                          </div>
                        </div>
                      }
                    />
                  </div>
                  <div className='header__filter-menu__menu-item'>
                    <Checkbox
                      className='header__filter-menu__menu-item__checkbox'
                      checked={statusFilterSet.has('completed')}
                      onChange={() => toggleStatusFilter('completed')}
                      label={
                        <div className='header__filter-menu__menu-item__checkbox__label'>
                          <DocStatusIcon
                            className='header__filter-menu__menu-item__checkbox__label__icon'
                            size={16}
                            status='completed'
                          />
                          <div className='header__filter-menu__menu-item__checkbox__label__text'>
                            Completed
                          </div>
                        </div>
                      }
                    />
                  </div>
                  <div className='header__filter-menu__menu-item'>
                    <Checkbox
                      className='header__filter-menu__menu-item__checkbox'
                      checked={statusFilterSet.has('archived')}
                      onChange={() => toggleStatusFilter('archived')}
                      label={
                        <div className='header__filter-menu__menu-item__checkbox__label'>
                          <DocStatusIcon
                            className='header__filter-menu__menu-item__checkbox__label__icon'
                            size={16}
                            status='archived'
                          />
                          <div className='header__filter-menu__menu-item__checkbox__label__text'>
                            Archived
                          </div>
                        </div>
                      }
                    />
                  </div>
                </div>
              )}
            </StyledContentManagerListHeader>
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
            {orderedDocs.length === 0 && <EmptyRow label='No Documents' />}
          </>
        )}
      </StyledContentManagerList>
    </StyledContentManager>
  )
}

export default ContentManager

export const StyledContentManagerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  .header__left {
    display: flex;
    align-items: center;
  }
  .header__right {
    display: flex;
    align-items: center;
  }
  .header__left__checkbox {
    margin-right: 8px;
  }
`

export const StyledContentManagerListHeader = styled.div`
  width: 100%;
  height: 24px;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  position: relative;
  padding: 0 8px;
  .header__label {
    flex: 1;
    line-height: 24px;
  }

  .header__checkbox {
    opacity: 0;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;

    &.header__checkbox--checked {
      opacity: 1;
    }
  }

  &:hover {
    .header__checkbox {
      opacity: 1;
    }
  }
  .header__control {
  }

  .header__control__button {
    background-color: transparent;
    height: 24px;
  }

  .header__filter-menu {
    top: 28px;
    right: 4px;
    width: 140px;
    z-index: 1;
    position: absolute;
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: solid 1px ${({ theme }) => theme.colors.border.main};
  }

  .header__filter-menu__menu-item {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 4px;
  }
  .header__filter-menu__menu-item__checkbox {
    height: 100%;
    width: 100%;
  }
  .header__filter-menu__menu-item__checkbox__label {
    display: flex;
    align-items: center;
  }
  .header__filter-menu__menu-item__checkbox__label__icon {
    margin-right: 4px;
  }
`
