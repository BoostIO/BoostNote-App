import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconT1 = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 33 33'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M25.111 1.778C25.111.795 24.316 0 23.333 0H2C1.017 0 .222.795.222 1.778v3.555c0 .983.795 1.778 1.778 1.778s1.778-.795 1.778-1.778V3.556h7.11v21.333H9.112c-.983 0-1.778.795-1.778 1.778s.795 1.777 1.778 1.777h7.111c.983 0 1.778-.794 1.778-1.777 0-.983-.795-1.778-1.778-1.778h-1.778V3.556h7.112v1.777c0 .983.794 1.778 1.777 1.778.983 0 1.778-.795 1.778-1.778V1.778zM32.267 20.8v11a.734.734 0 01-.734.733h-1.466a.734.734 0 01-.734-.733v-9.533l-1.47.516a1.098 1.098 0 01-1.463-1.036v-.742c0-.605.371-1.148.936-1.367l4.079-1.465a.636.636 0 01.852.599V20.8z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
