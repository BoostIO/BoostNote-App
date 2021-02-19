import React, { CSSProperties } from 'react'
import CustomButton from './buttons/CustomButton'

const SmallButtonStyle: CSSProperties = {
  lineHeight: 'normal',
  padding: '0 8px',
}

const SmallButton = ({
  children,
  ...rest
}: Parameters<typeof CustomButton>[0]) => {
  return (
    <CustomButton {...rest} style={SmallButtonStyle}>
      {children}
    </CustomButton>
  )
}

export default SmallButton
