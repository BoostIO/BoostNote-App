import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconHelpOutline = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 72 72'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M36 16c-11.029 0-20 8.971-20 20s8.971 20 20 20 20-8.971 20-20-8.971-20-20-20zm0 3.333A16.64 16.64 0 0152.667 36 16.64 16.64 0 0136 52.667 16.64 16.64 0 0119.333 36 16.64 16.64 0 0136 19.333zM36 26c-2.981 0-5.524 1.986-6.368 4.7-.066.21-.124.483-.174.818a1 1 0 00.989 1.149h1.337a1 1 0 00.979-.798l.036-.147A3.303 3.303 0 0136 29.333a3.307 3.307 0 013.333 3.334c0 1.276-.82 2.409-2.03 2.812l-.678.209a3.368 3.368 0 00-2.292 3.177v.468a1.667 1.667 0 003.334 0v-.468l.677-.209a6.345 6.345 0 004.323-5.99C42.667 29.002 39.665 26 36 26zm-1.667 18.333a1.667 1.667 0 103.334 0 1.667 1.667 0 00-3.334 0z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
