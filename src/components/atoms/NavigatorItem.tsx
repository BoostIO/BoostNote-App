import React from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'
import Icon from './Icon'
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiCircleSmall,
  mdiAlertCircleOutline,
} from '@mdi/js'
import { textOverflow } from '../../lib/styled/styleFunctions'

const Container = styled.div`
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

  &.dragged-over {
    border-radius: 3px;
    .dragged-over {
      border-color: ${({ theme }) => theme.secondaryBorderColor};
    }
    background-color: ${({ theme }) =>
      theme.secondaryButtonBackgroundColor} !important;
  }
`

const FoldButton = styled.button`
  position: absolute;
  width: 24px;
  height: 24px;
  border: none;
  background-color: transparent;
  border-radius: 50%;
  top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navButtonColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  .active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`

const ClickableContainer = styled.button`
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

  color: ${({ theme }) => theme.navItemColor};
  background-color: ${({ theme }) => theme.navItemBackgroundColor};
  &:hover {
    background-color: ${({ theme }) => theme.navItemHoverBackgroundColor};
  }
  &:active,
  &.active {
    background-color: ${({ theme }) => theme.navItemActiveBackgroundColor};
  }
  &:hover:active,
  &:hover.active {
    background-color: ${({ theme }) => theme.navItemHoverActiveBackgroundColor};
  }

  &.subtle {
    color: ${({ theme }) => theme.disabledUiTextColor};
  }
`

const Label = styled.div`
  ${textOverflow};
  flex: 1;
  font-size: 14px;

  &.subtle {
    color: ${({ theme }) => theme.disabledUiTextColor};
  }
`

const Control = styled.div`
  position: absolute;
  right: 0;
  top: 2px;
  opacity: 0;
  transition: opacity 200ms ease-in-out;
  display: flex;
`

const IconContainer = styled.div`
  width: 22px;
  height: 24px;
  display: flex;
  align-items: center;
  font-size: 16px;
`

interface NavigatorItemProps {
  label: string
  iconPath?: string
  depth: number
  dotPlaceholder?: boolean
  control?: React.ReactNode
  visibleControl?: boolean
  className?: string
  folded?: boolean
  active?: boolean
  subtle?: boolean
  alert?: boolean
  draggable?: boolean
  draggedOver?: boolean
  onFoldButtonClick?: (event: React.MouseEvent) => void
  onClick?: (event: React.MouseEvent) => void
  onContextMenu?: (event: React.MouseEvent) => void
  onDragStart?: (event: React.DragEvent) => void
  onDrop?: (event: React.DragEvent) => void
  onDragOver?: (event: React.DragEvent) => void
  onDragEnd?: (event: React.DragEvent) => void
  onDragLeave?: (event: React.DragEvent) => void
  onDoubleClick?: (event: React.MouseEvent) => void
}

const NavigatorItem = ({
  label,
  iconPath,
  depth,
  control,
  visibleControl = false,
  className,
  folded,
  // TODO: Delete dot placeholder style
  dotPlaceholder,
  active,
  draggable,
  subtle,
  alert,
  onFoldButtonClick,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDrop,
  onDragOver,
  onDragEnd,
  onDragLeave,
  draggedOver,
}: NavigatorItemProps) => {
  return (
    <Container
      className={cc([
        className,
        active && 'active',
        visibleControl && 'visibleControl',
        draggedOver && 'dragged-over',
      ])}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragLeave={onDragLeave}
      draggable={draggable}
    >
      {!dotPlaceholder && folded != null && (
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
          paddingLeft: dotPlaceholder
            ? `${10 * depth}px`
            : `${10 * depth + 24}px`,
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={active ? 'active' : ''}
      >
        {dotPlaceholder && (
          <div
            style={{
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon path={mdiCircleSmall} />
          </div>
        )}
        {iconPath != null && (
          <IconContainer>
            <Icon path={iconPath} />
          </IconContainer>
        )}
        <Label className={cc([subtle && 'subtle'])}>{label}</Label>
        {alert && (
          <Icon
            color='red'
            path={mdiAlertCircleOutline}
            style={{ marginRight: 5 }}
          />
        )}
        {control && <Control className='control'>{control}</Control>}
      </ClickableContainer>
    </Container>
  )
}

export default NavigatorItem
