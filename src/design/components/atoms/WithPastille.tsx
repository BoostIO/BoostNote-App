import React from 'react'
import styled from '../../lib/styled'

export const WithPastille = ({ children }: React.PropsWithChildren<{}>) => (
  <Container>{children}</Container>
)

export default WithPastille

const Container = styled.div`
  position: relative;
  &:after {
    position: absolute;
    content: '';
    width: 12px;
    height: 12px;
    background-color: #cd4400;
    top: 1px;
    right: -2px;
    border-radius: 50%;
    transform: translate3d(25%, -25%, 0);
  }
`
