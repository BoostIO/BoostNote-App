import styled from '../../lib/styled'
import {
  border,
  backgroundColor,
  inputStyle,
  secondaryButtonStyle
} from '../../lib/styled/styleFunctions'

const dialogZIndex = 8000

export const StyledDialogBackground = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: ${dialogZIndex};
  display: flex;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: flex-start;
`

export const StyledDialog = styled.div`
  width: 100%;
  max-width: 450px;
  ${backgroundColor}
  ${border}
  border-style: solid;
  padding: 20px;
  border-width: 0 1px 1px 1px;
  font-size: 14px;
  box-sizing: border-box;
  border-radius: 0 0 5px 5px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.35);
  outline: none;
  display: flex;
`

export const StyledIcon = styled.div`
  font-size: 70px;
  line-height: 100%;
  margin-right: 15px;
`

export const StyledDialogBody = styled.div`
  flex: 1;
`

export const StyledDialogTitle = styled.h1`
  margin: 0 0 10px;
  padding: 0;
  font-size: 14px;
`

export const StyledDialogMessage = styled.p`
  margin: 0;
  padding: 0;
  font-size: 12px;
  margin-bottom: 20px;
`

export const StyledDialogPromptInput = styled.input`
  width: 100%;
  margin-bottom: 15px;
  height: 32px;
  outline: none;
  padding: 0 8px;
  ${inputStyle}
`

export const StyledDialogButtonGroup = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row-reverse;
`

export const StyledDialogButton = styled.button`
  padding: 5px 10px;
  border-radius: 2px;
  margin-left: 8px;
  user-select: none;
  ${secondaryButtonStyle}
`
