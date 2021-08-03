import React, { useCallback } from 'react'
import { ViewProps } from '../BlockContent'
import { mdiPlus } from '@mdi/js'
import GithubIssueForm from '../forms/GithubIssueForm'
import { TableBlock } from '../../../api/blocks'
import { useModal } from '../../../../design/lib/stores/modal'
import Button from '../../../../design/components/atoms/Button'
import styled from '../../../../design/lib/styled'

const TableView = ({ block, actions }: ViewProps<TableBlock>) => {
  const { openModal } = useModal()

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
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <td>Assignees</td>
            <th>Status</th>
            <th>Labels</th>
            <th>Linked PR</th>
          </tr>
        </thead>
        <tbody>
          {block.children.map(({ data }) => {
            return (
              <tr key={data.id}>
                <td>{data.title}</td>
                <td>
                  {data.assignees
                    .map((assignee: any) => assignee.login)
                    .join(', ')}
                </td>
                <td>{data.state}</td>
                <td>
                  {data.labels.map((label: any) => label.name).join(', ')}
                </td>
                <td>
                  {data.pull_request != null && data.pull_request.html_url}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className='block__table__view__import'>
        <Button onClick={importIssues} variant='transparent' iconPath={mdiPlus}>
          Import
        </Button>
      </div>
    </StyledTableView>
  )
}

const StyledTableView = styled.div`
  & table {
    width: 100%;
    text-align: left;
    border-collapse: collapse;
  }

  & td,
  th {
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  & .block__table__view__import {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }
`

export default TableView
