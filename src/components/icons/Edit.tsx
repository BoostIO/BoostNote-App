import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconEdit = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 40 40'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M37.66 2.337c3.116 3.116 3.116 8.186 0 11.302L14.608 36.691a1.99 1.99 0 01-.942.529L2.472 39.939a1.99 1.99 0 01-1.885-.529 2 2 0 01-.53-1.886L2.776 26.33c.087-.356.27-.682.529-.942L26.357 2.337c3.119-3.117 8.19-3.115 11.303 0zM38 35.996a2 2 0 010 4H16.962a2 2 0 010-4H38zM25.364 8.986L6.531 27.82l-1.287 5.292 1.634 1.641 5.299-1.287 18.297-18.297-4.537-4.537a1.995 1.995 0 01-.573-1.646zm3.82-3.821l-2.066 2.066a1.995 1.995 0 011.647.573l4.537 4.537 1.53-1.53a3.999 3.999 0 000-5.646 4 4 0 00-5.647 0z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
