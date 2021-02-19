import styled from '../../lib/styled'

const PageTitle = styled.h1`
  display: flex;
  align-items: center;
  max-width: 500px;
  font-size: ${({ theme }) => theme.fontSizes.xxxlarge}px;
  font-weight: 400;
  margin: 0;
`

export default PageTitle
