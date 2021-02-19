import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { mdiSourceMerge, mdiSourceBranchRemove, mdiSourcePull } from '@mdi/js'
import IconMdi from '../../../atoms/IconMdi'
import { StyledGithubEmbed, SpanBlock, Title, Label, InfoBlock } from './styles'
import { GithubPullRequest } from './utils'

interface GithubPRProps {
  data: GithubPullRequest
}

const GithubPR = ({ data }: GithubPRProps) => {
  const openedAt = new Date(data.created_at)
  const statusIconInfo =
    data.state === 'closed'
      ? data.merged
        ? [mdiSourceMerge, '#6f42c1']
        : [mdiSourceBranchRemove, '#cb2431']
      : [mdiSourcePull, '#28a745']

  return (
    <StyledGithubEmbed>
      <IconMdi
        path={statusIconInfo[0]}
        size={24}
        style={{ color: statusIconInfo[1] }}
      />
      <SpanBlock>
        <SpanBlock>
          <Title href={data.html_url} target='_blank' rel='noreferrer'>
            {data.title}
          </Title>
          {data.labels.map((label: any) => {
            return (
              <Label
                style={{ backgroundColor: `#${label.color}` }}
                key={label.id}
              >
                {label.name}
              </Label>
            )
          })}
        </SpanBlock>
        <InfoBlock>
          #{data.number} opened {formatDistanceToNow(openedAt)} ago by{' '}
          {data.user.login}
        </InfoBlock>
      </SpanBlock>
    </StyledGithubEmbed>
  )
}

export default GithubPR
