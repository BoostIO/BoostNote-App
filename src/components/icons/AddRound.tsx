import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconAddRound = (props: BoostnoteIconProps) => (
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
        d='M24 0c13.234 0 24 10.766 24 24S37.234 48 24 48 0 37.234 0 24 10.766 0 24 0zm0 4.8C13.414 4.8 4.8 13.414 4.8 24c0 10.586 8.614 19.2 19.2 19.2 10.586 0 19.2-8.614 19.2-19.2 0-10.586-8.614-19.2-19.2-19.2zm-.001 5.417a2.4 2.4 0 012.4 2.4l-.001 8.983h8.984a2.4 2.4 0 010 4.8h-8.984v8.983a2.4 2.4 0 01-4.8 0V26.4h-8.982a2.4 2.4 0 010-4.8h8.982v-8.983a2.4 2.4 0 012.4-2.4z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
