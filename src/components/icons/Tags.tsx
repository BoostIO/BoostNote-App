import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconTags = (props: BoostnoteIconProps) => (
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
      <g fill='currentColor' fillRule='evenodd'>
        <path d='M54.928 36.513l.001 3.271a4.962 4.962 0 01-1.464 3.535L38.906 57.878a6.949 6.949 0 01-4.949 2.051 6.95 6.95 0 01-4.95-2.051l-9.956-9.955A6.955 6.955 0 0117 42.973c0-.73.111-1.443.325-2.12l8.854 8.853c.288.289 2.173 2.07 5.656 5.344l.14.13c1.102.96 2.861.96 3.963 0l.14-.13c3.404-3.195 5.29-4.976 5.657-5.345l13.193-13.192z' />
        <path d='M52.929 11a2 2 0 012 2v15.784a4.962 4.962 0 01-1.464 3.535L38.906 46.878a6.949 6.949 0 01-4.949 2.051 6.95 6.95 0 01-4.95-2.051l-9.956-9.956v.001A6.955 6.955 0 0117 31.973c0-1.87.729-3.628 2.051-4.95L33.61 12.464A5.037 5.037 0 0137.145 11h15.784zm-2 4H37.145c-.264 0-.521.106-.707.292l-14.559 14.56A2.982 2.982 0 0021 31.973c0 .734.263 1.428.743 1.975l.136.146 9.956 9.956c1.133 1.133 3.11 1.133 4.243 0l14.559-14.559a.989.989 0 00.292-.707V15zm-7.84 4.323c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5z' />
      </g>
    </svg>
  </BoostnoteIconStyledContainer>
)
