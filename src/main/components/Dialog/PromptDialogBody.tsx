import React, { ChangeEventHandler, KeyboardEventHandler } from 'react'
import { PromptDialogOptions } from '../../lib/dialog/interfaces'
import {
  StyledDialogBody,
  StyledDialogTitle,
  StyledDialogMessage,
  StyledDialogPromptInput,
  StyledDialogButtonGroup,
  StyledDialogButton
} from './styled'

type PromptDialogProps = {
  dialog: PromptDialogOptions
  closeDialog: () => void
}

type PromptDialogState = {
  value: string
}

export default class PromptDialog extends React.Component<
  PromptDialogProps,
  PromptDialogState
> {
  state = {
    value:
      this.props.dialog.defaultValue == null
        ? ''
        : this.props.dialog.defaultValue
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
    const { dialog: options, closeDialog } = this.props
    closeDialog()
    options.onClose(this.state.value)
  }

  cancel = () => {
    const { dialog: options, closeDialog } = this.props
    closeDialog()
    options.onClose(null)
  }

  render() {
    const { dialog: options } = this.props
    return (
      <StyledDialogBody onKeyDown={this.handleBodyKeyDown}>
        <StyledDialogTitle>{options.title}</StyledDialogTitle>
        <StyledDialogMessage>{options.message}</StyledDialogMessage>
        <StyledDialogPromptInput
          ref={this.inputRef}
          value={this.state.value}
          onChange={this.updateValue}
          onKeyDown={this.handleInputKeyDown}
        />
        <StyledDialogButtonGroup>
          <StyledDialogButton onClick={this.submit}>Ok</StyledDialogButton>
          <StyledDialogButton onClick={this.cancel}>Cancel</StyledDialogButton>
        </StyledDialogButtonGroup>
      </StyledDialogBody>
    )
  }
}
