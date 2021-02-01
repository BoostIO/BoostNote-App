import styled from '../../../lib/styled'
import {
  inputStyle,
  secondaryButtonStyle,
  baseButtonStyle,
  dangerButtonStyle,
} from '../../../lib/styled/styleFunctions'

const dialogZIndex = 8003

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
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  border-color: ${({ theme }) => theme.baseBorderColor};
  border-style: solid;
  border-width: 0 1px 1px 1px;
  padding: ${({ theme }) => theme.space.default}px;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  box-sizing: border-box;
  border-radius: 0 0 5px 5px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.35);
  outline: none;
  display: flex;
  position: absolute;
  right: 0;
  left: 0;
  top: ${({ theme }) => theme.space.small}px;
  z-index: ${dialogZIndex + 1};
  margin: auto;
`

export const StyledIcon = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xxxsmall * 7}px;
  line-height: 100%;
  margin-right: ${({ theme }) => theme.space.small}px;
`

export const StyledDialogBody = styled.div`
  flex: 1;
`

export const StyledDialogTitle = styled.h1`
  margin: 0 0 ${({ theme }) => theme.space.xsmall}px;
  padding: 0;
  font-size: ${({ theme }) => theme.fontSizes.default}px;
`

export const StyledDialogMessage = styled.p`
  margin: 0;
  padding: 0;
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
  margin-bottom: ${({ theme }) => theme.space.default}px;
`

export const StyledDialogPromptInput = styled.input`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.space.small}px;
  height: 32px;
  outline: none;
  padding: 0 ${({ theme }) => theme.space.xsmall}px;
  ${inputStyle}
`

export const StyledDialogButtonGroup = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row-reverse;
`

export const StyledDialogButton = styled.button`
  padding: ${({ theme }) => theme.space.xxsmall}px
    ${({ theme }) => theme.space.xsmall}px;
  border-radius: 4px;
  margin-left: ${({ theme }) => theme.space.xsmall}px;
  user-select: none;
  ${baseButtonStyle}
  ${secondaryButtonStyle}
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  line-height: ${({ theme }) => theme.fontSizes.small}px;
  height: 40px;

  &.danger {
    ${dangerButtonStyle}
  }
`
