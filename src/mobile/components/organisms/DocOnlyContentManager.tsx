import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { SerializedDocWithSupplemental } from '../../../cloud/interfaces/db/doc'
import { useSet } from 'react-use'
import {
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../cloud/lib/utils/array'
import { getDocTitle, getDocId } from '../../../cloud/lib/utils/patterns'
import { SerializedWorkspace } from '../../../cloud/interfaces/db/workspace'
import {
  StyledContentManager,
  StyledContentManagerList,
} from '../../../cloud/components/ContentManager/styled'
import { SerializedTeam } from '../../../cloud/interfaces/db/team'
import SortingOption, {
  sortingOrders,
} from '../../../cloud/components/ContentManager/SortingOption'
import Spinner from '../../../design/components/atoms/Spinner'
import ContentManagerDocRow from '../molecules/ContentManagerDocRow'
import { difference } from 'ramda'
import { usePreferences } from '../../lib/preferences'
import { StyledContentManagerHeader } from '../../../cloud/components/ContentManager'
import EmptyRow from '../../../cloud/components/ContentManager/Rows/EmptyRow'
import cc from 'classcat'
import MobileContentManagerBulkActions from '../molecules/MobileContentManagerBulkActions'
import { FormSelectOption } from '../../../design/components/molecules/Form/atoms/FormSelect'
import Checkbox from '../../../design/components/molecules/Form/atoms/FormCheckbox'

interface DocOnlyContentManagerProps {
  team: SerializedTeam
  documents: SerializedDocWithSupplemental[]
  workspacesMap: Map<string, SerializedWorkspace>
  currentUserIsCoreMember: boolean
  page?: 'archive' | 'tag' | 'shared' | 'smart-folder'
}

const DocOnlyContentManager = ({
  team,
  documents,
  page,
  workspacesMap,
  currentUserIsCoreMember,
}: DocOnlyContentManagerProps) => {
  const { preferences, setPreferences } = usePreferences()
  const [sending] = useState<boolean>(false)
  const [order, setOrder] = useState<typeof sortingOrders[number]['value']>(
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
    new Map<string, SerializedDocWithSupplemental>(
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
    (val: FormSelectOption) => {
      setOrder(val.value)
      setPreferences({ folderSortingOrder: val.value as any })
    },
    [setPreferences]
  )

  const selectingAllDocs = useMemo(() => {
    return orderedDocs.length > 0 && orderedDocs.every((doc) => hasDoc(doc.id))
  }, [orderedDocs, hasDoc])

  return (
    <StyledContentManager>
      {currentUserIsCoreMember && (
        <StyledContentManagerHeader>
          <div className='header__left'>
            <Checkbox
              checked={selectingAllDocs}
              disabled={orderedDocs.length === 0}
              className={cc([
                'header__left__checkbox',
                selectingAllDocs && 'header__left__checkbox--checked',
              ])}
              toggle={selectingAllDocs ? resetDocs : selectAllDocs}
            />
            <MobileContentManagerBulkActions
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
      )}
      <StyledContentManagerList>
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
      </StyledContentManagerList>
    </StyledContentManager>
  )
}

export default DocOnlyContentManager
