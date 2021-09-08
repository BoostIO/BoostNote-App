import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ViewProps } from '../'
import {
  mdiCog,
  mdiDownloadOutline,
  mdiTrashCan,
  mdiTrashCanOutline,
} from '@mdi/js'
import GithubIssueForm from '../../forms/GithubIssueForm'
import {
  Column,
  getColumnName,
  getDataPropColProp,
  isDataPropCol,
  getDataColumnIcon,
  uniqueIdentifier,
  toPropKey,
  getColType,
} from '../../../../lib/blocks/table'
import GitHubAssigneesData from '../../data/GithubAssigneesData'
import GithubStatusData from '../../data/GithubStatusData'
import GithubLabelsData from '../../data/GithubLabelsData'
import HyperlinkProp from '../../props/HyperlinkProp'
import TableSettings from './TableSettings'
import ColumnSettings from './ColumnSettings'
import { Block, TableBlock } from '../../../../api/blocks'
import { useModal } from '../../../../../design/lib/stores/modal'
import Icon from '../../../../../design/components/atoms/Icon'
import styled from '../../../../../design/lib/styled'
import { StyledUserIcon } from '../../../UserIcon'
import { BlockDataProps } from '../../data/types'
import { useBlockTable } from '../../../../lib/hooks/useBlockTable'
import BlockProp from '../../props'
import Scroller from '../../../../../design/components/atoms/Scroller'
import { getBlockDomId } from '../../../../lib/blocks/dom'
import Flexbox from '../../../../../design/components/atoms/Flexbox'
import BlockLayout from '../../BlockLayout'
import FormInput from '../../../../../design/components/molecules/Form/atoms/FormInput'
import { useDebounce } from 'react-use'
import { blockTitle } from '../../../../lib/utils/blocks'
import BlockIcon from '../../BlockIcon'
import NavigationItem from '../../../../../design/components/molecules/Navigation/NavigationItem'
import {
  BlockEventDetails,
  blockEventEmitter,
} from '../../../../lib/utils/events'

type GithubCellProps = BlockDataProps<TableBlock['children'][number]>
interface TableViewProps extends ViewProps<TableBlock> {
  setCurrentBlock: React.Dispatch<React.SetStateAction<Block | null>>
}

