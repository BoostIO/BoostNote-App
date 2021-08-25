import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ViewProps } from '../../BlockContent'
import { mdiCog, mdiPlus } from '@mdi/js'
import GithubIssueForm from '../../forms/GithubIssueForm'
import {
  alterColumn,
  Column,
  deleteColumn,
  moveColumn,
  parseFrom,
  setCellData,
  syncTo,
} from '../../../../lib/blocks/table'
import TextCell from './TextCell'
import CheckboxCell from './CheckboxCell'
import DateCell from './DateCell'
import GitHubAssigneesCell from './GithubAssigneesCell'
import GithubStatusCell from './GithubStatusCell'
import GithubLabelsCell from './GithubLabelsCell'
import HyperlinkCell from './HyperlinkCell'
import TableSettings from './TableSettings'
import ColumnSettings from './ColumnSettings'
import BoostUserCell from './BoostUserCell'
import { Block, TableBlock } from '../../../../api/blocks'
import { useModal } from '../../../../../design/lib/stores/modal'
import Icon from '../../../../../design/components/atoms/Icon'
import Button from '../../../../../design/components/atoms/Button'
import { isNumberString, isUrlOrPath } from '../../../../lib/utils/string'
import styled from '../../../../../design/lib/styled'
import { StyledUserIcon } from '../../../UserIcon'

type Issue = TableBlock['children'][number]['data']

export interface GithubCellProps {
  data: Issue
  onUpdate: (data: Issue) => Promise<void>
}

export interface CellProps {
  value: string
  onUpdate: (val: string) => Promise<void> | void
}

