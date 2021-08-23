import React from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'

interface BorderSeparatorProps {
  variant?: 'main' | 'second'
}

const BorderSeparator = ({ variant = 'main' }: BorderSeparatorProps) => (
  <Container
    className={cc([`border__separator`, `border__separator--${variant}`])}
  />
)

const Container = styled.div`
  height: 1px;
  margin: 10px 0;
  width: 100%;

  &.border__separator--main {
    background-color: ${({ theme }) => theme.colors.border.main};
  }

  &.border__separator--second {
    background-color: ${({ theme }) => theme.colors.border.second};
  }
`

export default BorderSeparator
