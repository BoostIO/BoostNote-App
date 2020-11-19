import React, { useCallback, useState } from 'react'
import { SketchPicker, ColorResult } from 'react-color'
import {
  DialogColorPickerPopover,
  DialogColorPickerCover,
  DialogColorPickerContainer,
} from './styled'
import { defaultTagColor } from '../../../lib/colors'

type ColorPickerProps = {
  handleChangeComplete: (color: string) => void
  initialColor?: string
}

const DialogColorPicker = ({
  handleChangeComplete,
  initialColor,
}: ColorPickerProps) => {
  const [color, setColor] = useState(
    initialColor ? initialColor : defaultTagColor
  )

  const handleChange = useCallback((color: ColorResult) => {
    setColor(color.hex)
  }, [])

  return (
    <DialogColorPickerContainer>
      <DialogColorPickerPopover>
        <DialogColorPickerCover onClick={() => handleChangeComplete(color)} />
        <SketchPicker
          disableAlpha={true}
          color={color}
          onChange={handleChange}
        />
      </DialogColorPickerPopover>
    </DialogColorPickerContainer>
  )
}

export default DialogColorPicker
