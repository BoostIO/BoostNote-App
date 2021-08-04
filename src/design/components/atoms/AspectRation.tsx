import React from 'react'
import styled from '../../lib/styled'

interface AspectRationProps {
  height: number
  width: number
}

const AspectRatio = ({
  height,
  width,
  children,
}: React.PropsWithChildren<AspectRationProps>) => {
  return (
    <Container style={{ paddingTop: `${(height / width) * 100}%` }}>
      <div>{children}</div>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  position: relative;

  & > div {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }
`

export default AspectRatio
