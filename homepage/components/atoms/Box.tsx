import styled from '../../lib/styled'
import { space, SpaceProps, color, ColorProps } from 'styled-system'

const Box = styled.div<SpaceProps & ColorProps>`
  ${space}
  ${color}
`

export default Box
