import React from 'react'
import styled from '../../lib/styled'

export const Label = ({
  name,
  backgroundColor,
}: {
  name: string
  backgroundColor?: string
}) => {
  return <StyledLabel style={{ backgroundColor }}>{name}</StyledLabel>
}

const StyledLabel = styled.span`
  display: inline-block;
  padding: 0.25em 0.5em;
  border-radius: 4px;
  color: white;
  background-color: #353940;
`
