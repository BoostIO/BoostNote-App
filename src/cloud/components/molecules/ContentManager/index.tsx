import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
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
import { StyledContentManagerList } from './styled'
import Checkbox from '../../atoms/Checkbox'
import { SerializedTeam } from '../../../interfaces/db/team'
import { CustomSelectOption } from '../../atoms/Select/CustomSelect'
import SortingOption, { sortingOrders } from './SortingOption'
import ContentManagerDocRow from './Rows/ContentManagerDocRow'
import ContentmanagerFolderRow from './Rows/ContentManagerFolderRow'
import { difference } from 'ramda'
import ContentManagerToolbar from './ContentManagerToolbar'
import Button from '../../../../shared/components/atoms/Button'
import styled from '../../../../shared/lib/styled'
import { usePreferences } from '../../../lib/stores/preferences'
import EmptyRow from './Rows/EmptyRow'
import cc from 'classcat'
import ContentManagerRow from './Rows/ContentManagerRow'
import { lngKeys } from '../../../lib/i18n/types'
import { useI18n } from '../../../lib/hooks/useI18n'
import ContentManagerCell from './ContentManagerCell'
import Flexbox from '../../../../shared/components/atoms/Flexbox'
import ContentManagerStatusFilter from './ContentManagerStatusFilter'
import VerticalScroller from '../../../../shared/components/atoms/VerticalScroller'

export type ContentManagerParent =
  | { type: 'folder'; item: SerializedFolderWithBookmark }
  | { type: 'workspace'; item: SerializedWorkspace }

type ContentTab = 'all' | 'folders' | 'docs'

interface ContentManagerProps {
  team: SerializedTeam
  documents: SerializedDocWithBookmark[]
  folders?: SerializedFolderWithBookmark[]
  workspacesMap: Map<string, SerializedWorkspace>
  currentUserIsCoreMember: boolean
  currentWorkspaceId?: string
  currentFolderId?: string
  page?: 'archive' | 'tag' | 'shared'
}

