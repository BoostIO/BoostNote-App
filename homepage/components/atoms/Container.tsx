import styled from '../../lib/styled'
import { space, SpaceProps } from 'styled-system'

const Container = styled.div<SpaceProps>`
  max-width: 96em;
  margin: 0 auto;
  ${space}
`

export default Container
