import React from 'react'
import styled from '../../lib/styled'
import Icon, { IconProps } from './Icon'

function NotifyIcon(props: IconProps) {
  return (
    <Container>
      <Icon {...props} />
    </Container>
  )
}

export default NotifyIcon
const Container = styled.div`
  position: relative;
  &:after {
    position: absolute;
    content: '';
    width: 6px;
    height: 6px;
    background-color: ${({ theme }) => theme.colors.variants.danger.base};
    top: 2px;
    right: 2px;
    border-radius: 50%;
  }
`
