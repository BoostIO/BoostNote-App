import React from 'react'
import { ToastMessage } from '../../../lib/stores/toast'
import {
  StyledToastContainer,
  StyledToastCloseButton,
  StyledToastDescription,
} from './styled'
import cc from 'classcat'
import IconMdi from '../../atoms/IconMdi'
import { mdiClose } from '@mdi/js'

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
      <StyledToastContainer
        onMouseEnter={this.pauseTimer}
        onMouseLeave={this.resumeTimer}
        className={cc([`toast-${this.props.item.type}`])}
      >
        <StyledToastCloseButton>
          <span onClick={() => this.props.onClose(this.props.item)}>
            <IconMdi path={mdiClose} size={22} />
          </span>
        </StyledToastCloseButton>
        <StyledToastDescription>
          {this.props.item.title}: {this.props.item.description}
        </StyledToastDescription>
      </StyledToastContainer>
    )
  }
}
export default ToastItem
