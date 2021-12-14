import React from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'
import { overflowEllipsis } from '../../lib/styled/styleFunctions'
import { AppComponent } from '../../lib/types'

const EllipsisText: AppComponent<{}> = ({ children, className }) => {
  return <Container className={cc([className])}>{children}</Container>
}

const Container = styled.span`
  ${overflowEllipsis()}
`

export default EllipsisText
