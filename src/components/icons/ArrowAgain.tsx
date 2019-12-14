import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconArrowAgain = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 32 34'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M27.644 1.79l.77 7.28a1.999 1.999 0 01-1.777 2.199l-7.28.773a2 2 0 11-.422-3.978l2.533-.27a11.777 11.777 0 00-4.047-1.319 11.721 11.721 0 00-8.748 2.297 11.74 11.74 0 00-4.561 7.81 11.741 11.741 0 002.297 8.747 11.74 11.74 0 007.81 4.561c6.46.88 12.426-3.65 13.309-10.107a11.727 11.727 0 00-.398-5.035 2 2 0 113.826-1.166c.667 2.19.847 4.457.535 6.742C30.408 28.242 23.608 34 15.83 34c-.711 0-1.43-.048-2.153-.147A15.711 15.711 0 013.224 27.75 15.717 15.717 0 01.149 16.04 15.72 15.72 0 016.254 5.586a15.703 15.703 0 0111.708-3.074A15.85 15.85 0 0123.919 4.6l-.254-2.387a2 2 0 011.779-2.2 2 2 0 012.2 1.778z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
