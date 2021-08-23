import styled from '../../../design/lib/styled'

export const StyledWorkspaceExplorer = styled.div`
  width: 100%;
  display: block;
  height: 300px;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
`
export const StyledWorkspaceExplorerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  height: 100%;
  overflow: auto;
`

export const StyledExplorerDepth = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  width: 220px;
  min-height: inherit;
  height: 100%;
  overflow: auto;

  &:not(.last) {
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};
  }
`

export const StyledExplorerListItem = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px
    ${({ theme }) => theme.sizes.spaces.sm}px;
  position: relative;
  cursor: pointer;
  height: 30px;

  span {
    flex: 1 1 auto;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  &.selected {
    background: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &.current {
    background: ${({ theme }) => theme.colors.variants.primary.base};
    color: ${({ theme }) => theme.colors.variants.primary.text};
  }
`

export const StyledExplorerListItemIcon = styled.div`
  flex: 0 0 auto;
  svg,
  .icon {
    color: inherit !important;
  }

  &.subtle:not(.emphasized) {
    svg,
    .icon {
      color: ${({ theme }) => theme.colors.text.subtle} !important;
    }
  }
`
