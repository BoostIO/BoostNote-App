import React from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'
import Icon from '../atoms/Icon'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'
import {
  uiTextColor,
  activeBackgroundColor
} from '../../lib/styled/styleFunctions'

const Container = styled.div`
  position: relative;
  user-select: none;
  height: 30px;
  display: flex;

  transition: 200ms background-color;
  &:hover,
  &:focus,
  &:active,
  &.active {
    ${activeBackgroundColor}
  }
  .control {
    opacity: 0;
  }
  &:hover .control {
    opacity: 1;
  }
`

const FoldButton = styled.button`
  position: absolute;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  background-color: transparent;
  margin-right: 3px;
  border-radius: 2px;
  top: 2px;
  ${uiTextColor}
  &:focus {
    box-shadow: none;
  }
`

const ClickableContainer = styled.button`
  background-color: transparent;
  border: none;
  height: 30px;
  display: flex;
  align-items: center;
  width: 100%;

  color: ${({ theme }) => theme.uiTextColor};
  &:hover,
  &:focus,
  &:active,
  &.active {
    color: ${({ theme }) => theme.activeUiTextColor};
  }

  .icon {
    margin-right: 4px;
  }
`

const Label = styled.div`
  white-space: nowrap;
`

const ControlContainer = styled.div`
  display: flex;
`

interface SideNaviagtorItemProps {
  label: string
  iconPath?: string
  depth: number
  controlComponents?: any[]
  className?: string
  folded?: boolean
  active?: boolean
  onFoldButtonClick?: (event: React.MouseEvent) => void
  onClick?: (event: React.MouseEvent) => void
  onContextMenu?: (event: React.MouseEvent) => void
  onDrop?: (event: React.DragEvent) => void
  onDragOver?: (event: React.DragEvent) => void
  onDragEnd?: (event: React.DragEvent) => void
}

const SideNaviagtorItem = ({
  label,
  iconPath,
  depth,
  controlComponents,
  className,
  folded,
  active,
  onFoldButtonClick,
  onClick,
  onContextMenu,
  onDrop,
  onDragOver,
  onDragEnd
}: SideNaviagtorItemProps) => {
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
          <Icon path={folded ? mdiChevronRight : mdiChevronDown} />
        </FoldButton>
      )}
      <ClickableContainer
        style={{
          paddingLeft: `${10 * depth + 26}px`,
          cursor: onClick ? 'pointer' : 'initial'
        }}
        onClick={onClick}
      >
        {iconPath && <Icon className='icon' path={iconPath} />}
        <Label>{label}</Label>
      </ClickableContainer>
      {controlComponents && (
        <ControlContainer className='control'>
          {controlComponents}
        </ControlContainer>
      )}
    </Container>
  )
}

export default SideNaviagtorItem
