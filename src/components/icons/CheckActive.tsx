import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconCheckActive = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 48 48'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M42.667 0H5.333A5.332 5.332 0 000 5.333v37.334A5.332 5.332 0 005.333 48h37.334A5.332 5.332 0 0048 42.667V5.333A5.332 5.332 0 0042.667 0zm-24 38.437L8 27.771A2.666 2.666 0 1111.77 24l6.897 6.896 17.562-17.563A2.666 2.666 0 1140 17.104L18.667 38.437z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
