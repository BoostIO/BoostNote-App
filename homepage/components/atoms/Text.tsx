import styled from '../../lib/styled'
import {
  space,
  SpaceProps,
  color,
  ColorProps,
  typography,
  TypographyProps,
} from 'styled-system'

const Text = styled.div<SpaceProps & ColorProps & TypographyProps>`
  ${space}
  ${color}
  ${typography}
`

export default Text
