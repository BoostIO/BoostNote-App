import styled from '../../../lib/styled'

export const StyledWorkspaceExplorer = styled.div`
  width: 100%;
  display: block;
  height: 300px;
  border: 1px solid ${({ theme }) => theme.baseBorderColor};
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
    border-right: 1px solid ${({ theme }) => theme.baseBorderColor};
  }
`

export const StyledExplorerListItem = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  position: relative;
  cursor: pointer;

  span {
    flex: 1 1 auto;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  &.selected {
    background: ${({ theme }) => theme.subtleBackgroundColor};
    color: ${({ theme }) => theme.emphasizedTextColor};
  }

  &.current {
    background: ${({ theme }) => theme.primaryBackgroundColor};
    color: ${({ theme }) => theme.whiteTextColor};
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
      color: ${({ theme }) => theme.subtleIconColor} !important;
    }
  }
`
