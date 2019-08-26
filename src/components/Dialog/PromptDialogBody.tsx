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
      <StyledDialogBody onKeyDown={this.handleBodyKeyDown}>
        <StyledDialogTitle>{data.title}</StyledDialogTitle>
        <StyledDialogMessage>{data.message}</StyledDialogMessage>
        <StyledDialogPromptInput
          ref={this.inputRef}
          value={this.state.value}
          onChange={this.updateValue}
          onKeyDown={this.handleInputKeyDown}
        />
        <StyledDialogButtonGroup>
          <StyledDialogButton onClick={this.submit}>
            {data.submitButtonLabel == null ? 'Submit' : data.submitButtonLabel}
          </StyledDialogButton>
          <StyledDialogButton onClick={this.cancel}>
            {data.cancelButtonLabel == null ? 'Cancel' : data.cancelButtonLabel}
          </StyledDialogButton>
        </StyledDialogButtonGroup>
      </StyledDialogBody>
    )
  }
}
