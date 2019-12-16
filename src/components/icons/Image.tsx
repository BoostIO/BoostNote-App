import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconImage = (props: BoostnoteIconProps) => (
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
        <path d='M51 53.413H22c-3.31 0-6-2.692-6-6V24.588c0-3.31 2.69-6 6-6h28c3.309 0 6 2.69 6 6v8.705a2 2 0 01-4 0v-8.705c0-1.103-.897-2-2-2H22c-1.103 0-2 .897-2 2v22.825c0 1.103.897 2 2 2h29c.552 0 1-.45 1-1v-5.634a2 2 0 014 0v5.634c0 2.757-2.243 5-5 5' />
        <path d='M21 52.836a2 2 0 01-1.413-3.416l20.692-20.656a1.942 1.942 0 011.426-.583c.534.003 1.045.22 1.418.602L55.43 41.38a2 2 0 01-2.862 2.796L41.675 33.024 22.413 52.252a1.996 1.996 0 01-1.413.584M28.982 34.541c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4' />
      </g>
    </svg>
  </BoostnoteIconStyledContainer>
)
