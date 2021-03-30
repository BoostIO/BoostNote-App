import React from 'react'
import { ToastMessage, useToast } from '../../../lib/v2/stores/toast'
import styled from '../../../lib/v2/styled'
import cc from 'classcat'
import Button from '../atoms/Button'
import {
  mdiCheckCircleOutline,
  mdiClose,
  mdiCloseCircleOutline,
  mdiInformationOutline,
} from '@mdi/js'
import Icon from '../atoms/Icon'

interface ToastItemProps {
  item: ToastMessage
  onClose: (item: ToastMessage) => void
}

interface ToastItemState {
  remaining: number
  timer: any
}

const Toast = () => {
  const { messages, removeMessage } = useToast()

  return (
    <Container className='toast'>
      {messages.map((message) => (
        <li key={message.id}>
          <ToastItem item={message} onClose={removeMessage} />
        </li>
      ))}
    </Container>
  )
}

export default Toast

const Container = styled.div`
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column-reverse;
  right: 0;
  bottom: 0;
  list-style: none;

  .toast__item {
    position: relative;
    width: 350px;
    margin: ${({ theme }) => theme.sizes.spaces.l}px;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    background-color: ${({ theme }) => theme.colors.background.main};
    display: flex;
    flex-direction: row;
    align-items: flex-start;

    .toast__item__status {
      flex: 0 0 auto;
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    .toast__item__content {
      flex: 1 1 auto;
    }

    .toast__item__close {
      flex: 0 0 auto;
      margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    .toast__item__description {
      margin: 0;
    }

    &.toast__item--error .toast__item__status {
      color: ${({ theme }) => theme.colors.variants.danger.base};
    }

    &.toast__item--success .toast__item__status {
      color: ${({ theme }) => theme.colors.variants.primary.base};
    }

    &.toast__item--info .toast__item__status {
      color: ${({ theme }) => theme.colors.variants.secondary.base};
    }
  }
`

class ToastItem extends React.Component<ToastItemProps, ToastItemState> {
  state = {
    remaining: 3000,
    timer: 0,
  }

  componentDidMount() {
    this.resumeTimer()
  }

  componentWillUnmount() {
    window.clearTimeout(this.state.timer)
  }

  resumeTimer = () => {
    window.clearTimeout(this.state.timer)
    this.setState({
      timer: setTimeout(this.dismissMessage, this.state.remaining),
    })
  }

  pauseTimer = () => {
    clearTimeout(this.state.timer)
  }

  dismissMessage = () => {
    this.props.onClose(this.props.item)
  }

  render() {
    return (
      <div
        onMouseEnter={this.pauseTimer}
        onMouseLeave={this.resumeTimer}
        className={cc([`toast__item`, `toast__item--${this.props.item.type}`])}
      >
        <div className='toast__item__status'>
          <Icon
            size={22}
            path={
              this.props.item.type === 'success'
                ? mdiCheckCircleOutline
                : this.props.item.type === 'info'
                ? mdiInformationOutline
                : mdiCloseCircleOutline
            }
          />
        </div>
        <div className='toast__item__content'>
          <strong className='toast__item__title'>
            {this.props.item.title}
          </strong>
          <p className='toast__item__description'>
            {this.props.item.description}
          </p>
        </div>
        <Button
          className='toast__item__close'
          variant='icon'
          iconPath={mdiClose}
          iconSize={22}
          onClick={() => this.props.onClose(this.props.item)}
        />
      </div>
    )
  }
}
