import styled from '../../lib/styled'
import { space, layout, flexbox } from 'styled-system'

const Column = styled.div`
  ${space}
  ${layout}
  ${flexbox}

  box-sizing: border-box;
  padding-left: ${({ theme }) => theme.space[3]}px;
  padding-right: ${({ theme }) => theme.space[3]}px;
`

export default Column
