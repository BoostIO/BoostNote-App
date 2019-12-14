import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconStar = (props: BoostnoteIconProps) => (
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
        d='M20.5 29.333c.32 0 .643.077.935.232l7.844 4.146-1.501-8.798a2 2 0 01.573-1.765l6.367-6.24-8.79-1.284a1.997 1.997 0 01-1.506-1.098L20.5 6.539l-3.922 7.987a1.997 1.997 0 01-1.506 1.098l-8.79 1.284 6.367 6.24a2 2 0 01.573 1.765l-1.501 8.798 7.844-4.146c.292-.155.614-.232.935-.232m11.434 10.043a2 2 0 01-.935-.232l-10.5-5.549-10.498 5.549a1.998 1.998 0 01-2.906-2.104l2.008-11.768L.6 16.941a1.999 1.999 0 011.11-3.408l11.74-1.715 5.254-10.699a1.999 1.999 0 013.59 0l5.253 10.699 11.74 1.715a2 2 0 011.11 3.408l-8.501 8.331 2.008 11.768a1.998 1.998 0 01-1.971 2.336'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
