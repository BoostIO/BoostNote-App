import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconInfo = (props: BoostnoteIconProps) => (
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
        d='M24 0c13.255 0 24 10.745 24 24S37.255 48 24 48 0 37.255 0 24 10.745 0 24 0zm0 3.84C12.866 3.84 3.84 12.866 3.84 24S12.866 44.16 24 44.16 44.16 35.134 44.16 24 35.134 3.84 24 3.84zm0 17.952c1.219 0 2.208.99 2.208 2.208v8.832a2.209 2.209 0 01-2.05 2.202L24 35.04a2.209 2.209 0 01-2.208-2.208V24c0-1.166.905-2.122 2.05-2.202l.158-.006zm1.104-8.832c.61 0 1.104.495 1.104 1.104v2.208c0 .61-.495 1.104-1.104 1.104h-2.208c-.61 0-1.104-.495-1.104-1.104v-2.208c0-.61.495-1.104 1.104-1.104h2.208z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
