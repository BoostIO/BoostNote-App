import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconSplitView = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1.5em'
      height='1.5em'
      viewBox='0 0 72 72'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <g fill='none' fillRule='evenodd'>
        <path
          stroke='currentColor'
          strokeWidth={4}
          strokeLinejoin='round'
          d='M9 16h54v40H9z'
        />
        <path fill='currentColor' d='M35 18h4v36h-4z' />
      </g>
    </svg>
  </BoostnoteIconStyledContainer>
)