const TableView = ({
  block,
  actions,
  realtime,
  currentUserIsCoreMember,
  sendingMap,
  setCurrentBlock,
}: TableViewProps) => {
  const { openModal, openContextModal, closeAllModals } = useModal()
  const { state, actions: tableActions } = useBlockTable(block, realtime.doc)
  const [tableTitle, setTableTitle] = useState(block.name || '')
  const tableRef = useRef<string>(block.id)
  const titleInputRef = useRef<HTMLInputElement>(null)

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
        onSubmit={async (issueBlock) => {
          await actions.create(issueBlock, block)
          return closeAllModals()
        }}
      />,
      {
        width: 'large',
        showCloseIcon: true,
      }
    )
  }, [openModal, actions, block, closeAllModals])

  const onTableNameChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      readyToBeSentRef.current = true
      setTableTitle(e.target.value)
    },
    []
  )
  const readyToBeSentRef = useRef<boolean>(false)
  const [, cancel] = useDebounce(
    async () => {
      if (readyToBeSentRef.current) {
        await actions.update({
          id: block.id,
          type: block.type,
          name: tableTitle,
        })
        readyToBeSentRef.current = false
      } else {
        cancel()
      }
    },
    1000,
    [tableTitle]
  )

  useEffect(() => {
    if (tableRef.current !== block.id) {
      tableRef.current = block.id
      setTableTitle(block.name)
    }
  }, [block])

  useEffect(() => {
    const handler = ({ detail }: CustomEvent<BlockEventDetails>) => {
      if (detail.blockId !== block.id || detail.blockType !== block.type) {
        return
      }

      switch (detail.event) {
        case 'creation':
          titleInputRef.current?.focus()
          return
        default:
          return
      }
    }
    blockEventEmitter.listen(handler)
    return () => blockEventEmitter.unlisten(handler)
  }, [block])

  const anchorId = `block__${block.id}__table`
  return (
    <BlockLayout
      controls={
        currentUserIsCoreMember
          ? [
              {
                iconPath: mdiCog,
                onClick: openTableSettings,
              },
              {
                iconPath: mdiTrashCanOutline,
                onClick: () => actions.remove(block),
              },
            ]
          : undefined
      }
    >
      <StyledTableView id={getBlockDomId(block)}>
        <FormInput
          placeholder='Untitled'
          value={tableTitle}
          onChange={onTableNameChange}
          className='block__table__title'
          id={getTableBlockInputId(block)}
          disabled={!currentUserIsCoreMember}
          ref={titleInputRef}
        />
        <div id={anchorId} />
        <div className='block__table__view__wrapper'>
          <Scroller>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  {state.columns.map((col) => (
                    <th
                      key={uniqueIdentifier(col)}
                      className='block__table__view--interactable'
                    >
                      <button onClick={(ev) => openColumnSettings(ev, col)}>
                        <Flexbox alignItems='center'>
                          <Icon
                            path={getDataColumnIcon(col)}
                            size={16}
                            className='block__table__header__icon'
                          />
                          <span>{getColumnName(col)}</span>
                        </Flexbox>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.children.map((child) => {
                  return (
                    <tr key={child.id}>
                      <td>
                        <Flexbox
                          direction='column'
                          alignItems='baseline'
                          justifyContent='center'
                        >
                          <NavigationItem
                            id={`table-block-${block.id}-${child.id}`}
                            label={blockTitle(child)}
                            icon={{
                              type: 'node',
                              icon: <BlockIcon block={child} size={16} />,
                            }}
                            labelClick={() => setCurrentBlock(child)}
                            controls={[
                              {
                                icon: mdiTrashCan,
                                onClick: () => actions.remove(child),
                                disabled: sendingMap.has(child.id),
                                spinning:
                                  sendingMap.get(child.id) === 'delete-block',
                              },
                            ]}
                            className='table__title__tree'
                          />
                        </Flexbox>
                      </td>
                      {state.columns.map((col) => (
                        <td key={uniqueIdentifier(col)}>
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
                              currentUserIsCoreMember={currentUserIsCoreMember}
                              type={getColType(col)}
                              value={
                                (state.rowData.get(child.id) || {})[
                                  toPropKey(col)
                                ] || ''
                              }
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
          </Scroller>
        </div>

        <button
          className='block__table__view__import'
          onClick={importIssues}
          id={`block__table__import__${block.id}`}
        >
          <Icon path={mdiDownloadOutline} size={16} />
          Import
        </button>
      </StyledTableView>
    </BlockLayout>
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
      const issueUrl = data.html_url || ''
      const repoRegex = new RegExp(
        /(^https:\/\/github.com\/(?:([^\/]+)\/)+)(?:(?:issues|pull\/(?:[0-9]+)))$/,
        'gi'
      )
      const matches = repoRegex.exec(issueUrl)
      return (
        <HyperlinkProp
          href={matches != null ? matches[1] : issueUrl}
          label={
            matches != null ? matches[2] : data.repository_url.split('/').pop()
          }
        />
      )
    case 'issue_number':
      const issueURL = data?.html_url || ''
      const issueRegex = new RegExp(
        /^https:\/\/github.com\/([^\/]+\/)+issues\/([0-9]+)$/,
        'gi'
      )
      if (issueRegex.test(issueURL)) {
        return <HyperlinkProp href={issueURL} label={`#${data.number}`} />
      } else {
        return null
      }
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

  .table__title__tree {
    .navigation__item__label__ellipsis {
      max-width: 300px;
    }

    .navigation__item__controls {
      display: block;
      opacity: 0;
    }

    .navigation__item__wrapper:hover .navigation__item__controls {
      opacity: 1;
    }
  }

  .table__title__tree:not(.block__editor__nav--tree)
    > .block__editor__nav--item:first-of-type::before {
    display: none;
  }

  .block__table__title {
    width: 100%;
    border: 0;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    font-weight: 600;
  }

  .block__table__cell--shrinked {
    width: 1%;
    white-space: nowrap;
  }

  & .block__table__view--interactable {
    cursor: pointer;

    &:active {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }

    &:focus {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
    }

    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
      background-color: ${({ theme }) => theme.colors.background.secondary};
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
    position: relative;
    z-index: 0;
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
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
    display: flex;
    align-items: center;
  }

  & .block__table__view--no-borders {
    border: none;
  }

  & th {
    border-top: 1px solid ${({ theme }) => theme.colors.border.main};
    color: ${({ theme }) => theme.colors.text.subtle};

    &:not(.block__table__view--interactable),
    > button {
      padding: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    > button {
      background: none;
      color: ${({ theme }) => theme.colors.text.subtle};
      border: 0;
      width: 100%;
      height: 100%;
    }
  }

  .block__table__header__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    flex: 0 0 auto;
  }

  & td {
    min-width: 130px;
    min-height: 20px;
    height: auto;
  }

  td,
  th {
    position: relative;
  }

  & td,
  th {
    width: 130px;
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  & .block__table__view__import {
    width: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
    color: ${({ theme }) => theme.colors.text.subtle};
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px;

    background: ${({ theme }) => theme.colors.background.primary};
    &:focus {
      background: ${({ theme }) => theme.colors.background.quaternary};
    }
    &:hover {
      background: ${({ theme }) => theme.colors.background.tertiary};
    }
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

export function getTableBlockInputId(block: Block) {
  return `${block.id}-title`
}

export default TableView
