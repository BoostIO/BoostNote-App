import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconAdjustVertical = (props: BoostnoteIconProps) => (
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
        d='M6.087 24.556a2 2 0 012 2V37a2 2 0 01-4 0V26.556a2 2 0 012-2zm26.585 2.668a2 2 0 012 2V37a2 2 0 01-4 0v-7.776a2 2 0 012-2zM22.742 8.69a2.465 2.465 0 010 4.93l-1.363-.001V37a2 2 0 01-4 0V13.62h-1.361a2.465 2.465 0 010-4.93h6.724zM32.672 0a2 2 0 012 2v18.553h1.362a2.465 2.465 0 010 4.93H29.31a2.465 2.465 0 010-4.93h1.362V2a2 2 0 012-2zM6.087 0a2 2 0 012 2v15.843h1.101a2.465 2.465 0 010 4.93H2.464a2.465 2.465 0 010-4.93h1.623V2a2 2 0 012-2zM19.38 0a2 2 0 012 2v3.498a2 2 0 01-4 0V2a2 2 0 012-2z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
