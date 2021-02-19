import styled from '../../../../lib/styled'

export const StyledSidebarPrivateWorkspaces = styled.div`
  margin-top: ${({ theme }) => theme.space.xsmall}px;
`

export const StyledSideNavigatorBackground = styled.div`
  &.dragged-over {
    .dragged-over {
      border-color: ${({ theme }) => theme.primaryBackgroundColor};
    }
    background-color: ${({ theme }) => theme.primaryBackgroundColor} !important;

    &.active,
    .active {
      opacity: 0.4;
    }

    &.focused,
    .focused {
      opacity: 0.6;
    }
  }
`

export const StyledPrivateWorkspacesLabel = styled.span`
  color: ${({ theme }) => theme.baseTextColor};
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
