import styled from '../../lib/styled'
import {
  border,
  backgroundColor,
  contextMenuShadow,
  iconColor
} from '../../lib/styled/styleFunctions'

const zIndexModalsBackground = 8001

export const StyledModalsBackground = styled.div`
  z-index: ${zIndexModalsBackground};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  ${backgroundColor};
  opacity: 0.8;
  display: flex;
  overflow: hidden;
`

export const StyledModalsContainer = styled.div`
  z-index: ${zIndexModalsBackground + 1};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 50vw;
  height: 60vh;
  ${border}
  ${backgroundColor}
  ${contextMenuShadow}
  border-radius: 4px;
  display: flex;
  overflow: hidden;
`

export const StyledModalsHeader = styled.h1`
  margin: 0;
  padding: 1em 0;
`

export const StyledModalsSkipButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 30px;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: none;
  font-size: 16px;
  white-space: nowrap;
  cursor: pointer;
  ${iconColor}

  .icon {
    display: inline-block;
    vertical-align: middle;
  }
`
