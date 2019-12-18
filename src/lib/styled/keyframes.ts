import { keyframes } from 'styled-components'

export const scaleAndTransformFromLeft = () => keyframes`
  0% {
    transform: scaleY(0.3);
    left: -200px;
  }
  100% {
    transform: scaleY(1);
    left: 0;
  }
`
