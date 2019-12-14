import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconLineThrough = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 36 36'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M34 16.222H18c-3.922 0-7.111-2.79-7.111-6.222 0-3.431 3.19-6.222 7.111-6.222 2.532 0 4.892 1.223 6.164 3.187a1.773 1.773 0 002.458.528 1.78 1.78 0 00.526-2.458C25.202 2.02 21.781.222 18 .222 12.117.222 7.333 4.608 7.333 10c0 2.375.966 4.526 2.507 6.222H2c-.983 0-1.778.795-1.778 1.778S1.017 19.778 2 19.778h16c3.922 0 7.111 2.79 7.111 6.222 0 3.431-3.19 6.222-7.111 6.222-2.532 0-4.892-1.221-6.164-3.187a1.766 1.766 0 00-2.458-.528 1.78 1.78 0 00-.526 2.458c1.946 3.014 5.367 4.813 9.148 4.813 5.883 0 10.667-4.386 10.667-9.778 0-2.375-.966-4.526-2.507-6.222H34c.983 0 1.778-.795 1.778-1.778s-.795-1.778-1.778-1.778'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
