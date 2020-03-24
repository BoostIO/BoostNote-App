import React, { ChangeEventHandler, KeyboardEventHandler } from 'react'
import { MessageBoxDialogData } from '../../lib/dialog'
import {
  DialogBodyContainer,
  DialogTitle,
  DialogMessage,
  DialogButtonGroup,
  DialogButton,
} from '../atoms/dialog/styled'

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

  updateValue: ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({
      value: event.target.value,
    })
  }

  handleBodyKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
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
      <DialogBodyContainer onKeyDown={this.handleBodyKeyDown}>
        <DialogTitle>{title}</DialogTitle>
        <DialogMessage>{message}</DialogMessage>
        <DialogButtonGroup>
          {buttons.map((button, index) => (
            <DialogButton
              key={`${data.id}-${index}`}
              onClick={this.close(index)}
              ref={
                index === defaultButtonIndex ? this.defaultButtonRef : undefined
              }
            >
              {button}
            </DialogButton>
          ))}
        </DialogButtonGroup>
      </DialogBodyContainer>
    )
  }
}
