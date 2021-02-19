import { keyframes } from 'styled-components'
import { StyledProps } from './styleFunctions'

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

export const rotateKeyframe = () => keyframes`
  100% {
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    transform:rotate(360deg);
  }
`

export const loadingColorKeyframe = () => keyframes`
 0% {
   color: ${({ theme }: StyledProps) => theme.baseTextColor}
 }
 50% {
  color: ${({ theme }: StyledProps) => theme.emphasizedTextColor}
}
 100% {
  color: ${({ theme }: StyledProps) => theme.baseTextColor}
}`
