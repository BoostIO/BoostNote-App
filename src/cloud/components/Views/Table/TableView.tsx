import { mdiTrashCanOutline } from '@mdi/js'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button, {
  LoadingButton,
} from '../../../../design/components/atoms/Button'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Table from '../../../../design/components/organisms/Table'
import { useModal } from '../../../../design/lib/stores/modal'
import styled from '../../../../design/lib/styled'
import { TableViewEvent, TableViewEventEmitter } from '../../../../lib/events'
import { SerializedQuery } from '../../../interfaces/db/smartView'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedView } from '../../../interfaces/db/view'
import { buildSmartViewQueryCheck } from '../../../lib/smartViews'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { getInitialPropDataOfProp } from '../../../lib/props'
import { getArrayFromRecord } from '../../../lib/utils/array'
import { getDocTitle } from '../../../lib/utils/patterns'
import { Column, ViewTableData } from '../../../lib/views/table'
import PropPicker from '../../Props/PropPicker'
import TablePropertiesContext from './TablePropertiesContext'

type TableViewProps = {
  view: SerializedView
  docs: SerializedDocWithSupplemental[]
  currentUserIsCoreMember: boolean
  viewsSelector: React.ReactNode
  filterButton: React.ReactNode
}

const TableView = ({
  view,
  docs,
  currentUserIsCoreMember,
  viewsSelector,
  filterButton,
}: TableViewProps) => {
  const { sendingMap, deleteViewApi, updateViewApi } = useCloudApi()
  const { openContextModal } = useModal()
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

  const setFilters = useCallback((filters: SerializedQuery) => {
    setState((prev) => {
      return {
        ...prev,
        filter: filters as SerializedQuery,
      }
    })
  }, [])

  const filteredDocs = useMemo(() => {
    if (state.filter == null || state.filter.length === 0) {
      return docs
    }

    return docs.filter(buildSmartViewQueryCheck(state.filter))
  }, [state.filter, docs])

  const addColumn = useCallback(
    (col: Column) => {
      if (
        getArrayFromRecord(columns).findIndex(
          (val) => val.name === col.name
        ) !== -1
      ) {
        return
      }
      setState((prev) => {
        return {
          ...prev,
          columns: Object.assign(columns, { [col.id]: col }),
        }
      })
    },
    [columns]
  )

  const removeColumn = useCallback(
    (col: Column) => {
      if (columns[col.id] == null) {
        return
      }

      setState((prev) => {
        const newCols = Object.assign(columns)
        delete newCols[col.id]
        return {
          ...prev,
          columns: newCols,
        }
      })
    },
    [columns]
  )

  const actionsRef = useRef({ addColumn, removeColumn, setFilters })
  useEffect(() => {
    actionsRef.current = {
      addColumn: addColumn,
      removeColumn: removeColumn,
      setFilters,
    }
  }, [removeColumn, addColumn, setFilters])

  useEffect(() => {
    setState(Object.assign({}, view.data as ViewTableData))
  }, [view.data])

  useEffect(() => {
    const saveEventHandler = (event: TableViewEvent) => {
      if (event.detail.target !== view.id.toString()) {
        return
      }
      switch (event.detail.type) {
        case 'save':
          return updateViewApi(view, {
            data: state,
          })
        default:
          return
      }
    }

    TableViewEventEmitter.listen(saveEventHandler)
    return () => {
      TableViewEventEmitter.unlisten(saveEventHandler)
    }
  }, [state, updateViewApi, view])

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
            onClick={(ev) =>
              openContextModal(
                ev,
                <TablePropertiesContext
                  columns={columns}
                  addColumn={actionsRef.current.addColumn}
                  removeColumn={actionsRef.current.removeColumn}
                />,
                {
                  width: 250,
                  hideBackground: true,
                  removePadding: true,
                  alignment: 'bottom-right',
                  onClose: () =>
                    TableViewEventEmitter.dispatch({
                      type: 'save',
                      target: view.id.toString(),
                    }),
                }
              )
            }
          >
            Properties
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
            name: 'Title',
            width: 300,
          },
          ...getArrayFromRecord(columns).map((col) => {
            return {
              id: col.id,
              name: col.name,
              width: 200,
            }
          }),
        ]}
        rows={filteredDocs.map((doc) => {
          return {
            cells: [
              { children: getDocTitle(doc, 'Untitled') },
              ...getArrayFromRecord(columns).map((col) => {
                const propName = col.id.split(':')[1]
                return {
                  children: (
                    <PropPicker
                      parent={{ type: 'doc', target: doc }}
                      propName={propName}
                      propData={
                        (doc.props || {})[propName] ||
                        getInitialPropDataOfProp(propName)
                      }
                      readOnly={!currentUserIsCoreMember}
                      portalId={`portal-anchor-${view.id}`}
                    />
                  ),
                }
              }),
            ],
          }
        })}
        disabledAddColumn={true}
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
`

export default TableView
