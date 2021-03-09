import styled from '../../../lib/styled'
import Link from './Link'

const EmphasizedLink = styled(Link)`
  a {
    color: ${({ theme }) => theme.primaryTextColor};

    &:hover,
    &:focus {
      text-decoration: none;
    }
  }
`

export default EmphasizedLink
