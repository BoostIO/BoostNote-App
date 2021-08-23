import React from 'react'
import styled from '../../lib/styled'
import { AppComponent } from '../../lib/types'
import cc from 'classcat'

interface DoublePaneProps {
  leftFlex?: string
  rightFlex?: string
  right?: React.ReactNode
  idLeft?: string
  idRight?: string
}

const DoublePane: AppComponent<DoublePaneProps> = ({
  children,
  className,
  right,
  idLeft,
  idRight,
  leftFlex = '1 1 auto',
  rightFlex = '1 1 auto',
}) => (
  <Container className={cc(['two__pane', className])}>
    <div className='two__pane__left' id={idLeft} style={{ flex: leftFlex }}>
      {children}
    </div>
    {right != null && (
      <div
        className='two__pane__right'
        id={idRight}
        style={{ flex: rightFlex }}
      >
        {right}
      </div>
    )}
  </Container>
)

const Container = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex: 1 1 auto;
  overflow: hidden;

  .two__pane__left,
  .two__pane__right {
    width: auto;
    min-width: 0;
    overflow: auto;
  }
`

export default DoublePane
