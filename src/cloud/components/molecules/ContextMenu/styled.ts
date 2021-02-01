import styled from '../../../lib/styled'
import {
  menuHeight,
  menuVerticalPadding,
  menuZIndex,
} from '../../../lib/stores/contextMenu'
import { linkText } from '../../../lib/styled/styleFunctions'

export const StyledContextMenu = styled.div`
  min-width: 130px;
  position: fixed;
  z-index: ${menuZIndex};
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  border: 1px solid ${({ theme }) => theme.baseBorderColor};
  padding: ${menuVerticalPadding}px 0;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.baseShadowColor};
  outline: none;
  width: auto;
`

export const StyledContextMenuItem = styled.button`
  height: ${menuHeight}px;
  padding: 0 ${({ theme }) => theme.space.default}px;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
  text-align: left;
  ${linkText};
  &:hover,
  &:focus,
  &:active,
  &.active {
    background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
  }
  &:disabled {
    background-color: transparent;
  }

  span {
    display: flex;
    align-items: center;
  }
  svg {
    margin-right: ${({ theme }) => theme.space.xxsmall}px;
  }
`

export const StyledSeparator = styled.div`
  height: 1px;
  margin: ${({ theme }) => theme.space.xxsmall}px 0;
  border: 1px solid ${({ theme }) => theme.baseBorderColor};
`
