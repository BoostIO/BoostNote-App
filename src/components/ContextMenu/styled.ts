import styled from '../../lib/styled'
import {
  menuHeight,
  menuVerticalPadding,
  menuZIndex
} from '../../lib/contextMenu'

export const StyledContextMenu = styled.div`
  min-width: 130px;
  position: fixed;
  z-index: ${menuZIndex};
  background-color: ${({ theme }) => theme.colors.background};
  border-color: ${({ theme }) => theme.colors.border};
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
  color: ${({ theme }) => theme.colors.text};
  &:hover {
    background-color: ${({ theme }) => theme.colors.active};
    color: ${({ theme }) => theme.colors.inverseText};
  }
  &:disabled {
    background-color: transparent;
    color: ${({ theme }) => theme.colors.deemedText};
  }
`
