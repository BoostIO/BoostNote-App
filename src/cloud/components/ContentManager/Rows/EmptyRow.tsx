import React from 'react'
import styled from '../../../../design/lib/styled'
import cc from 'classcat'

interface EmptyRowProps {
  label: string
  bordered?: boolean
}

const EmptyRow = ({ label, bordered = true }: EmptyRowProps) => {
  return (
    <Container
      className={cc(['empty__row', bordered && 'empty__row--bordered'])}
    >
      <p>{label}</p>
    </Container>
  )
}

export default EmptyRow

const Container = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.subtle};
  padding: 0 ${({ theme }) => theme.sizes.spaces.xl}px;

  &.empty__row--bordered {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
    padding: 0 ${({ theme }) => theme.sizes.spaces.l}px;
    p {
      padding-left: ${({ theme }) => theme.sizes.spaces.md}px;
    }
  }
`
