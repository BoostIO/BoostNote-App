import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconArrowSingleDown = (props: BoostnoteIconProps) => (
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
        d='M24 37a2.38 2.38 0 01-1.669-.68L1.69 15.966c-.92-.908-.92-2.38.001-3.288a2.386 2.386 0 013.337.003L24 31.388l18.972-18.706a2.385 2.385 0 013.337-.003c.921.908.921 2.38.001 3.288L25.67 36.319A2.38 2.38 0 0124 37'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
