import React from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'
import Icon from '../atoms/Icon'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'
import {
  sideBarTextColor,
  sideBarSecondaryTextColor,
  activeBackgroundColor
} from '../../lib/styled/styleFunctions'
import MdiIcon from '@mdi/react'

const Container = styled.div`
  position: relative;
  user-select: none;
  height: 28px;
  display: flex;
  justify-content: space-between;

  .sideNavWrapper {
    min-width: 0;
    flex: 1 1 auto;
  }

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
  flex: 0 0 26px;
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
  min-width: 0;
  width: 100%;
  flex: 1 1 auto;

  ${sideBarTextColor}

  .icon {
    flex: 0 0 auto;
    margin-right: 4px;
    ${sideBarSecondaryTextColor}
  }
`

const Label = styled.div`
  min-width: 0
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1 1 auto;
`

const ControlContainer = styled.div`
  display: flex;
  flex: 2 0 auto;
  justify-content: flex-end;
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
  onDoubleClick?: (event: React.MouseEvent) => void
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
  onDoubleClick,
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
      <div className='sideNavWrapper'>
        {folded != null && (
          <FoldButton
            className={folded ? 'folded' : ''}
            onClick={onFoldButtonClick}
            style={{ left: `${10 * depth}px` }}
          >
            <MdiIcon
              path={folded ? mdiChevronRight : mdiChevronDown}
              size='2em'
              color='currentColor'
            />
          </FoldButton>
        )}
        <ClickableContainer
          style={{
            paddingLeft: `${10 * depth + 26}px`,
            cursor: onClick ? 'pointer' : 'initial',
            fontSize: '15px'
          }}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        >
          {iconPath && <Icon className='icon' path={iconPath} />}
          <Label>{label}</Label>
        </ClickableContainer>
      </div>
      {controlComponents && (
        <ControlContainer className='control'>
          {controlComponents}
        </ControlContainer>
      )}{' '}
    </Container>
  )
}

export default SideNaviagtorItem
