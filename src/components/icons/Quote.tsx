import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconQuote = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 36 30'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M34 25.667c.983 0 1.778.794 1.778 1.777 0 .984-.795 1.778-1.778 1.778H12.667a1.776 1.776 0 01-1.778-1.778c0-.983.795-1.777 1.778-1.777H34zM1.978.9c.983 0 1.778.795 1.778 1.778v24.555c0 .983-.795 1.778-1.778 1.778A1.776 1.776 0 01.2 27.233V2.678C.2 1.695.995.9 1.978.9zM26 13.222c.983 0 1.778.795 1.778 1.778s-.795 1.778-1.778 1.778H12.667A1.776 1.776 0 0110.889 15c0-.983.795-1.778 1.778-1.778H26zM34 .778c.983 0 1.778.794 1.778 1.778 0 .983-.795 1.777-1.778 1.777H12.667a1.776 1.776 0 01-1.778-1.777c0-.984.795-1.778 1.778-1.778H34z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
