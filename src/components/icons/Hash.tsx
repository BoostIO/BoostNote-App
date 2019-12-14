import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconHash = (props: BoostnoteIconProps) => (
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
        d='M45.333 34.667H40V13.333h5.333a2.668 2.668 0 000-5.333H40V2.667a2.668 2.668 0 00-5.333 0V8H13.333V2.667a2.668 2.668 0 00-5.333 0V8H2.667a2.668 2.668 0 000 5.333H8v21.334H2.667a2.668 2.668 0 000 5.333H8v5.333a2.668 2.668 0 005.333 0V40h21.334v5.333a2.668 2.668 0 005.333 0V40h5.333a2.668 2.668 0 000-5.333zm-10.666 0H13.333V13.333h21.334v21.334z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
