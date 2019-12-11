import styled from '../../lib/styled'
import { borderTop } from '../../lib/styled/styleFunctions'

const Toolbar = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  ${borderTop}
  padding: 0 5px;

  .icons {
    flex: 1 0 0;
    align-items: center;
    display: flex;
    justify-content: flex-end;
  }
`

export default Toolbar
