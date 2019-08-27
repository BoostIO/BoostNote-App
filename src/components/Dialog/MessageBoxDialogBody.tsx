import React, { ChangeEventHandler, KeyboardEventHandler } from 'react'
import { MessageBoxDialogData } from '../../lib/dialog/types'
import {
  StyledDialogBody,
  StyledDialogTitle,
  StyledDialogMessage,
  StyledDialogButtonGroup,
  StyledDialogButton
} from './styled'

type MessageBoxDialogProps = {
  data: MessageBoxDialogData
  closeDialog: () => void
}

export default class MessageBoxDialogBody extends React.Component<
  MessageBoxDialogProps
> {
  defaultButtonRef = React.createRef<HTMLButtonElement>()

  componentDidMount() {
    this.defaultButtonRef.current!.focus()
  }

  updateValue: ChangeEventHandler<HTMLInputElement> = event => {
    this.setState({
      value: event.target.value
    })
  }

  handleBodyKeyDown: KeyboardEventHandler<HTMLDivElement> = event => {
    const { data } = this.props
    switch (event.key) {
      case 'Escape':
        if (data.cancelButtonIndex != null) {
          this.close(data.cancelButtonIndex)
        }
        return
    }
  }

  close = (value: number) => () => {
    const { data, closeDialog } = this.props
    closeDialog()
    data.onClose(value)
  }

  render() {
    const { data } = this.props
    const { defaultButtonIndex = 0, title, message, buttons } = data

    return (
      <StyledDialogBody onKeyDown={this.handleBodyKeyDown}>
        <StyledDialogTitle>{title}</StyledDialogTitle>
        <StyledDialogMessage>{message}</StyledDialogMessage>
        <StyledDialogButtonGroup>
          {buttons.map((button, index) => (
            <StyledDialogButton
              key={`${data.id}-${index}`}
              onClick={this.close(index)}
              ref={
                index === defaultButtonIndex ? this.defaultButtonRef : undefined
              }
            >
              {button}
            </StyledDialogButton>
          ))}
        </StyledDialogButtonGroup>
      </StyledDialogBody>
    )
  }
}
