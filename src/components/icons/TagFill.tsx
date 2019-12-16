import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconTagFill = (props: BoostnoteIconProps) => (
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
        d='M52.964 17.036a2 2 0 012 2V34.82a4.962 4.962 0 01-1.464 3.535L38.94 52.914a6.949 6.949 0 01-4.948 2.05 6.95 6.95 0 01-4.95-2.05l-9.956-9.956a6.955 6.955 0 01-2.051-4.95c0-1.87.729-3.627 2.05-4.95L33.646 18.5a5.037 5.037 0 013.535-1.464h15.784zm-9.841 8.322c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
