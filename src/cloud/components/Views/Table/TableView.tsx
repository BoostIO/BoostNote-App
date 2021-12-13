import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedView } from '../../../interfaces/db/view'
import {
  isStaticPropCol,
  sortTableViewColumns,
  ViewTableData,
} from '../../../lib/views/table'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useTableView } from '../../../lib/hooks/views/tableView'
import { buildSmartViewQueryCheck } from '../../../lib/smartViews'
import { docToDataTransferItem, getDocTitle } from '../../../lib/utils/patterns'
import {
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../../design/lib/utils/array'
import { useModal } from '../../../../design/lib/stores/modal'
import { useRouter } from '../../../lib/router'
import { useCloudDnd } from '../../../lib/hooks/sidebar/useCloudDnd'
import { DraggedTo } from '../../../../design/lib/dnd'
import { StyledContentManagerList } from '../../ContentManager/styled'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import ColumnSettingsContext from './ColSettingsContext'
import { getDocLinkHref } from '../../Link/DocLink'
import NavigationItem from '../../../../design/components/molecules/Navigation/NavigationItem'
import { mdiFileDocumentOutline, mdiPlus } from '@mdi/js'
import DocTagsList from '../../DocPage/DocTagsList'
import { getFormattedBoosthubDateTime } from '../../../lib/date'
import PropPicker from '../../Props/PropPicker'
import TableAddPropertyContext from './TableAddPropertyContext'
import EmptyRow from '../../ContentManager/Rows/EmptyRow'
import {
  getIconPathOfPropType,
  getInitialPropDataOfPropType,
} from '../../../lib/props'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'
import Table from '../../../../design/components/organisms/Table'
import Icon from '../../../../design/components/atoms/Icon'
import FormToggableInput from '../../../../design/components/molecules/Form/atoms/FormToggableInput'
import { lngKeys } from '../../../lib/i18n/types'
import { useI18n } from '../../../lib/hooks/useI18n'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import Button from '../../../../design/components/atoms/Button'
import TableViewPropertiesContext from './TableViewPropertiesContext'
import { isArray } from 'lodash'
import TitleColumnSettingsContext from './TitleColumnSettingsContext'

type TableViewProps = {
  view: SerializedView<ViewTableData>
  docs: SerializedDocWithSupplemental[]
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
}

const TableView = ({
  view,
  docs,
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
}: TableViewProps) => {
  const currentStateRef = useRef(view.data)
  const [state, setState] = useState<ViewTableData>(
    Object.assign({}, view.data as ViewTableData)
  )
  const { translate } = useI18n()
  const { createDoc } = useCloudApi()
  const { openContextModal, closeAllModals } = useModal()
  const { push } = useRouter()

  const {
    dropInDocOrFolder,
    saveDocTransferData,
    clearDragTransferData,
  } = useCloudDnd()

  const { actionsRef } = useTableView({
    view,
    state,
    selectNewView: selectViewId,
  })

  const filteredDocs = useMemo(() => {
    if (state.filter == null || state.filter.length === 0) {
      return docs
    }

    return docs.filter(buildSmartViewQueryCheck(state.filter))
  }, [state.filter, docs])

  const columns = useMemo(() => {
    return view.data.columns || {}
  }, [view.data.columns])

  const orderedColumns = useMemo(() => {
    return sortTableViewColumns(columns)
  }, [columns])

  const orderedDocs = useMemo(() => {
    const docs = filteredDocs.map((doc) => {
      return {
        ...doc,
        title: getDocTitle(doc, 'untitled'),
      }
    })
    const sort = state.sort
    switch (sort?.type) {
      case 'column':
        const ordered = docs.slice().sort((docA, docB): number => {
          const propA = docA.props[sort.columnName]
          const propB = docB.props[sort.columnName]

          const propAIsEmpty =
            propA == null ||
            propA.data == null ||
            (typeof propA.data === 'string' && propA.data.length === 0) ||
            (isArray(propA) && propA.length === 0)
          const propAIsInvalid = propAIsEmpty || propA.type !== sort.columnType

          const propBIsEmpty =
            propB == null ||
            propB.data == null ||
            (typeof propB.data === 'string' && propB.data.length === 0) ||
            (isArray(propB) && propB.length === 0)
          const propBIsInvalid = propBIsEmpty || propB.type !== sort.columnType

          if (propAIsInvalid && propBIsInvalid) {
            if (propAIsEmpty && !propBIsEmpty) {
              return 1
            } else if (!propAIsEmpty && propBIsEmpty) {
              return -1
            }

            return docA.createdAt.localeCompare(docB.createdAt)
          } else if (propAIsInvalid && !propBIsInvalid) {
            return 1
          } else if (!propAIsInvalid && propBIsInvalid) {
            return -1
          } else {
            try {
              switch (sort.columnType) {
                case 'number': {
                  const compareResult = propA.data - propB.data
                  return sort.direction === 'asc'
                    ? compareResult
                    : -compareResult
                }
                case 'status': {
                  const compareResult = propA.data.name
                    .trim()
                    .localeCompare(propB.data.name)
                  return sort.direction === 'asc'
                    ? compareResult
                    : -compareResult
                }
                case 'string':
                default: {
                  const compareResult = propA.data
                    .toString()
                    .trim()
                    .localeCompare(propB.data.toString().trim())

                  return sort.direction === 'asc'
                    ? compareResult
                    : -compareResult
                }
              }
            } catch (error) {
              console.warn('Failed to sort', sort, propA, propB)
              console.warn(error)

              return docA.createdAt.localeCompare(docB.createdAt)
            }
          }
        })

        return ordered
      case 'static-prop':
      default:
        const direction = sort?.direction != null ? sort?.direction : 'asc'
        switch (sort?.propertyName) {
          case 'title':
            return direction === 'asc'
              ? sortByAttributeAsc('title', docs)
              : sortByAttributeDesc('title', docs)
          case 'label':
            const docFirstTagTupleList = docs.map((doc) => {
              const tagArray = doc.tags.slice().sort((tagA, tagB) => {
                return tagA.text.trim().localeCompare(tagB.text.trim())
              })
              return [doc, tagArray[0]?.text.trim()] as [
                SerializedDocWithSupplemental,
                string | undefined
              ]
            })
            docFirstTagTupleList.sort(
              ([docA, firstTagTextOfDocA], [docB, firstTagTextOfDocB]) => {
                const firstTagTextOfDocAIsEmpty =
                  firstTagTextOfDocA == null || firstTagTextOfDocA.length === 0
                const firstTagTextOfDocBIsEmpty =
                  firstTagTextOfDocB == null || firstTagTextOfDocB.length === 0

                if (firstTagTextOfDocAIsEmpty && firstTagTextOfDocBIsEmpty) {
                  return docA.createdAt.localeCompare(docB.createdAt)
                } else if (
                  firstTagTextOfDocAIsEmpty &&
                  !firstTagTextOfDocBIsEmpty
                ) {
                  return 1
                } else if (
                  !firstTagTextOfDocAIsEmpty &&
                  firstTagTextOfDocBIsEmpty
                ) {
                  return -1
                } else {
                  return firstTagTextOfDocA!.localeCompare(firstTagTextOfDocB!)
                }
              }
            )

            return docFirstTagTupleList.map(([doc]) => doc)
          case 'update_date':
            return direction === 'asc'
              ? sortByAttributeAsc('updatedAt', docs)
              : sortByAttributeDesc('updatedAt', docs)
          case 'creation_date':
          default:
            return direction === 'asc'
              ? sortByAttributeAsc('createdAt', docs)
              : sortByAttributeDesc('createdAt', docs)
        }
    }
  }, [filteredDocs, state.sort])

  const selectingAllDocs = useMemo(() => {
    return (
      filteredDocs.length > 0 &&
      filteredDocs.every((doc) => hasDocInSelection(doc.id))
    )
  }, [filteredDocs, hasDocInSelection])

  const selectAllDocs = useCallback(() => {
    filteredDocs.forEach((doc) => addDocInSelection(doc.id))
  }, [filteredDocs, addDocInSelection])

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

  useEffect(() => {
    currentStateRef.current = Object.assign({}, view.data)
  }, [view.data])

  useEffect(() => {
    setState(Object.assign({}, view.data as ViewTableData))
  }, [view.data])

  return (
    <Container className='view view--table'>
      <StyledContentManagerList>
        <div id={`portal-anchor-${view.id}`} />
        <Flexbox justifyContent='space-between' alignItems='center'>
          {viewsSelector}
          <Flexbox flex='0 0 auto'>
            <Button
              variant='transparent'
              onClick={(event) =>
                openContextModal(
                  event,
                  <TableViewPropertiesContext
                    view={view}
                    teamId={team.id}
                    columns={view.data.columns}
                    currentUserIsCoreMember={currentUserIsCoreMember}
                    setColumns={actionsRef.current.setColumns}
                  />,
                  {
                    width: 250,
                    removePadding: true,
                  }
                )
              }
            >
              Properties
            </Button>
          </Flexbox>
        </Flexbox>
        <Table
          allRowsAreSelected={selectingAllDocs}
          selectAllRows={
            selectingAllDocs ? resetDocsInSelection : selectAllDocs
          }
          showCheckboxes={currentUserIsCoreMember}
          cols={[
            {
              id: 'doc-title',
              children: <Flexbox style={{ height: '100%' }}>Documents</Flexbox>,
              width: 300,
              onClick: (ev: any) =>
                openContextModal(
                  ev,
                  <TitleColumnSettingsContext
                    updateTableSort={actionsRef.current.updateTableSort}
                    close={closeAllModals}
                  />,
                  {
                    width: 250,
                    hideBackground: true,
                    removePadding: true,
                    alignment: 'bottom-left',
                  }
                ),
            },
            ...orderedColumns.map((col) => {
              const icon = getIconPathOfPropType(col.id.split(':').pop() as any)
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
                      updateTableSort={actionsRef.current.updateTableSort}
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
              checked: hasDocInSelection(doc.id),
              onCheckboxToggle: () => toggleDocInSelection(doc.id),
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
      </StyledContentManagerList>
    </Container>
  )
}

const Container = styled.div`
  display: block;
  width: 100%;
  position: relative;

  .table {
    flex: 0 0 auto;
  }

  .content__manager__list__header--margin {
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px !important;
  }

  .item__property__button.item__property__button--empty
    .item__property__button__label {
    display: none;
  }

  .property--errored {
    justify-content: center;
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

export default TableView
