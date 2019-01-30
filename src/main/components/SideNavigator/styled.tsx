import styled from '../../lib/styled'

export const StyledStorageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

export const StyledSideNavContainer = styled.nav`
  border-right: solid 1px ${({ theme }) => theme.sideNav.borderColor};
`
