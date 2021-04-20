import React from 'react'
import styled from '../../../lib/v2/styled'
import { AppComponent } from '../../../lib/v2/types'
import cc from 'classcat'

interface DoublePaneProps {
  right?: React.ReactNode
}

const DoublePane: AppComponent<DoublePaneProps> = ({
  children,
  className,
  right,
}) => (
  <Container className={cc(['two__pane', className])}>
    <div className='two__pane__left'>{children}</div>
    {right != null && <div className='two__pane__right'>{right}</div>}
  </Container>
)

const Container = styled.div`
  display: flex;
  flex-wrap: nowrap;

  .two__pane__left {
    flex: 1 1 100%;
    width: 100%;
  }

  .two__pane__right {
    flex: 0 0 auto;
    width: auto;
  }
`

export default DoublePane
