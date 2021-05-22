import React from 'react'
import cc from 'classcat'
import Checkbox from '../../../atoms/Checkbox'
import Flexbox from '../../../atoms/Flexbox'
import styled from '../../../../../shared/lib/styled'

interface ContentManagerRowProps {
  checked?: boolean
  onSelect: (val: boolean) => void
  className?: string
  itemLink: any
  rowActions?: React.ReactNode
}

const ContentManagerRow = ({
  className,
  checked,
  itemLink,
  rowActions,
  onSelect,
}: ContentManagerRowProps) => (
  <StyledContentManagerRow className={cc([className])}>
    <Checkbox className='checkbox' checked={checked} onChange={onSelect} />
    <Flexbox
      flex={'1 1 auto'}
      style={{
        height: '100%',
      }}
      className='link'
    >
      {itemLink}
    </Flexbox>
    {rowActions}
  </StyledContentManagerRow>
)

export default ContentManagerRow

const StyledContentManagerRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  height: 40px;
  flex: 1 1 auto;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
  font-size: 13px;
  padding: 0 8px;

  &.expanded {
    height: 60px;
  }

  .actions {
    display: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
    .custom-check::before {
      border-color: ${({ theme }) => theme.colors.text.secondary};
    }

    .actions {
      display: flex;
    }

    .date {
      display: none;
    }
  }

  .link {
    overflow: hidden;
  }

  .subtle {
    color: ${({ theme }) => theme.colors.text.subtle};
    margin: 0;
    font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
  }

  .emoji-icon {
    color: ${({ theme }) => theme.colors.text.link};
  }

  a {
    width: 100%;
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    height: 100%;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
  }

  .checkbox {
    margin-right: 8px;
  }
  .status-icon {
    margin-right: 4px;
  }

  .date {
    flex: 0 2 auto;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text.subtle};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .label {
    flex: 1 1 auto;
    margin: 0 ${({ theme }) => theme.sizes.spaces.xsm}px 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.parent {
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
    padding-left: 2px;
  }
`
