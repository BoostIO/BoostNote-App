import React from 'react'
import styled from '../../../lib/styled'

const PageContainer: React.FC = ({ children }) => {
  return <Container>{children}</Container>
}

export default PageContainer

const Container = styled.div`
  background: linear-gradient(#302642, #292b36);
  color: #c0bfc5;
  min-height: 100%;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`
