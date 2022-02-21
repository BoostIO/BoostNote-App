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
    content: attr(data-text);
    content: attr(data-text);
    width: 12px;
    height: 12px;
    background-color: #cd4400;
    top: 1px;
    right: -2px;
    border-radius: 50%;
    transform: translate3d(25%, -25%, 0);
  }
`