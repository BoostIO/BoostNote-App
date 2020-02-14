import React, { ChangeEventHandler, KeyboardEventHandler } from 'react'
import { PromptDialogOptions } from '../../lib/dialog'
import {
  DialogBodyContainer,
  DialogTitle,
  DialogMessage,
  DialogPromptInput,
  DialogButtonGroup,
  DialogButton
} from '../atoms/dialog/styled'

type PromptDialogProps = {
  data: PromptDialogOptions
  closeDialog: () => void
}

type PromptDialogState = {
  value: string
}

export default class PromptDialogBody extends React.Component<
  PromptDialogProps,
  PromptDialogState
> {
  state = {
    value:
      this.props.data.defaultValue == null ? '' : this.props.data.defaultValue
  }
  inputRef = React.createRef<HTMLInputElement>()

  componentDidMount() {
    this.inputRef.current!.focus()
  }

  updateValue: ChangeEventHandler<HTMLInputElement> = event => {
    this.setState({
      value: event.target.value
    })
  }

  handleBodyKeyDown: KeyboardEventHandler<HTMLDivElement> = event => {
    switch (event.key) {
      case 'Escape':
        this.cancel()
        return
    }
  }

  handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = event => {
    switch (event.key) {
      case 'Enter':
        this.submit()
        return
    }
  }

  submit = () => {
    const { data, closeDialog } = this.props
    closeDialog()
    data.onClose(this.state.value)
  }

  cancel = () => {
    const { data, closeDialog } = this.props
    closeDialog()
    data.onClose(null)
  }

  render() {
    const { data } = this.props
    return (
      <DialogBodyContainer onKeyDown={this.handleBodyKeyDown}>
        <DialogTitle>{data.title}</DialogTitle>
        <DialogMessage>{data.message}</DialogMessage>
        <DialogPromptInput
          ref={this.inputRef}
          value={this.state.value}
          onChange={this.updateValue}
          onKeyDown={this.handleInputKeyDown}
        />
        <DialogButtonGroup>
          <DialogButton onClick={this.submit}>
            {data.submitButtonLabel == null ? 'Submit' : data.submitButtonLabel}
          </DialogButton>
          <DialogButton onClick={this.cancel}>
            {data.cancelButtonLabel == null ? 'Cancel' : data.cancelButtonLabel}
          </DialogButton>
        </DialogButtonGroup>
      </DialogBodyContainer>
    )
  }
}
