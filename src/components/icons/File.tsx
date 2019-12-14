import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconFile = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 48 41'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M40.8 40.262H7.2c-3.97 0-7.2-3.23-7.2-7.2V24.87a2.4 2.4 0 014.8 0v8.192c0 1.323 1.076 2.4 2.4 2.4h33.6c1.323 0 2.4-1.077 2.4-2.4V13.227c0-1.324-1.077-2.4-2.4-2.4H28.865c-1.88 0-3.66-.72-5.01-2.028L20.98 6.015a2.39 2.39 0 00-1.67-.677H7.2a2.402 2.402 0 00-2.4 2.4v10.507a2.4 2.4 0 01-4.8 0V7.738c0-3.97 3.23-7.2 7.2-7.2H19.31a7.17 7.17 0 015.01 2.03l2.873 2.783c.45.436 1.043.676 1.67.676H40.8c3.97 0 7.2 3.23 7.2 7.2v19.835c0 3.97-3.23 7.2-7.2 7.2'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
