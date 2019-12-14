import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconUnderline = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 22 29'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M19.556 24.889c.983 0 1.777.795 1.777 1.778s-.794 1.777-1.777 1.777H1.778A1.776 1.776 0 010 26.667c0-.983.795-1.778 1.778-1.778h17.778zm0-24.889c.983 0 1.777.795 1.777 1.778v7.11c0 5.884-4.784 10.668-10.666 10.668C4.784 19.556 0 14.772 0 8.889V1.778C0 .795.795 0 1.778 0s1.778.795 1.778 1.778v7.11c0 3.923 3.19 7.112 7.11 7.112 3.92 0 7.112-3.19 7.112-7.111V1.778c0-.983.794-1.778 1.778-1.778z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
