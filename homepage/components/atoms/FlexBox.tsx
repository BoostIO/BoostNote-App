import styled from '../../lib/styled'
import { space, SpaceProps, flexbox, FlexboxProps } from 'styled-system'

const FlexBox = styled.div<SpaceProps & FlexboxProps>`
  display: flex;
  ${space}
  ${flexbox}
`

export default FlexBox
