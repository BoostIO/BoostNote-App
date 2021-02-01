import React from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'

interface TabHeadersProps<T extends string> {
  titles: T[]
  onSelect: (selected: T) => void
  active: T
}

const TabHeaders = <T extends string>({
  titles,
  onSelect,
  active,
}: TabHeadersProps<T>) => {
  return (
    <div>
      {titles.map((title) => {
        return (
          <StyledTabButton
            key={title}
            onClick={() => onSelect(title)}
            className={cc([active === title && 'active'])}
          >
            {title}
          </StyledTabButton>
        )
      })}
    </div>
  )
}

export const StyledTabButton = styled.button`
  padding: ${({ theme }) => theme.space.small}px;
  background: none;
  cursor: pointer;
  color: ${({ theme }) => theme.subtleTextColor};
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  transition: 0.2s;
  text-transform: capitalize;

  &:hover,
  &.active {
    color: ${({ theme }) => theme.emphasizedTextColor};
  }

  &:focus {
    background-color: ${({ theme }) => theme.subtleBackgroundColor};
  }

  &.active {
    position: relative;

    &:after {
      position: absolute;
      bottom: -1px;
      left: 0;
      content: '';
      width: 100%;
      height: 2px;
      background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
    }
  }

  + button {
    margin-left: ${({ theme }) => theme.space.default}px;
  }
`

export default TabHeaders
