import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconFileOpen = (props: BoostnoteIconProps) => (
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
        d='M28.312 16.538a7.17 7.17 0 015.01 2.03l2.872 2.783c.45.436 1.043.676 1.67.676H49.8c3.56 0 6.523 2.595 7.099 5.992l-5.033-.012a2.401 2.401 0 00-2.066-1.18H37.865c-1.88 0-3.659-.72-5.01-2.028l-2.874-2.784a2.39 2.39 0 00-1.67-.677H16.2a2.402 2.402 0 00-2.4 2.4v25.324c0 1.323 1.076 2.4 2.4 2.4l.795-.001 7.171-17.74a3.45 3.45 0 013.004-2.165l.2-.006h30.627a4.45 4.45 0 014.229 5.834l-.096.265-5.363 13.233c-1.147 2.958-3.625 5.38-6.967 5.38H16.2c-.297 0-.59-.019-.878-.054h-.244l.012-.032C11.645 55.641 9 52.655 9 49.062V23.738c0-3.97 3.23-7.2 7.2-7.2h12.112zm29.02 19.912h-28.98l-5.988 15.011H49.8c1.324 0 2.065-1.183 2.514-2.4l5.018-12.611z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
