import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedView } from '../../../interfaces/db/view'
import {
  isStaticPropCol,
  sortTableViewColumns,
  ViewTableColumnSortingOption,
  ViewTableData,
  ViewTableSortingOptions,
  ViewTableStaticPropSortingoption,
  ViewTableStaticPropSortingoption as ViewTableStaticPropSortingOption,
} from '../../../lib/views/table'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useTableView } from '../../../lib/hooks/views/tableView'
import { buildSmartViewQueryCheck } from '../../../lib/smartViews'
import { docToDataTransferItem, getDocTitle } from '../../../lib/utils/patterns'
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
import { usePage } from '../../../lib/stores/pageStore'
import { isValid as isValidDate } from 'date-fns'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import { SerializedStatus } from '../../../interfaces/db/status'

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
  const { permissions = [] } = usePage()

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
    const sort = normalizeSort(state.sort)
    const comparator = selectComparator(sort)

    const comparableList = filteredDocs.map((doc) => {
      return mapComparableList(sort, doc)
    })

    return sortByComparator(comparableList, comparator)

    interface ComprableItem {
      doc: SerializedDocWithSupplemental
      compareValue: string | number | Date | null // null means invalid
    }

    function getNullIfEmptyString(value: string) {
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    }

    function mapComparableList(
      sort: ViewTableSortingOptions,
      doc: SerializedDocWithSupplemental
    ): ComprableItem {
      switch (sort.type) {
        case 'static-prop':
          switch (sort.propertyName) {
            case 'title':
              return {
                doc,
                compareValue: getNullIfEmptyString(doc.title),
              }
            case 'label':
              const tags = doc.tags.slice().sort((tagA, tagB) => {
                const tagCompareResult = tagA.text.localeCompare(tagB.text)
                return sort.direction === 'asc'
                  ? tagCompareResult
                  : -tagCompareResult
              })

              return {
                doc,
                compareValue:
                  tags[0] != null ? getNullIfEmptyString(tags[0].text) : null,
              }
            case 'update_date':
              const updatedAt = new Date(doc.updatedAt)
              return {
                doc,
                compareValue: isValidDate(updatedAt) ? updatedAt : null,
              }
            default:
            case 'creation_date':
              const createdAt = new Date(doc.createdAt)
              return {
                doc,
                compareValue: isValidDate(createdAt) ? createdAt : null,
              }
          }
        case 'column':
          const docProp = doc.props[sort.columnName]
          if (docProp == null) {
            return {
              doc,
              compareValue: null,
            }
          }
          switch (sort.columnType) {
            case 'string': {
              const compareValue = isArray(docProp.data)
                ? docProp.data[0]
                : docProp.data
              return {
                doc,
                compareValue:
                  typeof compareValue === 'string'
                    ? getNullIfEmptyString(compareValue)
                    : null,
              }
            }
            case 'date': {
              const rawCompareValue = isArray(docProp.data)
                ? docProp.data[0]
                : docProp.data
              if (rawCompareValue == null) {
                return {
                  doc,
                  compareValue: null,
                }
              }
              const compareValue = new Date(rawCompareValue)
              return {
                doc,
                compareValue: isValidDate(compareValue) ? compareValue : null,
              }
            }
            case 'json':
              return {
                doc,
                compareValue:
                  docProp.data != null ? JSON.stringify(docProp.data) : null,
              }
            case 'number': {
              const compareValue = isArray(docProp.data)
                ? docProp.data[0]
                : docProp.data
              return {
                doc,
                compareValue:
                  typeof compareValue === 'number' ? compareValue : null,
              }
            }
            case 'user':
              let compareValue = null
              if (isArray(docProp.data)) {
                const validPermissions = docProp.data
                  .map((assignedPermission) => {
                    return permissions.find(
                      (permission) =>
                        permission.userId ===
                        (assignedPermission as any)?.userId
                    )
                  })
                  .filter(
                    (permission): permission is SerializedUserTeamPermissions =>
                      permission != null
                  )
                validPermissions.sort((permissionA, permissionB) => {
                  const userADisplayName = permissionA.user.displayName.trim()
                  const userBDisplayName = permissionB.user.displayName.trim()
                  return userADisplayName.localeCompare(userBDisplayName)
                })
                if (sort.direction === 'desc') {
                  validPermissions.reverse()
                }
                compareValue =
                  validPermissions[0] != null
                    ? validPermissions[0].user.displayName
                    : null
              } else {
                const targetPermission = permissions.find(
                  (permission) => permission.userId === docProp.data?.userId
                )

                compareValue =
                  targetPermission != null
                    ? targetPermission.user.displayName
                    : null
              }

              return {
                doc,
                compareValue,
              }
            case 'status': {
              let compareValue = null
              if (isArray(docProp.data)) {
                const statusNames = docProp.data
                  .map((mayBeStatus) => {
                    return (mayBeStatus as SerializedStatus)?.name
                  })
                  .filter((name): name is string => typeof name === 'string')

                statusNames.sort((nameA, nameB) => {
                  return nameA.trim().localeCompare(nameB.trim())
                })

                if (sort.direction === 'desc') {
                  statusNames.reverse()
                }

                compareValue =
                  statusNames[0] != null
                    ? getNullIfEmptyString(statusNames[0])
                    : null
              } else {
                compareValue =
                  typeof docProp.data?.name === 'string'
                    ? getNullIfEmptyString(docProp.data?.name)
                    : null
              }

              return {
                doc,
                compareValue,
              }
            }
          }

          const createdAt = new Date(doc.createdAt)
          return {
            doc,
            compareValue: isValidDate(createdAt) ? createdAt : null,
          }
      }
    }

    /**
     * Valid data(ASC/DESC) -> Invalid data(sorted by createdAt / Always ASC)
     */
    function sortByComparator(
      list: ComprableItem[],
      comparator: (a: any, b: any) => number
    ): SerializedDocWithSupplemental[] {
      return list
        .slice()
        .sort((a, b) => {
          if (a.compareValue == null && b.compareValue == null) {
            return a.doc.createdAt.localeCompare(b.doc.createdAt)
          } else if (a.compareValue == null && b.compareValue != null) {
            return 1
          } else if (a.compareValue != null && b.compareValue == null) {
            return -1
          }
          return comparator(a.compareValue, b.compareValue)
        })
        .map((comparableItem) => comparableItem.doc)
    }

    function selectComparator(
      sort: ViewTableSortingOptions
    ): (a: any, b: any) => number {
      if (
        (sort.type === 'column' &&
          (sort.columnType === 'number' || sort.columnType === 'date')) ||
        (sort.type === 'static-prop' &&
          (sort.propertyName === 'creation_date' ||
            sort.propertyName === 'update_date'))
      ) {
        return (a: any, b: any) => (sort.direction === 'desc' ? b - a : a - b)
      } else {
        return (a: string, b: string) => {
          const compareResult = a.localeCompare(b)

          return sort.direction === 'desc' ? -compareResult : compareResult
        }
      }
    }

    function normalizeSort(sort: unknown) {
      const defaultSort: ViewTableStaticPropSortingOption = {
        type: 'static-prop',
        propertyName: 'creation_date',
        direction: 'asc',
      }

      if (sort == null) {
        return defaultSort
      }
      switch ((sort as ViewTableSortingOptions).type) {
        case 'static-prop':
          const staticPropSort = sort as ViewTableStaticPropSortingOption
          switch (staticPropSort.propertyName) {
            case 'title':
            case 'label':
            case 'creation_date':
            case 'update_date':
              const direction =
                staticPropSort.direction !== 'desc' ? 'asc' : 'desc'

              return {
                type: 'static-prop',
                propertyName: staticPropSort.propertyName,
                direction,
              } as ViewTableStaticPropSortingoption
            default:
              return defaultSort
          }
        case 'column':
          const columnSort = sort as ViewTableColumnSortingOption
          const direction = columnSort.direction !== 'desc' ? 'asc' : 'desc'
          if (columnSort.columnType == null || columnSort.columnName == null) {
            return defaultSort
          }
          return {
            type: 'column',
            direction,
            columnName: columnSort.columnName,
            columnType: columnSort.columnType,
          } as ViewTableColumnSortingOption
        default:
          return defaultSort
      }
    }
  }, [filteredDocs, permissions, state.sort])

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
