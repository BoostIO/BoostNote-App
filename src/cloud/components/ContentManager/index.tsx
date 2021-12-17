import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import { useSet } from 'react-use'
import { sortByAttributeAsc, sortByAttributeDesc } from '../../lib/utils/array'
import { docToDataTransferItem, getDocTitle } from '../../lib/utils/patterns'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { StyledContentManagerList } from './styled'
import { SerializedTeam } from '../../interfaces/db/team'
import SortingOption, { sortingOrders } from './SortingOption'
import { difference } from 'ramda'
import ContentManagerToolbar from './ContentManagerToolbar'
import styled from '../../../design/lib/styled'
import { usePreferences } from '../../lib/stores/preferences'
import EmptyRow from './Rows/EmptyRow'
import { lngKeys } from '../../lib/i18n/types'
import { useI18n } from '../../lib/hooks/useI18n'
import { useCloudDnd } from '../../lib/hooks/sidebar/useCloudDnd'
import { DraggedTo } from '../../../design/lib/dnd'
import Scroller from '../../../design/components/atoms/Scroller'
import { FormSelectOption } from '../../../design/components/molecules/Form/atoms/FormSelect'
import ListViewItem from '../Views/List/ListViewItem'
import { mdiFileDocumentOutline } from '@mdi/js'
import { getDocLinkHref } from '../Link/DocLink'
import { useRouter } from '../../lib/router'
import ListViewHeader from '../Views/List/ListViewHeader'

interface ContentManagerProps {
  team: SerializedTeam
  documents: SerializedDocWithSupplemental[]
  folders?: SerializedFolderWithBookmark[]
  workspacesMap: Map<string, SerializedWorkspace>
  currentUserIsCoreMember: boolean
  currentWorkspaceId?: string
  currentFolderId?: string
  page?: string
}

const ContentManager = ({
  team,
  documents,
  folders,
  workspacesMap,
  currentUserIsCoreMember,
}: ContentManagerProps) => {
  const { preferences, setPreferences } = usePreferences()
  const [order, setOrder] = useState<typeof sortingOrders[number]['value']>(
    preferences.folderSortingOrder
  )
  const { translate } = useI18n()
  const { push } = useRouter()

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

  const selectingAllDocs = useMemo(() => {
    return orderedDocs.length > 0 && orderedDocs.every((doc) => hasDoc(doc.id))
  }, [orderedDocs, hasDoc])

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

  const {
    dropInDocOrFolder,
    saveDocTransferData,
    clearDragTransferData,
  } = useCloudDnd()

  const onDragStartDoc = useCallback(
    (event: any, doc: SerializedDocWithSupplemental) => {
      saveDocTransferData(event, doc)
    },
    [saveDocTransferData]
  )

  const onDropDoc = useCallback(
    (event: any, doc: SerializedDocWithSupplemental) =>
      dropInDocOrFolder(
        event,
        { type: 'doc', resource: docToDataTransferItem(doc) },
        DraggedTo.beforeItem
      ),
    [dropInDocOrFolder]
  )

  const onDragEnd = useCallback(
    (event: any) => {
      clearDragTransferData(event)
    },
    [clearDragTransferData]
  )

  return (
    <Container>
      <Scroller className='cm__scroller'>
        <StyledContentManagerHeader>
          <div className='header__left' />
          <div className='header__right'>
            <SortingOption value={order} onChange={onChangeOrder} />
          </div>
        </StyledContentManagerHeader>
        <StyledContentManagerList>
          <ListViewHeader
            label={translate(lngKeys.GeneralDocuments)}
            checked={selectingAllDocs}
            onSelect={selectingAllDocs ? resetDocs : selectAllDocs}
            showCheckbox={currentUserIsCoreMember}
          />
          {orderedDocs.map((doc) => {
            const { id } = doc
            const href = getDocLinkHref(doc, team, 'index')
            return (
              <ListViewItem
                id={id}
                key={doc.id}
                checked={hasDoc(doc.id)}
                onSelect={() => toggleDoc(doc.id)}
                showCheckbox={currentUserIsCoreMember}
                label={doc.title}
                defaultIcon={mdiFileDocumentOutline}
                emoji={doc.emoji}
                labelHref={href}
                labelOnclick={() => push(href)}
                onDrop={(ev) => onDropDoc(ev, doc)}
                onDragEnd={onDragEnd}
                onDragStart={(ev) => onDragStartDoc(ev, doc)}
                hideOrderingHandle={true}
              />
            )
          })}
          {orderedDocs.length === 0 && <EmptyRow label='No Documents' />}
        </StyledContentManagerList>
      </Scroller>

      {currentUserIsCoreMember && (
        <ContentManagerToolbar
          propsColumns={[]}
          selectedDocs={selectedDocSet}
          selectedFolders={new Set()}
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
