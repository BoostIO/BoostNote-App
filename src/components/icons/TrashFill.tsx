import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconTrashFill = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 72 72'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M0 0h72v72H0z'
        fill='currentColor'
        fillOpacity={0.87}
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
