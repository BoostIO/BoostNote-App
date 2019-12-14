import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconLink = (props: BoostnoteIconProps) => (
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
        d='M13.09 15c-5.314 0-9.564 4.515-9.047 9.882.45 4.68 4.69 8.118 9.439 8.118h5.063a1.81 1.81 0 001.819-1.8c0-.994-.815-1.8-1.819-1.8H13.4c-2.953 0-5.6-2.19-5.753-5.112-.165-3.114 2.335-5.688 5.444-5.688h5.454a1.81 1.81 0 001.819-1.8c0-.994-.815-1.8-1.819-1.8h-5.454zm16.365 0a1.81 1.81 0 00-1.819 1.8c0 .994.815 1.8 1.819 1.8H34.6c2.953 0 5.6 2.19 5.753 5.112.165 3.114-2.335 5.688-5.444 5.688h-5.454a1.81 1.81 0 00-1.819 1.8c0 .994.815 1.8 1.819 1.8h5.454c5.315 0 9.565-4.515 9.048-9.882-.45-4.68-4.69-8.118-9.439-8.118h-5.063zm-12.728 7.2A1.81 1.81 0 0014.91 24c0 .994.815 1.8 1.818 1.8h14.546A1.81 1.81 0 0033.09 24c0-.994-.815-1.8-1.818-1.8H16.727z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
