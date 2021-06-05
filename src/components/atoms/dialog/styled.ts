import { getColorBrightness } from '../../../lib/colors'
import styled from '../../../shared/lib/styled'
import { border } from '../../../shared/lib/styled/styleFunctions'
import { backgroundColor } from '../../../shared/lib/styled/styleFunctions'

const dialogZIndex = 8000

export const DialogBackground = styled.div`
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

export const DialogContainer = styled.div`
  width: 100%;
  max-width: 450px;
  ${backgroundColor} ${border}
  border-style: solid;
  padding: 20px;
  border-width: 0 1px 1px 1px;
  font-size: 14px;
  box-sizing: border-box;
  border-radius: 0 0 5px 5px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.35);
  outline: none;
  display: flex;
`

export const DialogTitle = styled.h1`
  margin: 0 0 10px;
  padding: 0;
  font-size: 14px;
`

export const DialogMessage = styled.p`
  margin: 0;
  padding: 0;
  font-size: 12px;
  margin-bottom: 20px;
`

export const tagItemHeightSize = `18px`

export const DialogColorPickerContainer = styled.div`
  display: flex;
  margin-top: ${tagItemHeightSize};
  z-index: 6000;
`

export const DialogColorMessage = styled.p`
  margin: auto 0;
`

export const DialogColorPickerButton = styled.button`
  width: 64px;
  margin-left: 8px;
  border: none;
  border-radius: 2px;
  background-color: rgba(0, 0, 0, 0.12);
  display: inline-block;
  cursor: pointer;
`

export const DialogColorPreview = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  border-radius: 2px;
  color: ${({ theme }) =>
    getColorBrightness(theme.colors.background.primary) > 125
      ? 'black'
      : 'white'};
`

interface DialogColorPickerPopoverLocationProps {
  offsetLeft: number
}

export const DialogColorPickerPopover = styled.div<
  DialogColorPickerPopoverLocationProps
>`
  position: absolute;
  right: 10px;
  z-index: 6000;
  .sketch-picker {
    margin-top: 3px;
  }
`

export const DialogColorPickerCover = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`
