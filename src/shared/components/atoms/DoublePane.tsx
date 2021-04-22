import React from 'react'
import styled from '../../lib/styled'
import { AppComponent } from '../../lib/types'
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
  flex: 1 1 auto;
  overflow: hidden;

  .two__pane__left {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
    overflow: auto;
  }

  .two__pane__right {
    flex: 0 0 auto;
    width: auto;
    overflow: auto;
  }
`

export default DoublePane
