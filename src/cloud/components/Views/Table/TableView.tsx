import { mdiFileDocumentOutline, mdiTrashCanOutline } from '@mdi/js'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button, {
  LoadingButton,
} from '../../../../design/components/atoms/Button'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Table from '../../../../design/components/organisms/Table'
import { useModal } from '../../../../design/lib/stores/modal'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedView } from '../../../interfaces/db/view'
import { buildSmartViewQueryCheck } from '../../../lib/smartViews'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import {
  getIconPathOfPropType,
  getInitialPropDataOfPropType,
} from '../../../lib/props'
import { getArrayFromRecord } from '../../../lib/utils/array'
import { getDocTitle } from '../../../lib/utils/patterns'
import {
  Column,
  ColumnMoveType,
  getColumnOrderAfterMove,
  isStaticPropCol,
  sortTableViewColumns,
  ViewTableData,
} from '../../../lib/views/table'
import PropPicker from '../../Props/PropPicker'
import TablePropertiesContext from './TablePropertiesContext'
import TableAddPropertyContext from './TableAddPropertyContext'
import Icon from '../../../../design/components/atoms/Icon'
import NavigationItem from '../../../../design/components/molecules/Navigation/NavigationItem'
import { getDocLinkHref } from '../../Link/DocLink'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useRouter } from '../../../lib/router'
import ColumnSettingsContext from './ColSettingsContext'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'
import DocTagsList from '../../DocPage/DocTagsList'
import { getFormattedBoosthubDateTime } from '../../../lib/date'

type TableViewProps = {
  view: SerializedView
  docs: SerializedDocWithSupplemental[]
  currentUserIsCoreMember: boolean
  viewsSelector: React.ReactNode
  filterButton: React.ReactNode
  team: SerializedTeam
}

const TableView = ({
  view,
  docs,
  currentUserIsCoreMember,
  viewsSelector,
  filterButton,
  team,
}: TableViewProps) => {
  const { sendingMap, deleteViewApi, updateViewApi } = useCloudApi()
  const { openContextModal, closeAllModals } = useModal()
  const { push } = useRouter()
  const [state, setState] = useState<ViewTableData>(
    Object.assign({}, view.data as ViewTableData)
  )

  const currentStateRef = useRef(view.data)
  useEffect(() => {
    currentStateRef.current = Object.assign({}, view.data)
  }, [view.data])

  const columns: Record<string, Column> = useMemo(() => {
    return (state as ViewTableData).columns || {}
  }, [state])

  const filteredDocs = useMemo(() => {
    if (state.filter == null || state.filter.length === 0) {
      return docs
    }

    return docs.filter(buildSmartViewQueryCheck(state.filter))
  }, [state.filter, docs])

  const addColumn = useCallback(
    (col: Column) => {
      if (
        getArrayFromRecord(state.columns).findIndex(
          (val) => val.name === col.name
        ) !== -1
      ) {
        return
      }

      const newState = Object.assign(state, {
        columns: Object.assign(state.columns, { [col.id]: col }),
      })
      return updateViewApi(view, {
        data: newState,
      })
    },
    [state, updateViewApi, view]
  )

  const removeColumn = useCallback(
    (col: Column) => {
      const newColumns = Object.assign(state.columns)
      delete newColumns[col.id]
      const newState = Object.assign(state, {
        columns: newColumns,
      })
      return updateViewApi(view, {
        data: newState,
      })
    },
    [state, updateViewApi, view]
  )

  const moveColumn = useCallback(
    (column: Column, move: ColumnMoveType) => {
      const newState = Object.assign(state, {
        columns: Object.assign(state.columns, {
          [column.id]: {
            ...column,
            order: getColumnOrderAfterMove(columns, column.id, move),
          },
        }),
      })

      if (newState.columns[column.id].order === column.order) {
        return
      }

      return updateViewApi(view, {
        data: newState,
      })
    },
    [columns, state, updateViewApi, view]
  )

  const actionsRef = useRef({ addColumn, removeColumn, moveColumn })

  useEffect(() => {
    actionsRef.current = {
      moveColumn: moveColumn,
      addColumn: addColumn,
      removeColumn: removeColumn,
    }
  }, [removeColumn, addColumn, moveColumn])

  useEffect(() => {
    setState(Object.assign({}, view.data as ViewTableData))
  }, [view.data])

  const orderedColumns = useMemo(() => {
    return sortTableViewColumns(columns)
  }, [columns])

  return (
    <Container>
      <Flexbox
        justifyContent='space-between'
        alignItems='end'
        className='views__header'
      >
        {viewsSelector}
        <Flexbox flex='0 0 auto'>
          {filterButton}
          <Button
            variant='transparent'
            disabled={Object.keys(columns).length === 0}
            onClick={(ev) =>
              openContextModal(
                ev,
                <TablePropertiesContext
                  columns={columns}
                  removeColumn={actionsRef.current.removeColumn}
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
          <LoadingButton
            spinning={sendingMap.get(view.id.toString()) === 'delete'}
            disabled={sendingMap.get(view.id.toString()) != null}
            variant='icon'
            iconPath={mdiTrashCanOutline}
            onClick={() => deleteViewApi(view)}
          />
        </Flexbox>
      </Flexbox>
      <div id={`portal-anchor-${view.id}`} />
      <Table
        cols={[
          {
            id: 'doc-title',
            children: 'Title',
            width: 300,
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
        rows={filteredDocs.map((doc) => {
          const docLink = getDocLinkHref(doc, team, 'index')
          return {
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
    </Container>
  )
}

const Container = styled.div`
  width: 100%;

  .views__header {
    width: 100%;
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

  .item__property__button,
  .react-datepicker-wrapper {
    width: 100%;
    border-radius: 0 !important;
  }

  .item__property__button {
    padding: ${({ theme }) => theme.sizes.spaces.md}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .static__dates {
    height: 100%;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .doc__tags__icon {
    display: none;
  }
`

export default TableView
