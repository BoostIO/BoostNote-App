import React from 'react'
import styled from '../../../design/lib/styled'

type ViewManagerRowProps = React.PropsWithChildren<{
  className?: string
}>

const ViewManagerRow = ({ className, children }: ViewManagerRowProps) => {
  return <Container className={className}>{children}</Container>
}

export default ViewManagerRow

const Container = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.sizes.spaces.xl}px;
  color: ${({ theme }) => theme.colors.text.subtle};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
`
