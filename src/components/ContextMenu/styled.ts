import styled from '../../lib/styled'
import {
  menuHeight,
  menuVerticalPadding,
  menuZIndex
} from '../../lib/contextMenu'
import {
  uiTextColor,
  contextMenuShadow,
  borderColor,
  backgroundColor,
  activeBackgroundColor
} from '../../lib/styled/styleFunctions'

export const StyledContextMenu = styled.div`
  min-width: 130px;
  position: fixed;
  z-index: ${menuZIndex};
  ${backgroundColor}
  ${borderColor}
  border-style: solid;
  border-width: 1px;
  padding: ${menuVerticalPadding}px 0;
  font-size: 14px;
  box-sizing: border-box;
  border-radius: 2px;
  ${contextMenuShadow}
  outline: none;
`

export const StyledContextMenuItem = styled.button`
  height: ${menuHeight}px;
  padding: 0 20px;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  display: block;
  width: 100%;
  text-align: left;
  ${uiTextColor};
  &:hover,
  &:focus,
  &:active,
  &.active {
    ${activeBackgroundColor}
  }
  &:disabled {
    background-color: transparent;
  }
`
