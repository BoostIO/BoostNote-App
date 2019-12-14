import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconTag = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 38 38'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M35.929 0a2 2 0 012 2v15.784a4.962 4.962 0 01-1.464 3.535L21.906 35.878a6.949 6.949 0 01-4.949 2.051 6.95 6.95 0 01-4.95-2.051l-9.956-9.956v.001A6.955 6.955 0 010 20.973c0-1.87.729-3.628 2.051-4.95L16.61 1.464A5.037 5.037 0 0120.145 0h15.784zm-2 4H20.145c-.264 0-.521.106-.707.292L4.879 18.852A2.982 2.982 0 004 20.973c0 .734.263 1.428.743 1.975l.136.146 9.956 9.956c1.133 1.133 3.11 1.133 4.243 0l14.559-14.559a.989.989 0 00.292-.707V4zm-7.84 4.323c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
