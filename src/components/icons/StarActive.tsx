import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconStarActive = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 41 40'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M20.5 0c.763 0 1.459.434 1.795 1.119l5.253 10.699 11.74 1.715a2 2 0 011.11 3.408l-8.501 8.331 2.008 11.768a1.998 1.998 0 01-2.906 2.104l-10.5-5.549-10.498 5.549a1.998 1.998 0 01-2.906-2.104l2.008-11.768L.6 16.941a1.999 1.999 0 011.11-3.408l11.74-1.715 5.254-10.699A1.999 1.999 0 0120.5 0z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
