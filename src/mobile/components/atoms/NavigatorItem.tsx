import React from 'react'
import cc from 'classcat'
import styled from '../../../lib/styled'
import { textOverflow } from '../../../lib/styled/styleFunctions'
import Icon from '../../../components/atoms/Icon'
import { mdiChevronRight, mdiChevronDown } from '@mdi/js'

const Container = styled.div`
  position: relative;
  user-select: none;
  height: 34px;
  display: flex;
  &.active {
    background-color: ${({ theme }) => theme.navItemActiveBackgroundColor};
  }
`

const FoldButton = styled.button`
  position: absolute;
  width: 24px;
  height: 34px;
  left: 0;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.navButtonColor};
`

const ClickableContainer = styled.button`
  height: 34px;
  display: flex;
  align-items: center;
  flex: 1;

  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.navLabelColor};
`

const Label = styled.div`
  min-width: 0;
  margin-left: 0.25em;
  text-align: left;
  ${textOverflow}
`

const Control = styled.div`
  position: absolute;
  right: 0;
  height: 34px;
  display: flex;
  align-items: center;
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
}: NavigatorItemProps) => {
  return (
    <Container className={cc([className, active && 'active'])}>
      {folded != null && (
        <FoldButton
          onClick={onFoldButtonClick}
          style={{ paddingLeft: `${10 * depth + 10}px` }}
        >
          <Icon size={18} path={folded ? mdiChevronRight : mdiChevronDown} />
        </FoldButton>
      )}
      <ClickableContainer
        style={{
          paddingLeft: `${10 * depth + 30}px`,
          cursor: onClick ? 'pointer' : 'initial',
          fontSize: '15px',
        }}
        onClick={onClick}
      >
        {iconPath != null && <Icon size={18} path={iconPath} />}
        <Label>{label}</Label>
      </ClickableContainer>
      {control && <Control>{control}</Control>}
    </Container>
  )
}

export default NavigatorItem
