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

class ToastItem extends React.Component<ToastItemProps, ToastItemState> {
  state = {
    remaining: 3000,
    timer: 0
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
