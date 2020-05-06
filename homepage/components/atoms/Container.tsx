import styled from '../../lib/styled'
import { padding, PaddingProps } from 'styled-system'

const Container = styled.div<PaddingProps>`
  max-width: 96em;
  margin: ${({ theme }) => theme.space[0]} auto;
  ${padding}
`

export default Container
