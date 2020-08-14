import styled from '../../lib/styled'
import {
  space,
  layout,
  flexbox,
  LayoutProps,
  SpaceProps,
  FlexboxProps,
} from 'styled-system'

const Column = styled.div<SpaceProps & LayoutProps & FlexboxProps>`
  padding-left: ${({ theme }) => theme.space[3]}px;
  padding-right: ${({ theme }) => theme.space[3]}px;
  ${space}
  ${layout}
  ${flexbox}
`

export default Column
