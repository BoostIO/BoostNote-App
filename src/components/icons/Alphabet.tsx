import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconAlphabet = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 38 42'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M34.976 0a2.445 2.445 0 012.445 2.444v3.784a2.445 2.445 0 01-4.89 0v-1.34H21.155v32.195h3.25a2.445 2.445 0 010 4.89H13.016a2.445 2.445 0 010-4.89h3.25V4.888H4.889v1.34a2.445 2.445 0 01-4.889 0V2.444A2.445 2.445 0 012.444 0h32.532z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
