import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconLoupe = (props: BoostnoteIconProps) => (
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
        d='M15.637 0c8.621 0 15.636 7.014 15.636 15.636 0 4.27-1.72 8.146-4.505 10.971l-.103.093a2 2 0 012.828 0l9.885 9.886a2 2 0 11-2.828 2.828l-9.885-9.886a2 2 0 01-.086-2.736 15.57 15.57 0 01-10.942 4.481C7.015 31.273 0 24.258 0 15.636c0-3.808 1.386-7.478 3.901-10.333A15.65 15.65 0 0115.637 0zm0 4a11.642 11.642 0 00-8.734 3.947A11.622 11.622 0 004 15.636c0 6.417 5.22 11.637 11.637 11.637 6.416 0 11.636-5.22 11.636-11.637C27.273 9.22 22.053 4 15.637 4z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
