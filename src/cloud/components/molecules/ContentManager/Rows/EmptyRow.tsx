import React from 'react'
import styled from '../../../../../shared/lib/styled'

interface EmptyRowProps {
  label: string
}

const EmptyRow = ({ label }: EmptyRowProps) => {
  return (
    <Container>
      <p>{label}</p>
    </Container>
  )
}

export default EmptyRow

const Container = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.sizes.spaces.l}px;
  color: ${({ theme }) => theme.colors.text.subtle};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
`
