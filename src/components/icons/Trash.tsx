import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconTrash = (props: BoostnoteIconProps) => (
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
        d='M23.804 0c4.623 0 8.433 3.545 8.856 8.058l12.744.001a2.204 2.204 0 110 4.409l-1.757-.001v28.137a7.012 7.012 0 01-7.004 7.005H11.101a7.012 7.012 0 01-7.004-7.005l-.001-28.137H2.204a2.204 2.204 0 110-4.408h9.243a2.204 2.204 0 110 4.409l-2.942-.001v28.137a2.599 2.599 0 002.596 2.596h25.542a2.6 2.6 0 002.596-2.596l-.001-28.137H17.114l-.157-.005-.155-.016a2.193 2.193 0 01-1.566-1.028l-.073-.128a2.194 2.194 0 01-.253-1.027V8.894C14.91 3.99 18.9 0 23.804 0zm8.885 16.98c1.218 0 2.205.987 2.205 2.205v17.298a2.204 2.204 0 11-4.41 0V19.185c0-1.218.987-2.205 2.205-2.205zm-17.634 0c1.218 0 2.204.987 2.204 2.205v17.298a2.204 2.204 0 11-4.408 0V19.185c0-1.218.986-2.205 2.204-2.205zm8.838 0c1.218 0 2.205.987 2.205 2.205v17.298a2.204 2.204 0 11-4.41 0V19.185c0-1.218.987-2.205 2.205-2.205zM23.804 4.41a4.494 4.494 0 00-4.407 3.65l8.814-.001-.043-.205a4.495 4.495 0 00-4.364-3.444z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
