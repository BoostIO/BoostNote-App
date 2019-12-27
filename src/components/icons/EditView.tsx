import {
  BoostnoteIconProps,
  BoostnoteIconStyledContainer
} from '../../lib/icons'
import React from 'react'

export const IconEditView = (props: BoostnoteIconProps) => (
  <BoostnoteIconStyledContainer>
    <svg
      width='1.5em'
      height='1.5em'
      viewBox='0 0 72 72'
      {...props}
      style={
        props.size != null
          ? { ...props.style, width: props.size, height: props.size }
          : props.style
      }
    >
      <g fill='none' fillRule='evenodd'>
        <path
          stroke='currentColor'
          strokeWidth={4}
          strokeLinejoin='round'
          d='M9 16h54v40H9z'
        />
        <path
          d='M28.996 41.89h-1.643c-1.279 0-2.042-.713-2.042-1.842 0-1.411.93-2.324 2.49-2.324h2.025l.714-3.67h-1.693c-1.262 0-2.042-.746-2.042-1.859 0-1.427.946-2.34 2.507-2.34h2.042l.846-4.118c.266-1.41 1.063-2.075 2.39-2.075 1.23 0 1.96.714 1.96 1.81 0 .215-.033.53-.083.747l-.714 3.635h3.719l.83-4.117c.265-1.41 1.062-2.075 2.39-2.075 1.229 0 1.943.714 1.943 1.81 0 .215-.017.53-.067.747l-.73 3.635h1.71c1.278 0 2.042.714 2.042 1.843 0 1.411-.93 2.324-2.49 2.324h-2.092l-.714 3.67h1.743c1.262 0 2.042.73 2.042 1.859 0 1.428-.946 2.34-2.507 2.34H41.48l-.896 4.417c-.266 1.41-1.063 2.075-2.39 2.075-1.23 0-1.943-.714-1.943-1.81 0-.216.017-.531.066-.747l.797-3.934h-3.752l-.88 4.432c-.265 1.395-1.062 2.059-2.39 2.059-1.229 0-1.943-.714-1.943-1.81 0-.216.017-.531.067-.747l.78-3.934zm4.748-3.751h4.416l.93-4.55h-4.433l-.913 4.55z'
          fill='currentColor'
          fillRule='nonzero'
        />
      </g>
    </svg>
  </BoostnoteIconStyledContainer>
)
