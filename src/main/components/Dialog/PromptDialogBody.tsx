import React, { ChangeEventHandler } from 'react'
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

  render() {
    const { dialog: options, closeDialog } = this.props
    return (
      <StyledDialogBody>
        <StyledDialogTitle>{options.title}</StyledDialogTitle>
        <StyledDialogMessage>{options.message}</StyledDialogMessage>
        <StyledDialogPromptInput
          ref={this.inputRef}
          value={this.state.value}
          onChange={this.updateValue}
        />
        <StyledDialogButtonGroup>
          <StyledDialogButton
            onClick={() => {
              closeDialog()
              options.onClose(this.state.value)
            }}
          >
            Ok
          </StyledDialogButton>
          <StyledDialogButton
            onClick={() => {
              closeDialog()
              options.onClose(null)
            }}
          >
            Cancel
          </StyledDialogButton>
        </StyledDialogButtonGroup>
      </StyledDialogBody>
    )
  }
}
