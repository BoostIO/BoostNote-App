import React from 'react'
import styled from '../../lib/styled'
import { textOverflow } from '../../lib/styled/styleFunctions'
import Icon from './Icon'
import { mdiChevronRight, mdiChevronDown } from '@mdi/js'

const HeaderContainer = styled.header`
  position: relative;
  user-select: none;
  height: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  font-size: 1em;
  transition: 200ms background-color;
  &:hover {
    .control {
      opacity: 1;
    }
  }

  &.visibleControl {
    .control {
      opacity: 1;
    }
  }
`

const Label = styled.div`
  flex: 1;
  ${textOverflow}
  &:first-child {
    padding-left: 5px;
  }
`

const Control = styled.div`
  position: absolute;
  right: 0;
  top: 2px;
  display: flex;
`

const ClickableContainer = styled.div`
  background-color: transparent;
  height: 28px;
  border: none;
  border-radius: 3px;
  display: flex;
  align-items: center;
  text-align: left;
  flex: 1;
  overflow: hidden;
  cursor: pointer;
  color: ${({ theme }) => theme.disabledUiTextColor};
  background-color: ${({ theme }) => theme.navItemBackgroundColor};
  &:hover {
    background-color: ${({ theme }) => theme.navItemHoverBackgroundColor};
    color: ${({ theme }) => theme.navItemColor};
  }
  &:active,
  &.active {
    background-color: ${({ theme }) => theme.navItemActiveBackgroundColor};
    color: ${({ theme }) => theme.navItemColor};
  }
  &:hover:active,
  &:hover.active {
    background-color: ${({ theme }) => theme.navItemHoverActiveBackgroundColor};
  }

  &.subtle {
    color: ${({ theme }) => theme.disabledUiTextColor};
  }
`

interface NavigatorHeaderProps {
  label: string
  active?: boolean
  control?: React.ReactNode
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>
  folded?: boolean
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const NavigatorHeader = ({
  folded,
  label,
  active = false,
  onContextMenu,
  onClick,
  control,
}: NavigatorHeaderProps) => {
  return (
    <HeaderContainer onContextMenu={onContextMenu}>
      <ClickableContainer onClick={onClick} className={active ? 'active' : ''}>
        {folded != null && (
          <Icon path={folded ? mdiChevronRight : mdiChevronDown} size={18} />
        )}
        <Label>{label}</Label>
      </ClickableContainer>
      {control && <Control>{control}</Control>}
    </HeaderContainer>
  )
}

export default NavigatorHeader
