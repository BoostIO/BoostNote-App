import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { useSet } from 'react-use'
import {
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../lib/utils/array'
import {
  docToDataTransferItem,
  folderToDataTransferItem,
  getDocTitle,
  getFolderId,
} from '../../../lib/utils/patterns'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedTeam } from '../../../interfaces/db/team'
import { difference } from 'ramda'
import styled from '../../../../design/lib/styled'
import { lngKeys } from '../../../lib/i18n/types'
import { useI18n } from '../../../lib/hooks/useI18n'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import { useCloudDnd } from '../../../lib/hooks/sidebar/useCloudDnd'
import { DraggedTo } from '../../../../design/lib/dnd'
import Scroller from '../../../../design/components/atoms/Scroller'
import Table from '../../../../design/components/organisms/Table'
import { isStaticPropCol, sortTableViewColumns } from '../../../lib/views/table'
import {
  getIconPathOfPropType,
  getInitialPropDataOfPropType,
} from '../../../lib/props'
import Icon from '../../../../design/components/atoms/Icon'
import { useModal } from '../../../../design/lib/stores/modal'
import ColumnSettingsContext from './ColSettingsContext'
import { getDocLinkHref } from '../../Link/DocLink'
import PropPicker from '../../Props/PropPicker'
import DocTagsList from '../../DocPage/DocTagsList'
import { getFormattedBoosthubDateTime } from '../../../lib/date'
import { mdiFileDocumentOutline, mdiPlus } from '@mdi/js'
import NavigationItem from '../../../../design/components/molecules/Navigation/NavigationItem'
import TableAddPropertyContext from './TableAddPropertyContext'
import { TableViewActionsRef } from '../../../lib/hooks/views/tableView'
import { SerializedView } from '../../../interfaces/db/view'
import { useRouter } from '../../../lib/router'
import { StyledContentManagerList } from '../../ContentManager/styled'
import EmptyRow from '../../ContentManager/Rows/EmptyRow'
import ContentManagerToolbar from '../../ContentManager/ContentManagerToolbar'
import Button from '../../../../design/components/atoms/Button'
import TablePropertiesContext from './TablePropertiesContext'
import TableViewContentManagerFolderRow from './TableViewContentManagerFolderRow'
import TableViewContentManagerRow from './TableViewContentManagerRow'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'
import TableContentManagerRow from './TableContentManagerRow'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'
import { usePreferences } from '../../../lib/stores/preferences'
import SortingOption, {
  sortingOrders,
} from '../../ContentManager/SortingOption'
import { FormSelectOption } from '../../../../design/components/molecules/Form/atoms/FormSelect'

interface ContentManagerProps {
  team: SerializedTeam
  documents: SerializedDocWithSupplemental[]
  folders?: SerializedFolderWithBookmark[]
  workspacesMap: Map<string, SerializedWorkspace>
  currentUserIsCoreMember: boolean
  currentWorkspaceId?: string
  currentFolderId?: string
  tableActionsRef: TableViewActionsRef
  view: SerializedView
  page?: string
}

