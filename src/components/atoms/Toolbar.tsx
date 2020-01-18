import styled from 'Lib/styled'
import { borderTop } from 'Lib/styled/styleFunctions'

const Toolbar = styled.div`
  min-height: 32px;
  height: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  ${borderTop}
  padding: 0 5px;
`

export default Toolbar
