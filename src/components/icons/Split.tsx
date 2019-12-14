import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconSplit = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 49 44'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M48.51 22.157c0-.41-.156-.817-.468-1.13l-7.088-6.576c-.777-.722-2.041-.17-2.044.89v4.416h-7.247v-16.8a2.4 2.4 0 10-4.8 0v38.4a2.4 2.4 0 104.8 0v-16.8h7.247v4.42c0 1.061 1.267 1.614 2.044.891l7.088-6.576c.312-.314.468-.725.468-1.135zm-26.447-19.2a2.4 2.4 0 10-4.8 0v16.8h-7.2v-4.415c0-1.061-1.266-1.613-2.043-.891L.932 21.028a1.603 1.603 0 000 2.264l7.088 6.576c.777.72 2.043.166 2.043-.895v-4.416h7.2v16.8a2.4 2.4 0 104.8 0v-38.4z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
