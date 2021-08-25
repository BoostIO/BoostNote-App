import React from 'react'
import styled from '../../../../lib/styled'

const MetadataContainerBreak = () => <Container className='metadata__break' />

const Container = styled.div`
  &.metadata__break {
    display: block;
    height: 1px;
    margin: 0px ${({ theme }) => theme.sizes.spaces.sm}px;
    background-color: ${({ theme }) => theme.colors.background.quaternary};
  }
`

export default MetadataContainerBreak
