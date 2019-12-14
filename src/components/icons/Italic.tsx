import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconItalic = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 18 29'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M16 0H8.889C7.906 0 7.11.795 7.11 1.778s.795 1.778 1.778 1.778h1.2L3.993 24.889H1.778c-.983 0-1.778.795-1.778 1.778s.795 1.777 1.778 1.777h7.11a1.776 1.776 0 100-3.556h-1.2l6.097-21.332H16c.983 0 1.778-.795 1.778-1.778S16.983 0 16 0'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
