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
    width: 12px;
    height: 12px;
    font-size: 8px;
    background-color: ${({ theme }) => theme.colors.variants.danger.base};
    top: 0px;
    right: 0px;
    border-radius: 50%;
  }
`
