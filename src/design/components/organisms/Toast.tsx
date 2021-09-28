import React from 'react'
import { ToastMessage, useToast } from '../../lib/stores/toast'
import styled from '../../lib/styled'
import cc from 'classcat'
import Button from '../atoms/Button'
import {
  mdiCheckCircleOutline,
  mdiClose,
  mdiCloseCircleOutline,
  mdiInformationOutline,
} from '@mdi/js'
import Icon from '../atoms/Icon'
import Scroller from '../atoms/Scroller'

interface ToastItemProps {
  item: ToastMessage
  onClose: (item: ToastMessage) => void
  onClick?: () => void
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
          <ToastItem
            item={message}
            onClose={removeMessage}
            onClick={message.onClick}
          />
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
    margin: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    background-color: ${({ theme }) => theme.colors.background.primary};
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    border: 1px solid ${({ theme }) => theme.colors.border.main};

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

    &.toast__item--button:hover {
      background-color: ${({ theme }) => theme.colors.background.secondary};
    }
  }
`

class ToastItem extends React.Component<ToastItemProps, ToastItemState> {
  state = {
    remaining: 300000000,
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

  onClickHandler = () => {
    if (this.props.onClick != null) {
      this.props.onClick()
    }
  }

  render() {
    return (
      <div
        onClick={this.onClickHandler}
        onMouseEnter={this.pauseTimer}
        onMouseLeave={this.resumeTimer}
        className={cc([
          `toast__item`,
          `toast__item--${this.props.item.type}`,
          this.props.onClick != null && 'toast__item--button',
        ])}
      >
        <div className='toast__item__status'>
          <Icon
            size={20}
            path={
              this.props.item.type === 'success'
                ? mdiCheckCircleOutline
                : this.props.item.type === 'info'
                ? mdiInformationOutline
                : mdiCloseCircleOutline
            }
          />
        </div>
        <Scroller className='toast__item__content'>
          <strong className='toast__item__title'>
            {this.props.item.title}
          </strong>
          <p className='toast__item__description'>
            {this.props.item.description}
          </p>
        </Scroller>
        <Button
          className='toast__item__close'
          variant='icon'
          iconPath={mdiClose}
          iconSize={20}
          onClick={() => this.props.onClose(this.props.item)}
        />
      </div>
    )
  }
}
