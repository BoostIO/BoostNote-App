import {
  menuVerticalPadding,
  menuZIndex,
} from '../../../../../../shared/lib/stores/contextMenu'
import styled from '../../../../../../shared/lib/styled'

export const zIndexModalsBackground = 8002

export const StyledContextMenuBackground = styled.div`
  z-index: ${zIndexModalsBackground};
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  opacity: 0;
  position: fixed;
  width: 100vw;
  height: 100vh;
`

export const StyledContextMenuContainer = styled.div`
  position: fixed;
  right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  width: auto;
  min-width: 130px;
  padding: ${menuVerticalPadding}px 0;
  background-color: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 4px;
  box-sizing: border-box;
  box-shadow: ${({ theme }) => theme.colors.shadow};
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  outline: none;
  z-index: ${menuZIndex};
`

export const Scrollable = styled.div`
  flex: 1 1 auto;
  width: 100%;
  overflow: hidden auto;
`

export const StyledFooter = styled.div`
  margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px
    ${({ theme }) => theme.sizes.spaces.sm}px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.main};

  div {
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export const StyledMenuItem = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;

  .icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export const StyledIcon = styled.div`
  padding-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  font-size: 21px;
`
