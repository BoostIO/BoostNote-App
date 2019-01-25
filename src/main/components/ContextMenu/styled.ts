import styled from '../../lib/styled'
import { menuHeight, menuVerticalPadding } from '../../lib/contextMenu/consts'

export const StyledContextMenu = styled.div`
  min-width: 130px;
  position: fixed;
  z-index: 9999;
  background-color: ${({ theme }) => theme.contextMenu.backgroundColor};
  border-color: ${({ theme }) => theme.contextMenu.borderColor};
  border-style: solid;
  border-width: 1px;
  padding: ${menuVerticalPadding}px 0;
  font-size: 14px;
  box-sizing: border-box;
  border-radius: 5px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.35);
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
  color: ${({ theme }) => theme.contextMenu.menuTextColor};
  &:hover {
    background-color: ${({ theme }) =>
      theme.contextMenu.menuActiveBackgroundColor};
    color: ${({ theme }) => theme.contextMenu.menuActiveTextColor};
  }
`