const TableViewContentManager = ({
  team,
  documents,
  folders,
  workspacesMap,
  currentUserIsCoreMember,
  view,
  tableActionsRef: actionsRef,
  currentFolderId,
  currentWorkspaceId,
}: ContentManagerProps) => {
  const { translate } = useI18n()
  const { openContextModal, closeAllModals } = useModal()
  const { openNewFolderForm, openNewDocForm } = useCloudResourceModals()
  const { push } = useRouter()
  const { preferences, setPreferences } = usePreferences()
  const [order, setOrder] = useState<typeof sortingOrders[number]['value']>(
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

  useEffect(() => {
    const newMap = new Map((folders || []).map((folder) => [folder.id, folder]))
    const idsToClean: string[] = difference(
      [...currentFoldersRef.current.keys()],
      [...newMap.keys()]
    )
    idsToClean.forEach(removeFolder)
    currentFoldersRef.current = newMap
  }, [folders, removeFolder])

  const columns = useMemo(() => {
    return view.data.columns || {}
  }, [view.data.columns])

  const orderedColumns = useMemo(() => {
    return sortTableViewColumns(columns)
  }, [columns])

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

  const orderedFolders = useMemo(() => {
    if (folders == null) {
      return []
    }

    return sortByAttributeAsc('name', folders)
  }, [folders])

  const selectingAllDocs = useMemo(() => {
    return orderedDocs.length > 0 && orderedDocs.every((doc) => hasDoc(doc.id))
  }, [orderedDocs, hasDoc])

  const selectingAllFolders = useMemo(() => {
    return (
      orderedFolders.length > 0 &&
      orderedFolders.every((folder) => hasFolder(folder.id))
    )
  }, [orderedFolders, hasFolder])

  const selectAllDocs = useCallback(() => {
    orderedDocs.forEach((doc) => addDoc(doc.id))
  }, [orderedDocs, addDoc])

  const selectAllFolders = useCallback(() => {
    orderedFolders.forEach((folder) => addFolder(folder.id))
  }, [orderedFolders, addFolder])

  const {
    dropInDocOrFolder,
    saveFolderTransferData,
    saveDocTransferData,
    clearDragTransferData,
  } = useCloudDnd()

  const onDragStartFolder = useCallback(
    (event: any, folder: SerializedFolderWithBookmark) => {
      saveFolderTransferData(event, folder)
    },
    [saveFolderTransferData]
  )

  const onDropFolder = useCallback(
    (event, folder: SerializedFolderWithBookmark) =>
      dropInDocOrFolder(
        event,
        { type: 'folder', resource: folderToDataTransferItem(folder) },
        DraggedTo.insideFolder
      ),
    [dropInDocOrFolder]
  )

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

  const onChangeOrder = useCallback(
    (val: FormSelectOption) => {
      setOrder(val.value)
      setPreferences({ folderSortingOrder: val.value as any })
    },
    [setPreferences]
  )

  return (
    <Container>
      <Scroller className='cm__scroller'>
        <StyledContentManagerList>
          <div id={`portal-anchor-${view.id}`} />
          <Flexbox
            justifyContent='flex-end'
            alignItems='end'
            className='views__header'
          >
            <Flexbox flex='0 0 auto'>
              <SortingOption value={order} onChange={onChangeOrder} />
            </Flexbox>
            <Flexbox flex='0 0 auto'>
              <Button
                variant='transparent'
                disabled={Object.keys(columns).length === 0}
                onClick={(ev) =>
                  openContextModal(
                    ev,
                    <TablePropertiesContext
                      columns={columns}
                      tableActionsRef={actionsRef}
                    />,
                    {
                      width: 250,
                      hideBackground: true,
                      removePadding: true,
                      alignment: 'bottom-right',
                    }
                  )
                }
              >
                Columns
              </Button>
            </Flexbox>
          </Flexbox>
          <Table
            allRowsAreSelected={selectingAllDocs}
            selectAllRows={selectingAllDocs ? resetDocs : selectAllDocs}
            showCheckboxes={currentUserIsCoreMember}
            cols={[
              {
                id: 'doc-title',
                children: (
                  <Flexbox style={{ height: '100%' }}>Documents</Flexbox>
                ),
                width: 300,
              },
              ...orderedColumns.map((col) => {
                const icon = getIconPathOfPropType(
                  col.id.split(':').pop() as any
                )
                return {
                  id: col.id,
                  children: (
                    <Flexbox className='th__cell'>
                      {icon != null && (
                        <Icon className='th__cell__icon' path={icon} />
                      )}
                      <span>{col.name}</span>
                    </Flexbox>
                  ),
                  width: 200,
                  onClick: (ev: any) =>
                    openContextModal(
                      ev,
                      <ColumnSettingsContext
                        column={col}
                        removeColumn={actionsRef.current.removeColumn}
                        moveColumn={(type) =>
                          actionsRef.current.moveColumn(col, type)
                        }
                        close={closeAllModals}
                      />,
                      {
                        width: 250,
                        hideBackground: true,
                        removePadding: true,
                        alignment: 'bottom-left',
                      }
                    ),
                }
              }),
            ]}
            rows={orderedDocs.map((doc) => {
              const docLink = getDocLinkHref(doc, team, 'index')
              return {
                checked: hasDoc(doc.id),
                onCheckboxToggle: () => toggleDoc(doc.id),
                onDragStart: (ev) => onDragStartDoc(ev, doc),
                onDragEnd: onDragEnd,
                onDrop: (ev) => onDropDoc(ev, doc),
                cells: [
                  {
                    children: (
                      <NavigationItem
                        labelHref={docLink}
                        labelClick={() => push(docLink)}
                        label={getDocTitle(doc, 'Untitled')}
                        icon={
                          doc.emoji != null
                            ? { type: 'emoji', path: doc.emoji }
                            : { type: 'icon', path: mdiFileDocumentOutline }
                        }
                      />
                    ),
                  },
                  ...orderedColumns.map((col) => {
                    if (isStaticPropCol(col)) {
                      switch (col.prop) {
                        case 'creation_date':
                        case 'update_date':
                          return {
                            children: (
                              <Flexbox className='static__dates'>
                                {getFormattedBoosthubDateTime(
                                  doc[
                                    col.prop === 'creation_date'
                                      ? 'createdAt'
                                      : 'updatedAt'
                                  ]
                                )}
                              </Flexbox>
                            ),
                          }
                        case 'label':
                        default:
                          return {
                            children: (
                              <DocTagsList
                                doc={doc}
                                team={team}
                                readOnly={!currentUserIsCoreMember}
                              />
                            ),
                          }
                      }
                    } else {
                      const propType = col.id.split(':').pop() as any
                      const propName = col.id.split(':')[1]
                      const propData =
                        (doc.props || {})[propName] ||
                        getInitialPropDataOfPropType(propType)

                      const isPropDataAccurate =
                        propData.type === propType ||
                        (propData.type === 'json' &&
                          propData.data.dataType === propType)
                      return {
                        children: (
                          <PropPicker
                            parent={{ type: 'doc', target: doc }}
                            propName={propName}
                            propData={propData}
                            readOnly={
                              !currentUserIsCoreMember || !isPropDataAccurate
                            }
                            isErrored={!isPropDataAccurate}
                            portalId={`portal-anchor-${view.id}`}
                          />
                        ),
                      }
                    }
                  }),
                ],
              }
            })}
            onAddColButtonClick={(ev) =>
              openContextModal(
                ev,
                <TableAddPropertyContext
                  teamId={team.id}
                  view={view}
                  columns={columns}
                  addColumn={actionsRef.current.addColumn}
                  close={closeAllModals}
                />,
                {
                  width: 250,
                  hideBackground: true,
                  removePadding: true,
                  alignment: 'bottom-left',
                }
              )
            }
            disabledAddRow={true}
          />
          {orderedDocs.length === 0 && <EmptyRow label='No Documents' />}
          {currentWorkspaceId != null && (
            <TableContentManagerRow>
              <Button
                className='content__manager--no-padding'
                variant='transparent'
                iconPath={mdiPlus}
                onClick={() =>
                  openNewDocForm(
                    {
                      team,
                      parentFolderId: currentFolderId,
                      workspaceId: currentWorkspaceId,
                    },
                    {
                      skipRedirect: true,
                      precedingRows: [],
                    }
                  )
                }
              >
                {translate(lngKeys.ModalsCreateNewDocument)}
              </Button>
            </TableContentManagerRow>
          )}

          {folders != null && (
            <>
              <TableViewContentManagerRow
                label={translate(lngKeys.GeneralFolders)}
                checked={selectingAllFolders}
                onSelect={selectingAllFolders ? resetFolders : selectAllFolders}
                showCheckbox={currentUserIsCoreMember}
                type='header'
                className='content__manager__list__header--margin'
              />

              {orderedFolders.map((folder) => (
                <TableViewContentManagerFolderRow
                  folder={folder}
                  key={folder.id}
                  team={team}
                  updating={updating.includes(getFolderId(folder))}
                  setUpdating={setUpdating}
                  checked={hasFolder(folder.id)}
                  onSelect={() => toggleFolder(folder.id)}
                  currentUserIsCoreMember={currentUserIsCoreMember}
                  onDrop={onDropFolder}
                  onDragEnd={onDragEnd}
                  onDragStart={onDragStartFolder}
                />
              ))}
              {currentWorkspaceId != null && (
                <TableContentManagerRow className='content__manager--no-border'>
                  <Button
                    className='content__manager--no-padding'
                    onClick={() =>
                      openNewFolderForm(
                        {
                          team,
                          parentFolderId: currentFolderId,
                          workspaceId: currentWorkspaceId,
                        },
                        { skipRedirect: true, precedingRows: [] }
                      )
                    }
                    variant='transparent'
                    iconPath={mdiPlus}
                  >
                    {translate(lngKeys.ModalsCreateNewFolder)}
                  </Button>
                </TableContentManagerRow>
              )}
            </>
          )}
        </StyledContentManagerList>
      </Scroller>

      {currentUserIsCoreMember && (
        <ContentManagerToolbar
          propsColumns={orderedColumns}
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

export default React.memo(TableViewContentManager)

const Container = styled.div`
  display: block;
  width: 100%;
  position: relative;
  height: 100%;

  .table {
    flex: 0 0 auto;
  }

  .content__manager__list__header--margin {
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px !important;
  }

  .cm__scroller {
    height: 100%;
  }

  .content__manager--no-border {
    border: none;
  }

  .content__manager--no-padding {
    padding: 0;
  }

  .item__property__button.item__property__button--empty
    .item__property__button__label {
    display: none;
  }

  .property--errored {
    justify-content: center;
  }

  .views__header {
    width: 100%;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .react-datepicker-popper {
    z-index: 2;
  }

  .navigation__item {
    height: 100%;
  }

  .table__col {
    .th__cell {
      .th__cell__icon {
        margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
        color: ${({ theme }) => theme.colors.text.subtle};
        flex: 0 0 auto;
      }

      span {
        ${overflowEllipsis()}
      }
    }
  }

  .static__dates {
    height: 100%;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .table__row__cell > *,
  .table__row__cell .react-datepicker-wrapper,
  .table__row__cell .react-datepicker__input-container {
    height: 100%;
  }

  .doc__tags__icon {
    display: none;
  }

  .table__col {
    min-height: 46px;
  }
  .table__row__cell {
    min-height: 38px;
    .item__property__button,
    .react-datepicker-wrapper {
      width: 100%;
      border-radius: 0 !important;
    }
    .item__property__button {
      padding: 8px ${({ theme }) => theme.sizes.spaces.sm}px;
      height: 100% !important;
      min-height: 30px;
      border: 0 !important;
    }

    .doc__tags__list__item,
    .doc__tags__create:not(.doc__tags__create--empty) {
      margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px !important;
      margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px !important;
    }
  }

  .doc__tags__wrapper--empty,
  .doc__tags__create--empty {
    height: 100%;
    margin: 0 !important;
    width: 100%;
  }

  .sorting-options__select .form__select__single-value {
    display: flex;
  }
`
