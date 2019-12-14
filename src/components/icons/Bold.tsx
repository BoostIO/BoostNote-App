import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconBold = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 22 30'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M3.889 13.222V4.333h9.778a4.448 4.448 0 014.444 4.445 4.448 4.448 0 01-4.444 4.444H3.889zm14.222 8a4.448 4.448 0 01-4.444 4.445H3.889v-8.89h9.778a4.448 4.448 0 014.444 4.445zm3.556-12.444c0-4.41-3.59-8-8-8H2.11c-.983 0-1.778.794-1.778 1.778v24.888c0 .984.795 1.778 1.778 1.778h11.556c4.41 0 8-3.59 8-8 0-2.526-1.2-4.755-3.035-6.222 1.835-1.467 3.035-3.696 3.035-6.222z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
