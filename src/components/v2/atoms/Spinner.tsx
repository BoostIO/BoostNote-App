import { keyframes } from 'styled-components'
import styled from '../../../shared/lib/styled'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.variants.primary.base};
  border-right-color: transparent;
  border-width: 2px;
  width: 1em;
  height: 1em;
  display: inline-block;
  border-radius: 50%;
  animation: ${rotate} 0.75s linear infinite;
`

export default Spinner
