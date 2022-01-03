import React, { useCallback, useMemo, useState } from 'react'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedView } from '../../../interfaces/db/view'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useModal } from '../../../../design/lib/stores/modal'
import { useRouter } from '../../../lib/router'
import { useCloudDnd } from '../../../lib/hooks/sidebar/useCloudDnd'
import { StyledContentManagerList } from '../../ContentManager/styled'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import { mdiFileDocumentOutline, mdiPlus } from '@mdi/js'
import FormToggableInput from '../../../../design/components/molecules/Form/atoms/FormToggableInput'
import { lngKeys } from '../../../lib/i18n/types'
import { useI18n } from '../../../lib/hooks/useI18n'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import Button from '../../../../design/components/atoms/Button'
import SortingOption, {
  sortingOrders,
} from '../../ContentManager/SortingOption'
import { usePreferences } from '../../../lib/stores/preferences'
import { FormSelectOption } from '../../../../design/components/molecules/Form/atoms/FormSelect'
import { ViewListData } from '../../../lib/views/list'
import {
  docToDataTransferItem,
  folderToDataTransferItem,
  getDocTitle,
} from '../../../lib/utils/patterns'
import {
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../../design/lib/utils/array'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import ListViewHeader from './ListViewHeader'
import { getFolderHref } from '../../Link/FolderLink'
import { DraggedTo } from '../../../lib/dnd'
import ListViewItem from './ListViewItem'
import { getDocLinkHref } from '../../Link/DocLink'
import ListViewPropertiesContext from './ListViewPropertiesContext'
import { useListView } from '../../../lib/hooks/views/listView'
import ListDocProperties from './ListDocProperties'

type ListViewProps = {
  view: SerializedView<ViewListData>
  docs: SerializedDocWithSupplemental[]
  folders?: SerializedFolderWithBookmark[]
  updating: string[]
  team: SerializedTeam
  currentUserIsCoreMember: boolean
  currentWorkspaceId?: string
  currentFolderId?: string
  viewsSelector: React.ReactNode
  selectViewId: (viewId: number) => void
  addDocInSelection: (key: string) => void
  hasDocInSelection: (key: string) => boolean
  toggleDocInSelection: (key: string) => void
  resetDocsInSelection: () => void
  addFolderInSelection: (key: string) => void
  hasFolderInSelection: (key: string) => boolean
  toggleFolderInSelection: (key: string) => void
  resetFoldersInSelection: () => void
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
}

const ListView = ({
  view,
  docs,
  folders = [],
  currentUserIsCoreMember,
  currentWorkspaceId,
  currentFolderId,
  team,
  viewsSelector,
  selectViewId,
  addDocInSelection,
  hasDocInSelection,
  toggleDocInSelection,
  resetDocsInSelection,
  addFolderInSelection,
  hasFolderInSelection,
  toggleFolderInSelection,
  resetFoldersInSelection,
}: ListViewProps) => {
  const { preferences, setPreferences } = usePreferences()
  const [order, setOrder] = useState<typeof sortingOrders[number]['value']>(
    preferences.folderSortingOrder
  )
  const { translate } = useI18n()
  const { createDoc, createFolder } = useCloudApi()
  const { openContextModal } = useModal()
  const { push } = useRouter()

  const { actionsRef, props: orderedViewProps } = useListView({
    view,
    selectNewView: selectViewId,
  })

  const {
    dropInDocOrFolder,
    saveDocTransferData,
    saveFolderTransferData,
    clearDragTransferData,
  } = useCloudDnd()

  const onChangeOrder = useCallback(
    (val: FormSelectOption) => {
      setOrder(val.value)
      setPreferences({ folderSortingOrder: val.value as any })
    },
    [setPreferences]
  )

  const orderedDocs = useMemo(() => {
    const filteredDocs = docs.map((doc) => {
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
  }, [order, docs])

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

  const selectingAllFolders = useMemo(() => {
    return (
      orderedFolders.length > 0 &&
      orderedFolders.every((folder) => hasFolderInSelection(folder.id))
    )
  }, [orderedFolders, hasFolderInSelection])

  const selectingAllDocs = useMemo(() => {
    return (
      orderedDocs.length > 0 &&
      orderedDocs.every((doc) => hasDocInSelection(doc.id))
    )
  }, [orderedDocs, hasDocInSelection])

  const selectAllFolders = useCallback(() => {
    if (folders == null) {
      return
    }
    folders.forEach((folder) => addFolderInSelection(folder.id))
  }, [folders, addFolderInSelection])

  const selectAllDocs = useCallback(() => {
    if (docs == null) {
      return
    }
    docs.forEach((doc) => addDocInSelection(doc.id))
  }, [docs, addDocInSelection])

  const onDropFolder = useCallback(
    (event, folder: SerializedFolderWithBookmark) =>
      dropInDocOrFolder(
        event,
        { type: 'folder', resource: folderToDataTransferItem(folder) },
        DraggedTo.insideFolder
      ),
    [dropInDocOrFolder]
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

  return (
    <Container className='view view--table'>
      <StyledContentManagerList>
        <div id={`portal-anchor-${view.id}`} />
        <Flexbox justifyContent='space-between' alignItems='center'>
          {viewsSelector}
          <Flexbox flex='0 0 auto'>
            <SortingOption value={order} onChange={onChangeOrder} />
            <Button
              variant='transparent'
              onClick={(event) =>
                openContextModal(
                  event,
                  <ListViewPropertiesContext
                    view={view}
                    teamId={team.id}
                    properties={view.data.props}
                    currentUserIsCoreMember={currentUserIsCoreMember}
                    setProperties={actionsRef.current.setProperties}
                  />,
                  {
                    width: 250,
                    removePadding: true,
                    keepAll: true,
                  }
                )
              }
            >
              Properties
            </Button>
          </Flexbox>
        </Flexbox>
        <ListViewHeader
          label={translate(lngKeys.GeneralDocuments)}
          checked={selectingAllDocs}
          onSelect={selectingAllDocs ? resetDocsInSelection : selectAllDocs}
          showCheckbox={currentUserIsCoreMember}
        />
        {orderedDocs.map((doc) => {
          const { id } = doc
          const href = getDocLinkHref(doc, team, 'index')
          return (
            <ListViewItem
              key={id}
              id={id}
              checked={hasDocInSelection(doc.id)}
              onSelect={() => toggleDocInSelection(doc.id)}
              showCheckbox={currentUserIsCoreMember}
              label={doc.title}
              defaultIcon={mdiFileDocumentOutline}
              emoji={doc.emoji}
              labelHref={href}
              labelOnclick={() => push(href)}
              onDragStart={(event: any) => saveDocTransferData(event, doc)}
              onDragEnd={(event: any) => clearDragTransferData(event)}
              onDrop={(event: any) => onDropDoc(event, doc)}
              hideOrderingHandle={true}
            >
              <ListDocProperties
                doc={doc}
                props={orderedViewProps}
                team={team}
                currentUserIsCoreMember={currentUserIsCoreMember}
              />
            </ListViewItem>
          )
        })}
        {currentWorkspaceId != null && (
          <div className='content__manager__add-row'>
            <FormToggableInput
              label={translate(lngKeys.ModalsCreateNewDocument)}
              variant='transparent'
              iconPath={mdiPlus}
              submit={(val: string) =>
                createDoc(
                  team,
                  {
                    title: val,
                    workspaceId: currentWorkspaceId,
                    parentFolderId: currentFolderId,
                  },
                  { skipRedirect: true }
                )
              }
            />
          </div>
        )}
        {currentWorkspaceId != null && (
          <>
            <ListViewHeader
              label={translate(lngKeys.GeneralFolders)}
              checked={selectingAllFolders}
              onSelect={
                selectingAllFolders ? resetFoldersInSelection : selectAllFolders
              }
              showCheckbox={currentUserIsCoreMember}
              className='content__manager__list__header--margin'
            />
            {orderedFolders.map((folder) => {
              const { id } = folder
              const href = getFolderHref(folder, team, 'index')
              return (
                <ListViewItem
                  key={id}
                  id={id}
                  checked={hasFolderInSelection(folder.id)}
                  onSelect={() => toggleFolderInSelection(folder.id)}
                  showCheckbox={currentUserIsCoreMember}
                  label={folder.name}
                  emoji={folder.emoji}
                  labelHref={href}
                  labelOnclick={() => push(href)}
                  onDragStart={(event: any) =>
                    saveFolderTransferData(event, folder)
                  }
                  onDragEnd={(event: any) => clearDragTransferData(event)}
                  onDrop={(event: any) => onDropFolder(event, folder)}
                  hideOrderingHandle={true}
                />
              )
            })}
            <div className='content__manager__add-row'>
              <FormToggableInput
                iconPath={mdiPlus}
                variant='transparent'
                label={translate(lngKeys.ModalsCreateNewFolder)}
                submit={(val: string) =>
                  createFolder(
                    team,
                    {
                      folderName: val,
                      description: '',
                      workspaceId: currentWorkspaceId,
                      parentFolderId: currentFolderId,
                    },
                    { skipRedirect: true }
                  )
                }
              />
            </div>
          </>
        )}
      </StyledContentManagerList>
    </Container>
  )
}

const Container = styled.div`
  display: block;
  width: 100%;
  position: relative;

  .content__manager__list__header--margin {
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px !important;
  }

  .content__manager__add-row {
    border-bottom: 0 !important;
  }
`

export default ListView
