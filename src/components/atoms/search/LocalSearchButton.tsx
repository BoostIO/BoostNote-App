import React from 'react'
import styled from '../../../lib/styled/styled'
import Icon from '../Icon'

interface LocalSearchButtonProps {
  title?: string
  className?: string
  iconPath: string
  onClick: () => void
  disabled?: boolean
}

const LocalSearchButton = ({
  disabled = false,
  title = '',
  className,
  iconPath,
  onClick,
}: LocalSearchButtonProps) => {
  return (
    <LocalSearchStyledButton
      disabled={disabled}
      title={title}
      className={className}
      onClick={onClick}
    >
      <Icon path={iconPath} />
    </LocalSearchStyledButton>
  )
}

export default LocalSearchButton

const LocalSearchStyledButton = styled.button`
  background-color: transparent;
  cursor: pointer;

  width: 22px;
  height: 22px;
  padding: 3px;
  font-weight: bolder;
  font-size: 16px;

  overflow: hidden;
  border-radius: 0;
  border: none;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navItemColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  &.active {
    background-color: ${({ theme }) => theme.secondaryButtonBackgroundColor};
    color: #61a8e1;
    border-radius: 3px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
    &:hover {
      color: ${({ theme }) => theme.navItemColor};
    }
  }

  &:focus {
    opacity: 0.6;
    background-color: ${({ theme }) => theme.secondaryButtonBackgroundColor};
    outline: 1px solid #61a8e1;
    border-radius: 3px;
  }
`
