import React from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'
import {
  sideBarTextColor,
  sideBarSecondaryTextColor,
  activeBackgroundColor
} from '../../lib/styled/styleFunctions'
import { IconArrowSingleRight, IconArrowSingleDown } from '../icons'

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
  ${sideBarSecondaryTextColor}
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

  ${sideBarTextColor}
  &:hover,
  &:focus,
  &:active,
  &.active {
    ${sideBarTextColor}
  }

  .icon {
    margin-right: 4px;
    ${sideBarSecondaryTextColor}
  }
`

const Label = styled.div`
  white-space: nowrap;
`

const ControlContainer = styled.div`
  display: flex;
`

const SideNavigatorItemIconContainer = styled.span`
  padding-right: 6px;
  svg {
    width: 0.7em !important;
    height: 0.7em !important;
  }
`

interface SideNaviagtorItemProps {
  label: string
  icon?: React.ReactNode
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
  icon,
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
          {folded ? (
            <IconArrowSingleRight color='currentColor' />
          ) : (
            <IconArrowSingleDown color='currentColor' />
          )}
        </FoldButton>
      )}
      <ClickableContainer
        style={{
          paddingLeft: `${10 * depth + 26}px`,
          cursor: onClick ? 'pointer' : 'initial',
          fontSize: '15px'
        }}
        onClick={onClick}
      >
        {icon !== null && (
          <SideNavigatorItemIconContainer>
            {icon}
          </SideNavigatorItemIconContainer>
        )}
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
