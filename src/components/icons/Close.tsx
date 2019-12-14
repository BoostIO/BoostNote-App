import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconClose = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 39 39'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M38.414.586a2 2 0 010 2.828L22.328 19.499l16.087 16.086a2 2 0 01-1.244 3.407l-.17.007a1.992 1.992 0 01-1.414-.586L19.499 22.327 3.414 38.414a1.99 1.99 0 01-1.244.579L2 39a2 2 0 01-1.414-3.414L16.67 19.499.587 3.414A2 2 0 011.92.001h.162c.484.02.963.214 1.333.584L19.5 16.671 35.586.586A1.994 1.994 0 0137.08.002l.16.013c.43.052.844.242 1.173.57z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
