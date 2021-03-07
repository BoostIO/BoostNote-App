import styled from '../../lib/styled'

const InlineLinkButton = styled.a`
  color: ${({ theme }) => theme.primaryColor};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }

  &.inline-link--variant-danger {
    color: #ef5b5b;
  }
`

export default InlineLinkButton
