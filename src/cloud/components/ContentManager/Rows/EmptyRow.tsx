import React from 'react'
import styled from '../../../../design/lib/styled'

interface EmptyRowProps {
  label: string
  className?: string
}

const EmptyRow = ({ label, className }: EmptyRowProps) => {
  return (
    <Container className={className}>
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

  p {
    padding-left: ${({ theme }) => theme.sizes.spaces.md}px;
  }
`
