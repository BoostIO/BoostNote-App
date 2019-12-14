import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconArrowOutput = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 44 47'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M.813 23.298a2.287 2.287 0 014.572 0v17.085c0 .631.513 1.143 1.142 1.143h30.856c.63 0 1.143-.512 1.143-1.143V23.298a2.287 2.287 0 014.572 0v17.085a5.72 5.72 0 01-5.715 5.715H6.527a5.722 5.722 0 01-5.714-5.715V23.298zm6.507-9.42L20.34.856a2.286 2.286 0 013.232 0l13.019 13.02c.447.447.67 1.03.67 1.616a2.285 2.285 0 01-3.902 1.616L24.24 7.991l.001 19.07a2.286 2.286 0 01-4.571 0V7.991l-9.118 9.118a2.285 2.285 0 11-3.232-3.232z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
