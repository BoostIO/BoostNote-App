import styled from '../../../../lib/styled'
import Link from '../../../atoms/Link'

const SettingLink = styled(Link)`
  a {
    color: ${({ theme }) => theme.colors.text.link};
    text-decoration: none;

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.text.link};
      text-decoration: underline;
    }
  }
`

export default SettingLink
