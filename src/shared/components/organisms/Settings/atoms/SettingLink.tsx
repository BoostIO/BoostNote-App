import styled from '../../../../lib/styled'

const SettingLink = styled.a`
  color: ${({ theme }) => theme.colors.text.link};
  text-decoration: none;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.text.link};
    text-decoration: underline;
  }
`

export default SettingLink
