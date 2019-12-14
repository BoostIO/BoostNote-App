import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconCheck = (props: BoostnoteIconProps) => (
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
        d='M5.333 0h37.334a5.332 5.332 0 015.329 5.113l.004.22v37.334a5.332 5.332 0 01-5.113 5.329l-.22.004H5.333a5.332 5.332 0 01-5.329-5.113L0 42.667V5.333A5.332 5.332 0 015.113.004L5.333 0h37.334H5.333zm0 3A2.332 2.332 0 003 5.333v37.334A2.332 2.332 0 005.333 45h37.334A2.332 2.332 0 0045 42.667V5.333A2.332 2.332 0 0042.667 3H5.333z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
