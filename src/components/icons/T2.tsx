import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconT2 = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 36 32'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <path
        d='M25.111 1.778C25.111.795 24.316 0 23.333 0H2C1.017 0 .222.795.222 1.778v3.555c0 .983.795 1.778 1.778 1.778s1.778-.795 1.778-1.778V3.556h7.11v21.333H9.112c-.983 0-1.778.795-1.778 1.778s.795 1.777 1.778 1.777h7.111c.983 0 1.778-.794 1.778-1.777 0-.983-.795-1.778-1.778-1.778h-1.778V3.556h7.112v1.777c0 .983.794 1.778 1.777 1.778.983 0 1.778-.795 1.778-1.778V1.778zm9.332 27.44a1.157 1.157 0 110 2.315h-6.176c-1.357 0-1.467-1.072-1.467-1.428 0-.345.116-.682.336-.954 1.14-1.409 4.749-5.953 5.009-6.394.309-.525.538-1.193.532-1.826a2.297 2.297 0 00-.05-.462c-.145-.675-.679-1.286-1.427-1.286-.647 0-1.29.346-1.57 1.13a1.46 1.46 0 01-2.83-.513c0-.81 1.261-2.933 4.4-2.933 1.49 0 2.338.358 3.162 1.073.824.716 1.238 1.725 1.238 3.03 0 .716-.28 1.837-.975 2.77-.496.665-3.985 5.477-3.985 5.477h3.803z'
        fill='currentColor'
        fillRule='nonzero'
      />
    </svg>
  </BoostnoteIconStyledContainer>
)