const ContentManager = ({
  team,
  documents,
  folders,
  page,
  workspacesMap,
  currentUserIsCoreMember,
}: ContentManagerProps) => {
  const { preferences, setPreferences } = usePreferences()
  const [contentTab, setContentTab] = useState<ContentTab>('all')
  const [order, setOrder] = useState<typeof sortingOrders[number]['data']>(
    preferences.folderSortingOrder
  )
  const { translate } = useI18n()

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
      (folders || []).map((folder) => [folder.id, folder])
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
    const newMap = new Map((folders || []).map((folder) => [folder.id, folder]))
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
    if (folders == null) {
      return []
    }

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

  const selectingAllDocs = useMemo(() => {
    return orderedDocs.length > 0 && orderedDocs.every((doc) => hasDoc(doc.id))
  }, [orderedDocs, hasDoc])

  const selectingAllFolders = useMemo(() => {
    return (
      orderedFolders.length > 0 &&
      orderedFolders.every((folder) => hasFolder(folder.id))
    )
  }, [orderedFolders, hasFolder])

  const selectingAllItems =
    (selectingAllDocs && selectingAllFolders) ||
    (orderedFolders.length === 0 && selectingAllDocs) ||
    (orderedDocs.length === 0 && selectingAllFolders)

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

  return (
    <Container>
      <VerticalScroller className='cm__scroller'>
        <StyledContentManagerHeader>
          <div className='header__left'>
            {currentUserIsCoreMember && (
              <Checkbox
                checked={selectingAllItems}
                disabled={orderedDocs.length + orderedFolders.length === 0}
                className={cc([
                  'header__left__checkbox',
                  selectingAllItems && 'header__left__checkbox--checked',
                ])}
                onChange={selectingAllItems ? unselectAllItems : selectAllItems}
              />
            )}

            <Button
              variant='transparent'
              active={contentTab === 'all'}
              onClick={() => setContentTab('all')}
            >
              {translate(lngKeys.GeneralAll)}
            </Button>
            <Button
              variant='transparent'
              active={contentTab === 'folders'}
              onClick={() => setContentTab('folders')}
            >
              {translate(lngKeys.GeneralFolders)}
            </Button>
            <Button
              variant='transparent'
              active={contentTab === 'docs'}
              onClick={() => setContentTab('docs')}
            >
              {translate(lngKeys.GeneralDocuments)}
            </Button>
          </div>

          <div className='header__right'>
            <SortingOption value={order} onChange={onChangeOrder} />
          </div>
        </StyledContentManagerHeader>
        <StyledContentManagerList>
          {(contentTab === 'all' || contentTab === 'folders') && (
            <>
              <ContentManagerRow
                label={translate(lngKeys.GeneralFolders)}
                checked={selectingAllFolders}
                onSelect={selectingAllFolders ? resetFolders : selectAllFolders}
                showCheckbox={currentUserIsCoreMember}
                type='header'
              />

              {orderedFolders.map((folder) => (
                <ContentmanagerFolderRow
                  folder={folder}
                  key={folder.id}
                  team={team}
                  updating={updating.includes(getFolderId(folder))}
                  setUpdating={setUpdating}
                  checked={hasFolder(folder.id)}
                  onSelect={() => toggleFolder(folder.id)}
                  currentUserIsCoreMember={currentUserIsCoreMember}
                />
              ))}

              {orderedFolders.length === 0 && <EmptyRow label='No Folders' />}
            </>
          )}
          {(contentTab === 'all' || contentTab === 'docs') && (
            <>
              <ContentManagerRow
                label={translate(lngKeys.GeneralDocuments)}
                checked={selectingAllDocs}
                onSelect={selectingAllDocs ? resetDocs : selectAllDocs}
                showCheckbox={currentUserIsCoreMember}
                type='header'
                className={cc([
                  folders != null &&
                    contentTab === 'all' &&
                    'content__manager__list__header--margin',
                ])}
              >
                <ContentManagerCell>
                  {translate(lngKeys.Assignees)}
                </ContentManagerCell>
                <ContentManagerCell>
                  <Flexbox justifyContent='space-between' flex='1 1 auto'>
                    <span>{translate(lngKeys.GeneralStatus)}</span>
                    <ContentManagerStatusFilter
                      statusFilterSet={statusFilterSet}
                      setStatusFilterSet={setStatusFilterSet}
                    />
                  </Flexbox>
                </ContentManagerCell>
                <ContentManagerCell>
                  {translate(lngKeys.DueDate)}
                </ContentManagerCell>
              </ContentManagerRow>
              {orderedDocs.map((doc) => (
                <ContentManagerDocRow
                  doc={doc}
                  key={doc.id}
                  workspace={workspacesMap.get(doc.workspaceId)}
                  team={team}
                  updating={updating.includes(getDocId(doc))}
                  setUpdating={setUpdating}
                  checked={hasDoc(doc.id)}
                  onSelect={() => toggleDoc(doc.id)}
                  showPath={page != null}
                  currentUserIsCoreMember={currentUserIsCoreMember}
                />
              ))}
              {orderedDocs.length === 0 && <EmptyRow label='No Documents' />}
            </>
          )}
        </StyledContentManagerList>
      </VerticalScroller>

      {currentUserIsCoreMember && (
        <ContentManagerToolbar
          selectedDocs={selectedDocSet}
          selectedFolders={selectedFolderSet}
          documentsMap={currentDocumentsRef.current}
          foldersMap={currentFoldersRef.current}
          workspacesMap={workspacesMap}
          team={team}
          updating={updating}
          setUpdating={setUpdating}
        />
      )}
    </Container>
  )
}

export default React.memo(ContentManager)

const Container = styled.div`
  display: block;
  width: 100%;
  position: relative;
  height: 100%;

  .content__manager__list__header--margin {
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px !important;
  }

  .cm__scroller {
    height: 100%;
  }
`

export const StyledContentManagerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.sizes.spaces.l}px;
  padding-right: 0;
  height: 40px;

  button {
    font-size: ${({ theme }) => theme.sizes.fonts.md}px !important;
    text-transform: uppercase !important;
  }

  .header__left {
    display: flex;
    align-items: center;
  }
  .header__right {
    display: flex;
    align-items: center;
  }
  .header__left__checkbox {
    margin-right: 5px;
    opacity: 0;
    &.header__left__checkbox--checked {
      opacity: 1;
    }
  }

  &:hover {
    .header__left__checkbox {
      opacity: 1;
    }
  }
`
