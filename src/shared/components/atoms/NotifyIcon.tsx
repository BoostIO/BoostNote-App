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
    content: attr(data-count);
    width: 13px;
    height: 13px;
    text-align: center;
    font-size: 10px;
    color: #fff;
    background-color: #cd4400;
    top: 1px;
    right: -1px;
    border-radius: 50%;
    transform: translate3d(25%, -25%, 0);
  }
`
