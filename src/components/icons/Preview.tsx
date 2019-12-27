import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconPreview = (props: BoostnoteIconProps) => (
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
        <path
          d='M36.36 23c7.47 0 14.423 4.5 18.147 11.745l-.009-.018a1.931 1.931 0 01.148 1.424c-.037.127-.086.25-.148.367l.009-.018C50.783 43.744 43.83 48.245 36.36 48.245c-7.462 0-14.41-4.493-18.137-11.727a1.907 1.907 0 01-.2-.596l-.008-.06a1.936 1.936 0 010-.479l.009-.06c.033-.208.1-.41.198-.596C21.95 27.493 28.898 23 36.36 23zm0 3.86c-5.7 0-11.064 3.333-14.207 8.762 3.143 5.43 8.507 8.763 14.207 8.763 5.7 0 11.064-3.333 14.207-8.762-3.143-5.43-8.506-8.763-14.207-8.763zm0 2.403c3.531 0 6.403 2.853 6.403 6.359 0 3.507-2.872 6.36-6.403 6.36-3.53 0-6.403-2.853-6.403-6.36 0-3.506 2.873-6.359 6.403-6.359zm0 3.624c-1.519 0-2.755 1.227-2.755 2.735 0 1.51 1.236 2.736 2.755 2.736a2.749 2.749 0 002.755-2.736c0-1.508-1.236-2.735-2.755-2.735z'
          fill='currentColor'
        />
      </g>
    </svg>
  </BoostnoteIconStyledContainer>
)
