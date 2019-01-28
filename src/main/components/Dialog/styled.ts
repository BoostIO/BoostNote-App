import styled from '../../lib/styled'
import { dialogZIndex } from '../../lib/dialog/consts'

export const StyledDialog = styled.div`
  width: 100%;
  max-width: 450px;
  position: fixed;
  z-index: ${dialogZIndex};
  left: 50%;
  background-color: ${({ theme }) => theme.contextMenu.backgroundColor};
  border-color: ${({ theme }) => theme.contextMenu.borderColor};
  border-style: solid;
  padding: 20px;
  border-width: 1px;
  font-size: 14px;
  box-sizing: border-box;
  border-radius: 5px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.35);
  outline: none;
`
