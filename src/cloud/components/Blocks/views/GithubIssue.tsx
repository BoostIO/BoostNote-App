import React from 'react'
import { ViewProps } from '../BlockContent'
import { mdiLink } from '@mdi/js'
import styled from '../../../../design/lib/styled'
import Icon from '../../../../design/components/atoms/Icon'
import { GithubIssueBlock } from '../../../api/blocks'

const GithubIssueView = ({ block }: ViewProps<GithubIssueBlock>) => {
  return (
    <StyledGithubIssueView>
      <h1>{block.data.title}</h1>
      <div className='github-issue__view__info'>
        <div>
          <div>Issue number</div>
          <div>
            <a href={block.data.html_url}>
              <div>
                <span>#{block.data.number}</span>
                <Icon path={mdiLink} />
              </div>
            </a>
          </div>
        </div>
        <div>
          <div>Assignees</div>
          <div>
            {block.data.assignees
              .map((assignee: any) => assignee.login)
              .join(', ')}
          </div>
        </div>
        <div>
          <div>Status</div>
          <div>{block.data.status}</div>
        </div>
        <div>
          <div>Labels</div>
          <div>
            {block.data.labels.map((label: any) => label.name).join(', ')}
          </div>
        </div>
        <div>
          <div>Linked PR</div>
          <div>
            {block.data.pull_request != null && (
              <a href={block.data.pull_request.html_url}>
                #{block.data.pull_request.number || block.data.number}
              </a>
            )}
          </div>
        </div>
      </div>
    </StyledGithubIssueView>
  )
}

const StyledGithubIssueView = styled.div`
  .github-issue__view__info {
    & > div {
      display: flex;
      align-items: center;
      padding: ${({ theme }) => theme.sizes.spaces.sm}px 0;
      & > div:first-child {
        width: 100px;
        color: ${({ theme }) => theme.colors.text.subtle};
      }
    }

    & a {
      color: ${({ theme }) => theme.colors.text.primary};
      text-decoration: none;
    }
  }
`

export default GithubIssueView
