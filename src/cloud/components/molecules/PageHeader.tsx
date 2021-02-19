import React from 'react'
import styled from '../../lib/styled'
import PageTitle from '../atoms/PageTitle'
import { Emoji } from 'emoji-mart'
import IconMdi from '../atoms/IconMdi'

interface PageHeaderProps {
  iconType?: 'emoji' | 'icon'
  iconVariant?: string
  title: string
}

const PageHeader = ({
  iconType = 'icon',
  iconVariant,
  title,
}: PageHeaderProps) => {
  return (
    <StyledPageHeader>
      <PageTitle>
        {iconVariant != null && (
          <span className='icon'>
            {iconType === 'emoji' ? (
              <Emoji emoji={iconVariant} set='apple' size={32} />
            ) : (
              <IconMdi path={iconVariant} size={32} />
            )}{' '}
          </span>
        )}
        <span>{title}</span>
      </PageTitle>
    </StyledPageHeader>
  )
}

export default PageHeader

const StyledPageHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  & .icon {
    margin-right: 10px;
  }

  .emoji-icon {
    padding-left: 0 !important;
  }
`
