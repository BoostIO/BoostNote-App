import React from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'
import Icon from './Icon'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'

const Container = styled.div`
  position: relative;
  user-select: none;
  height: 34px;
  display: flex;
  justify-content: space-between;
  width: 100%;

  font-size: 1em;
  transition: 200ms background-color;
`

const FoldButton = styled.button`
  position: absolute;
  width: 24px;
  height: 24px;
  border: none;
  background-color: transparent;
  border-radius: 50%;
  top: 5px;
  display: flex;
  align-items: center;
  justify-content: center;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.sideNavButtonColor};
  &:hover {
    color: ${({ theme }) => theme.sideNavButtonHoverColor};
  }

  &:active,
  .active {
    color: ${({ theme }) => theme.sideNavButtonActiveColor};
  }
`

const ClickableContainer = styled.button`
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  cursor: pointer;

  color: ${({ theme }) => theme.sideNavItemColor};
  background-color: ${({ theme }) => theme.sideNavItemBackgroundColor};
  &:hover {
    background-color: ${({ theme }) => theme.sideNavItemHoverBackgroundColor};
  }
  &:active,
  &.active {
    color: ${({ theme }) => theme.sideNavItemActiveColor};
    background-color: ${({ theme }) => theme.sideNavItemActiveBackgroundColor};
  }
  &:hover:active,
  &:hover.active {
    background-color: ${({ theme }) =>
      theme.sideNavItemHoverActiveBackgroundColor};
  }
`

const Label = styled.div`
  overflow: ellipsis;
  white-space: nowrap;
`

const Control = styled.div`
  position: absolute;
  right: 0;
  top: 5px;
`

const IconContainer = styled.div`
  width: 22px;
  height: 24px;
  display: flex;
  align-items: center;
  font-size: 18px;
`

interface NavigatorItemProps {
  label: string
  iconPath?: string
  depth: number
  control?: React.ReactNode
  className?: string
  folded?: boolean
  active?: boolean
  onFoldButtonClick?: (event: React.MouseEvent) => void
  onClick?: (event: React.MouseEvent) => void
  onContextMenu?: (event: React.MouseEvent) => void
  onDrop?: (event: React.DragEvent) => void
  onDragOver?: (event: React.DragEvent) => void
  onDragEnd?: (event: React.DragEvent) => void
  onDoubleClick?: (event: React.MouseEvent) => void
}

const NavigatorItem = ({
  label,
  iconPath,
  depth,
  control,
  className,
  folded,
  active,
  onFoldButtonClick,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDrop,
  onDragOver,
  onDragEnd,
}: NavigatorItemProps) => {
  return (
    <Container
      className={cc([className, active && 'active'])}
      onContextMenu={onContextMenu}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {folded != null && (
        <FoldButton
          className={folded ? 'folded' : ''}
          onClick={onFoldButtonClick}
          style={{ left: `${10 * depth}px` }}
        >
          <Icon path={folded ? mdiChevronRight : mdiChevronDown} size={18} />
        </FoldButton>
      )}
      <ClickableContainer
        style={{
          paddingLeft: `${10 * depth + 24}px`,
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={active ? 'active' : ''}
      >
        {iconPath != null && (
          <IconContainer>
            <Icon path={iconPath} />
          </IconContainer>
        )}
        <Label>{label}</Label>
      </ClickableContainer>
      {control && <Control className='control'>{control}</Control>}
    </Container>
  )
}

export default NavigatorItem
