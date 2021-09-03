import React, { useCallback, useEffect, useRef } from 'react'
import { ViewProps } from '../'
import { mdiCog, mdiPlus } from '@mdi/js'
import GithubIssueForm from '../../forms/GithubIssueForm'
import {
  Column,
  getColumnName,
  getDataPropColProp,
  isDataPropCol,
} from '../../../../lib/blocks/table'
import TextProp from '../../props/TextProp'
import CheckboxProp from '../../props/CheckboxProp'
import DateProp from '../../props/DateProp'
import GitHubAssigneesData from '../../data/GithubAssigneesData'
import GithubStatusData from '../../data/GithubStatusData'
import GithubLabelsData from '../../data/GithubLabelsData'
import HyperlinkProp from '../../props/HyperlinkProp'
import TableSettings from './TableSettings'
import ColumnSettings from './ColumnSettings'
import BoostUserProp from '../../props/BoostUserProp'
import { Block, TableBlock } from '../../../../api/blocks'
import { useModal } from '../../../../../design/lib/stores/modal'
import Icon from '../../../../../design/components/atoms/Icon'
import Button from '../../../../../design/components/atoms/Button'
import {
  capitalize,
  isNumberString,
  isUrlOrPath,
} from '../../../../lib/utils/string'
import styled from '../../../../../design/lib/styled'
import { StyledUserIcon } from '../../../UserIcon'
import { BlockDataProps } from '../../data/types'
import { getPropType } from '../../../../lib/blocks/props'
import { useBlockTable } from '../../../../lib/hooks/useBlockTable'
import BlockIcon from '../../BlockIcon'
import BlockProp from '../../props'

type GithubCellProps = BlockDataProps<TableBlock['children'][number]>

const TableView = ({ block, actions, realtime }: ViewProps<TableBlock>) => {
  const { openModal, openContextModal, closeAllModals } = useModal()
  const { state, actions: tableActions } = useBlockTable(block, realtime.doc)

  const subscriptionsRef = useRef<Set<(col: Column[]) => void>>(new Set())
  useEffect(() => {
    for (const subscription of subscriptionsRef.current) {
      subscription(state.columns)
    }
  }, [state.columns])

  const tableActionsRef = useRef(tableActions)
  useEffect(() => {
    tableActionsRef.current = tableActions
  }, [tableActions])

  const openTableSettings: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <TableSettings
          columns={state.columns}
          subscribe={(fn) => {
            subscriptionsRef.current.add(fn)
            return () => subscriptionsRef.current.delete(fn)
          }}
          addColumn={(col, shouldClose) => {
            tableActionsRef.current.addColumn(col)
            if (shouldClose) {
              closeAllModals()
            }
          }}
          deleteColumn={(col, shouldClose) => {
            tableActionsRef.current.deleteColumn(col)
            if (shouldClose) {
              closeAllModals()
            }
          }}
        />,
        { alignment: 'bottom-right' }
      )
    },
    [openContextModal, closeAllModals, state.columns]
  )

  const openColumnSettings = useCallback(
    (ev: React.MouseEvent, col: Column) => {
      openContextModal(
        ev,
        <ColumnSettings
          col={col}
          setColName={(col, name) =>
            tableActionsRef.current.renameColumn(col, name)
          }
          setColDataType={(col, type) =>
            tableActionsRef.current.setColumnType(col, type)
          }
          deleteCol={(col) => {
            tableActionsRef.current.deleteColumn(col)
            closeAllModals()
          }}
          moveColumn={(col, dir) =>
            tableActionsRef.current.moveColumn(col, dir)
          }
        />,
        { width: 220 }
      )
    },
    [closeAllModals, openContextModal]
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

  return (
    <StyledTableView>
      <div className='block__table__view__wrapper'>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              {state.columns.map((col) => (
                <th
                  key={col}
                  className='block__table__view--interactable'
                  onClick={(ev) => openColumnSettings(ev, col)}
                >
                  {getColumnName(col)}
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
                    {child.children.map((ancestor) => {
                      return (
                        <div
                          key={ancestor.id}
                          className='block__table__view__child__label'
                        >
                          <BlockIcon block={ancestor} size={16} />
                          <span>{blockTitle(ancestor)}</span>
                        </div>
                      )
                    })}
                  </td>
                  {state.columns.map((col) => (
                    <td key={col}>
                      {isDataPropCol(col) ? (
                        <GithubCell
                          prop={getDataPropColProp(col)}
                          data={child.data}
                          onUpdate={(data) =>
                            updateIssueBlock({ ...child, data })
                          }
                        />
                      ) : (
                        <BlockProp
                          type={getPropType(col)}
                          value={(state.rowData.get(child.id) || {})[col] || ''}
                          onChange={(val) =>
                            tableActions.setCell(child.id, col, val)
                          }
                        />
                      )}
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

const GithubCell = ({
  prop,
  data,
  onUpdate,
}: GithubCellProps & { prop: string }) => {
  switch (prop) {
    case 'assignees':
      return <GitHubAssigneesData data={data} onUpdate={onUpdate} />
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
      return <GithubStatusData data={data} onUpdate={onUpdate} />
    case 'labels':
      return <GithubLabelsData data={data} onUpdate={onUpdate} />
    case 'pull_request':
      const url = data?.pull_request?.html_url || ''
      return <HyperlinkProp href={url} label={getPRNumFromUrl(url)} />
    case 'org':
      return data.repository != null && data.repository.organization != null ? (
        <HyperlinkProp
          href={data.repository.organization.html_url}
          label={data.repository.organization.login}
        />
      ) : null
    case 'repo':
      return (
        <HyperlinkProp
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
        <HyperlinkProp
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

  & .block__table__view__child__label {
    position: relative;
    padding-left: 18px;
    display: flex;
    width: 100%;
    height: 26px;
    white-space: nowrap;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    cursor: pointer;

    align-items: center;
    flex: 1 1 auto;
    background: none;
    outline: 0;
    border: 0;
    text-align: left;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    margin: 0;
    overflow: hidden;

    & > span:first-of-type {
      flex-grow: 1;
    }

    & svg {
      color: ${({ theme }) => theme.colors.text.subtle};
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }
`

function blockTitle(block: Block) {
  switch (block.type) {
    case 'github.issue':
      return block.data.number != null
        ? `#${block.data.number}`
        : 'Github Issue'
    default:
      return capitalize(block.type)
  }
}

export default TableView
