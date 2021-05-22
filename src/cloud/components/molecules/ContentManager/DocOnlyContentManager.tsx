import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { useSet } from 'react-use'
import {
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../lib/utils/array'
import { getDocTitle, getDocId } from '../../../lib/utils/patterns'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { StyledContentManager, StyledContentManagerList } from './styled'
import Checkbox from '../../atoms/Checkbox'
import { SerializedTeam } from '../../../interfaces/db/team'
import { CustomSelectOption } from '../../atoms/Select/CustomSelect'
import SortingOption, { sortingOrders } from './SortingOption'
import { Spinner } from '../../atoms/Spinner'
import ContentmanagerDocRow from './Rows/ContentManagerDocRow'
import { difference } from 'ramda'
import DocOnlyContentManagerBulkActions from './Actions/DocOnlyContentManagerBulkActions'
import { usePreferences } from '../../../lib/stores/preferences'
import { StyledContentManagerHeader } from '.'
import EmptyRow from './Rows/EmptyRow'

interface DocOnlyContentManagerProps {
  team: SerializedTeam
  documents: SerializedDocWithBookmark[]
  workspacesMap: Map<string, SerializedWorkspace>
  page?: 'archive' | 'tag' | 'shared'
}

const DocOnlyContentManager = ({
  team,
  documents,
  page,
  workspacesMap,
}: DocOnlyContentManagerProps) => {
  const { preferences, setPreferences } = usePreferences()
  const [sending] = useState<boolean>(false)
  const [order, setOrder] = useState<typeof sortingOrders[number]['data']>(
    preferences.folderSortingOrder
  )

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

  const orderedDocs = useMemo(() => {
    const filteredDocs = documents.map((doc) => {
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
  }, [order, documents])

  const selectAllDocs = useCallback(() => {
    orderedDocs.forEach((doc) => addDoc(doc.id))
  }, [orderedDocs, addDoc])

  const onChangeOrder = useCallback(
    (val: CustomSelectOption) => {
      setOrder(val.data)
      setPreferences({ folderSortingOrder: val.data })
    },
    [setPreferences]
  )

  const selectingAllDocs = useMemo(() => {
    return orderedDocs.every((doc) => hasDoc(doc.id))
  }, [orderedDocs, hasDoc])

  return (
    <StyledContentManager>
      <StyledContentManagerHeader>
        <div className='header__left'>
          <Checkbox
            checked={orderedDocs.length > 0 && selectingAllDocs}
            disabled={orderedDocs.length === 0}
            className='header__left__checkbox'
            onChange={selectingAllDocs ? resetDocs : selectAllDocs}
          />
          <DocOnlyContentManagerBulkActions
            selectedDocs={selectedDocSet}
            documentsMap={currentDocumentsRef.current}
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
      </StyledContentManagerList>
    </StyledContentManager>
  )
}

export default DocOnlyContentManager
