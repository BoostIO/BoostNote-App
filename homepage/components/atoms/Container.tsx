import styled from '../../lib/styled'
import { space, SpaceProps, color, ColorProps } from 'styled-system'

const Container = styled.div<SpaceProps | ColorProps>`
  max-width: 96em;
  margin: 0 auto;
  ${space}
  ${color}
`

export default Container
