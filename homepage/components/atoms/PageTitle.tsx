import styled from '../../lib/styled'

const PageTitle = styled.h2`
  margin: ${({ theme }) => theme.space[0]};
  font-size: ${({ theme }) => theme.fontSizes[4]}px;
  line-height: ${({ theme }) => theme.lineHeights.headings};
`

export default PageTitle
