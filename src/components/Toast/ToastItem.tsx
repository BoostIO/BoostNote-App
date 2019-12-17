import React from 'react'
import { ToastMessage } from '../../lib/toast'
import {
  StyledToastContainer,
  StyledToastTop,
  StyledToastRight,
  StyledToastTitle,
  StyledToastCloseButton,
  StyledToastDescription
} from './styled'

interface ToastItemProps {
  item: ToastMessage
  onClose: (item: ToastMessage) => void
}

interface ToastItemState {
  remaining: number
  timer: any
}

function hashCode(id: string) {
  let hash = 0
  let i
  let chr
  if (id.length === 0) {
    return hash
  }

  for (i = 0; i < id.length; i++) {
    chr = id.charCodeAt(i)
    // tslint:disable-next-line:no-bitwise
    hash = (hash << 5) - hash + chr
    // tslint:disable-next-line:no-bitwise
    hash |= 0
  }
  return hash
}

class ToastItem extends React.Component<ToastItemProps, ToastItemState> {
  state = {
    remaining: 3000,
    timer: 0,
    id: hashCode(this.props.item.id)
  }

  componentDidMount() {
    this.resumeTimer()
  }

  componentWillUnmount() {
    window.clearTimeout(this.state.id)
  }

  resumeTimer = () => {
    window.clearTimeout(this.state.id)
    this.setState({
      timer: setTimeout(this.dismissMessage, this.state.remaining)
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
      <StyledToastContainer
        onMouseEnter={this.pauseTimer}
        onMouseLeave={this.resumeTimer}
      >
        <StyledToastTop>
          <StyledToastTitle>{this.props.item.title}</StyledToastTitle>
          <StyledToastRight>
            <StyledToastCloseButton>
              <span onClick={() => this.props.onClose(this.props.item)}>
                &times;
              </span>
            </StyledToastCloseButton>
          </StyledToastRight>
        </StyledToastTop>
        <StyledToastDescription>
          {this.props.item.description}
        </StyledToastDescription>
      </StyledToastContainer>
    )
  }
}
export default ToastItem
