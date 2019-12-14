import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconArrowSingleRight = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 25 45'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M2.261 44.088a2.26 2.26 0 01-1.577-3.882l18.682-18.162L.684 3.883A2.26 2.26 0 113.838.64l20.348 19.782a2.265 2.265 0 010 3.242L3.838 43.448c-.44.427-1.008.64-1.577.64'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
