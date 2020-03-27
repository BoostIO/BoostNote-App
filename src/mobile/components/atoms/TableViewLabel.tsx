import styled from '../../../lib/styled'
import { uiTextColor, borderBottom } from '../../../lib/styled/styleFunctions'

const TableViewLabel = styled.div`
  height: 24px;
  width: 100%;
  padding: 0 1em;
  text-align: left;
  font-size: 14px;
  line-height: 24px;
  ${uiTextColor}
  ${borderBottom}
`

export default TableViewLabel