const TableView = ({ block, actions, realtime }: ViewProps<TableBlock>) => {
  const { openModal, openContextModal, closeAllModals } = useModal()
  const realtimeRef = useRef(realtime.doc.getArray(block.id))
  const [table, setTable] = useState(() => {
    const arr = realtime.doc.getArray(block.id)
    return parseFrom(arr as ArgsType<typeof parseFrom>[0])
  })
  const originRef = useRef({})

  useEffect(() => {
    const yarray = realtime.doc.getArray(block.id)
    const listener: ArgsType<typeof yarray['observeDeep']>[0] = (_ev, tr) => {
      if (tr.origin !== originRef.current) {
        setTable(parseFrom(yarray as ArgsType<typeof parseFrom>[0]))
      }
    }
    yarray.observeDeep(listener)
    realtimeRef.current = yarray
    return () => {
      yarray.unobserveDeep(listener)
    }
  }, [realtime])

  useEffect(() => {
    syncTo(realtimeRef.current as any, table, originRef.current)
  }, [table])

  const openTableSettings: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <TableSettings
          table={table}
          updateTable={(table, shouldClose) => {
            setTable(table)
            if (shouldClose) {
              closeAllModals()
            }
          }}
        />,
        { alignment: 'bottom-right' }
      )
    },
    [openContextModal, table]
  )

  const openColumnSettings = useCallback(
    (ev: React.MouseEvent, col: Column) => {
      openContextModal(
        ev,
        <ColumnSettings
          col={col}
          setColName={(name, col) =>
            setTable((table) => alterColumn({ ...col, name }, table))
          }
          setColDataType={(data_type, col) =>
            setTable((table) => alterColumn({ ...col, data_type }, table))
          }
          deleteCol={(col) => {
            setTable((table) => deleteColumn(col, table))
            closeAllModals()
          }}
          moveColumn={(col, dir) => {
            setTable((table) => {
              const index = table.columns.findIndex(
                (column) => column.id === col.id
              )
              const target = dir === 'left' ? index - 1 : index + 1
              return index > -1 ? moveColumn(target, col, table) : table
            })
          }}
        />,
        { width: 220 }
      )
    },
    []
  )

  const updateIssueBlock = useCallback(
    async (block: Block) => {
      await actions.update(block)
    },
    [actions]
  )

  const importIssues = useCallback(() => {
    openModal(
      <GithubIssueForm
        onSubmit={(issueBlock) => {
          return actions.create(issueBlock, block)
        }}
      />,
      {
        width: 'large',
        showCloseIcon: true,
      }
    )
  }, [openModal, actions, block])

  const updateCell = useCallback((rowId: string, col: Column, data: string) => {
    setTable((table) => setCellData(rowId, col, data, table))
  }, [])

  return (
    <StyledTableView>
      <div className='block__table__view__wrapper'>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              {table.columns.map((col) => (
                <th
                  className='block__table__view--interactable'
                  onClick={(ev) => openColumnSettings(ev, col)}
                >
                  {col.name}
                </th>
              ))}
              <th
                onClick={openTableSettings}
                className='block__table__view--no-borders block__table__view--interactable'
              >
                <Icon path={mdiCog} />
              </th>
            </tr>
          </thead>
          <tbody>
            {block.children.map((child) => {
              return (
                <tr key={child.id}>
                  <td>
                    <div>{child.data.title}</div>
                  </td>
                  {table.columns.map((col) => (
                    <td key={col.id}>
                      <TableCell
                        column={col}
                        row={child}
                        data={table.row_data.get(child.id) || {}}
                        updateCell={updateCell}
                        updateBlock={updateIssueBlock}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className='block__table__view__import'>
        <Button onClick={importIssues} variant='transparent' iconPath={mdiPlus}>
          Import
        </Button>
      </div>
    </StyledTableView>
  )
}

interface TableCellProps {
  column: Column
  row: TableBlock['children'][number]
  data: Record<string, string>
  updateCell: (
    rowId: string,
    column: Column,
    value: string
  ) => Promise<void> | void
  updateBlock: (block: Block) => Promise<void>
}

const TableCell = ({
  column,
  row,
  data,
  updateCell,
  updateBlock,
}: TableCellProps) => {
  const update = useCallback(
    (value: string) => {
      updateCell(row.id, column, value)
    },
    [column, row, updateCell]
  )

  switch (column.data_type) {
    case 'prop':
      return (
        <GithubCell
          prop={column.default || ''}
          data={row.data}
          onUpdate={(data) => updateBlock({ ...row, data })}
        />
      )
    case 'number':
      return (
        <TextCell
          value={data[column.id] || ''}
          onUpdate={update}
          validation={isNumberString}
        />
      )
    case 'date':
      return <DateCell value={data[column.id] || ''} onUpdate={update} />
    case 'url':
      return (
        <TextCell
          value={data[column.id] || ''}
          onUpdate={update}
          validation={isUrlOrPath}
        />
      )
    case 'checkbox':
      return <CheckboxCell value={data[column.id] || ''} onUpdate={update} />
    case 'user':
      return <BoostUserCell value={data[column.id] || ''} onUpdate={update} />
    case 'text':
    default:
      return <TextCell value={data[column.id] || ''} onUpdate={update} />
  }
}

const GithubCell = ({
  prop,
  data,
  onUpdate,
}: GithubCellProps & { prop: string }) => {
  switch (prop) {
    case 'assignees':
      return <GitHubAssigneesCell data={data} onUpdate={onUpdate} />
    case 'owner':
      return data.repository != null ? (
        <div>
          <StyledUserIcon className='subtle'>
            <img
              src={data.repository.owner.avatar_url}
              alt={data.repository.owner.login[0]}
            />
          </StyledUserIcon>
        </div>
      ) : null
    case 'creator':
      return data.user != null ? (
        <div>
          <StyledUserIcon className='subtle'>
            <img src={data.user.avatar_url} alt={data.user.login[0]} />
          </StyledUserIcon>
        </div>
      ) : null
    case 'state':
      return <GithubStatusCell data={data} onUpdate={onUpdate} />
    case 'labels':
      return <GithubLabelsCell data={data} onUpdate={onUpdate} />
    case 'pull_request':
      const url = data?.pull_request?.html_url || ''
      return <HyperlinkCell href={url} label={getPRNumFromUrl(url)} />
    case 'org':
      return data.repository != null && data.repository.organization != null ? (
        <HyperlinkCell
          href={data.repository.organization.html_url}
          label={data.repository.organization.login}
        />
      ) : null
    case 'repo':
      return (
        <HyperlinkCell
          href={data?.repository?.html_url}
          label={data?.repository?.full_name}
        />
      )
    case 'issue_number':
      return <div>#{data.number}</div>
    case 'body':
      return <div>{data.body}</div>
    case 'milestone':
      return (
        <HyperlinkCell
          href={data?.milestone?.html_url || ''}
          label={data?.milestone?.title}
        />
      )
    default:
      return null
  }
}

function getPRNumFromUrl(url: string) {
  const num = url.split('/').pop()
  return num != null && num !== '' ? `#${num}` : url
}

const StyledTableView = styled.div`
  position: relative;

  & .block__table__view--interactable {
    cursor: pointer;
    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }

  & .block__table__view__wrapper {
    width: 100%;
    overflow-x: auto;
  }

  & table {
    width: 100%;
    text-align: left;
    border-collapse: separate;
  }

  & td:first-child,
  th:first-child {
    width: 400px;
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1;
  }

  & td > div {
    height: 100%;
    width: 100%;
  }

  & .block__table__view--no-borders {
    border: none;
  }

  & th {
    color: ${({ theme }) => theme.colors.text.secondary};
    border-top: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  & td {
    min-width: 130px;
    min-height: 20px;
  }

  & td,
  th {
    width: 130px;
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  & .block__table__view__import {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }
`

export default TableView
