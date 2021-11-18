import React from 'react'
import styled from '../../../../design/lib/styled'

type TableContentManagerRowProps = React.PropsWithChildren<{
  className?: string
}>

const TableContentManagerRow = ({
  className,
  children,
}: TableContentManagerRowProps) => {
  return <Container className={className}>{children}</Container>
}

export default TableContentManagerRow

const Container = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.sizes.spaces.xl}px;
  color: ${({ theme }) => theme.colors.text.subtle};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
`
