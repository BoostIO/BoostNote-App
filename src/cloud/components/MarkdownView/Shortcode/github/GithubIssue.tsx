import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { mdiAlertCircleCheckOutline, mdiAlertCircleOutline } from '@mdi/js'
import { StyledGithubEmbed, SpanBlock, Title, Label, InfoBlock } from './styles'
import { GithubIssue } from './utils'
import Icon from '../../../../../design/components/atoms/Icon'

interface GithubIssueProps {
  data: GithubIssue
}

const GithuIssue = ({ data }: GithubIssueProps) => {
  const openedAt = new Date(data.created_at)
  const statusIconInfo =
    data.state === 'closed'
      ? [mdiAlertCircleCheckOutline, '#cb2431']
      : [mdiAlertCircleOutline, '#28a745']

  return (
    <StyledGithubEmbed>
      <Icon
        path={statusIconInfo[0]}
        size={26}
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

export default GithuIssue
