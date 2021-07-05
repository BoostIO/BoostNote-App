/* eslint-disable */
import React from 'react'
import styled from '../../lib/styled'
import Icon, { IconProps } from './Icon'

function NotifyIcon(props: IconProps & { text: number | string }) {
  return (
    <Container data-text={props.text}>
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
