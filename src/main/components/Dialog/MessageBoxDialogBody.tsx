import React, { ChangeEventHandler, KeyboardEventHandler } from 'react'
import { MessageBoxDialogData } from '../../lib/dialog/interfaces'
import {
  StyledDialogBody,
  StyledDialogTitle,
  StyledDialogMessage,
  StyledDialogButtonGroup,
  StyledDialogButton
} from './styled'

type MessageBoxDialogProps = {
  dialog: MessageBoxDialogData
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
    const { dialog: options } = this.props
    switch (event.key) {
      case 'Escape':
        if (options.cancelButtonIndex != null) {
          this.close(options.cancelButtonIndex)
        }
        return
    }
  }

  close = (value: number) => () => {
    const { dialog: options, closeDialog } = this.props
    closeDialog()
    options.onClose(value)
  }

  render() {
    const { dialog: options } = this.props
    return (
      <StyledDialogBody onKeyDown={this.handleBodyKeyDown}>
        <StyledDialogTitle>{options.title}</StyledDialogTitle>
        <StyledDialogMessage>{options.message}</StyledDialogMessage>
        <StyledDialogButtonGroup>
          {options.buttons.map((button, index) => (
            <StyledDialogButton
              key={`${options.id}-${index}`}
              onClick={this.close(index)}
              ref={
                index === options.defaultButtonIndex
                  ? this.defaultButtonRef
                  : undefined
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
