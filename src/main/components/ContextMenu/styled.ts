import styled from '@emotion/styled'
import { menuHeight } from '../../lib/contextMenu/consts'

export const StyledContextMenu = styled.div`
  min-width: 260px;
  position: fixed;
  z-index: 9999;
  background-color: white;
  color: black;
`
export const StyledContextMenuItem = styled.div`
  height: ${menuHeight};
`
