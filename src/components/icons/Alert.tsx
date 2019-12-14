import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconAlert = (props: BoostnoteIconProps) => (
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
      <defs>
        <path
          d='M54 30c13.255 0 24 10.745 24 24S67.255 78 54 78 30 67.255 30 54s10.745-24 24-24zm1.104 30.624h-2.208c-.61 0-1.104.495-1.104 1.104v2.208c0 .61.495 1.104 1.104 1.104h2.208c.61 0 1.104-.495 1.104-1.104v-2.208c0-.61-.495-1.104-1.104-1.104zM54 42.96c-1.219 0-2.208.99-2.208 2.208V54c0 1.166.905 2.122 2.05 2.202l.158.006c1.219 0 2.208-.99 2.208-2.208v-8.832a2.209 2.209 0 00-2.05-2.202L54 42.96z'
          id='alert_svg__a'
        />
      </defs>
      <use
        fill='currentColor'
        xlinkHref='#alert_svg__a'
        transform='translate(-30 -30)'
        fillRule='evenodd'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
