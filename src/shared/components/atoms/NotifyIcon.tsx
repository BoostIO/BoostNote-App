/* eslint-disable */
import React from 'react'
import styled from '../../lib/styled'
import Icon, { IconProps } from './Icon'

function NotifyIcon(props: IconProps & { count: number }) {
  return (
    <Container data-count={props.count}>
      <Icon {...props} />
    </Container>
  )
}

export default NotifyIcon
const Container = styled.div`
  position: relative;
  &:after {
    position: absolute;
    content: attr(data-count);
    width: 18px;
    height: 18px;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: #cd4400;
    top: 0px;
    right: 0px;
    border-radius: 50%;
    transform: translate3d(25%, -25%, 0);
  }
`
