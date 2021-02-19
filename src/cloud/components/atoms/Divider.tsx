import React from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'
import TopBarSideNavToggle from '../organisms/RightSideTopBar/TopBarSideNavToggle'

interface DividerProps {
  onMouseDown: React.MouseEventHandler
  dragging: boolean
  displaySidebarToggle?: boolean
}

const Divider = ({
  onMouseDown,
  dragging,
  displaySidebarToggle = true,
}: DividerProps) => (
  <DividerGraple
    className={cc([dragging && 'active', 'divider'])}
    onMouseDown={onMouseDown}
  >
    {displaySidebarToggle && <TopBarSideNavToggle />}
    <DividerBorder />
  </DividerGraple>
)

export default Divider

const DividerBorder = styled.div`
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) => theme.divideBorderColor};
`

const DividerGraple = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  border: 1px solid;
  border-color: transparent;
  box-sizing: content-box;
  margin: -2px;
  z-index: 100;
  user-select: none;
  cursor: col-resize;

  &:hover,
  &.active {
    transition: 0.2s;
    border-color: ${({ theme }) => theme.primaryBorderColor};

    button {
      opacity: 1;
    }
  }
`
