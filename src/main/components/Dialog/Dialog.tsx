import React, { ChangeEventHandler } from 'react'
import { inject, observer } from 'mobx-react'
import DialogStore from '../../lib/dialog/DialogStore'
import { DialogTypes, PromptDialogOptions } from '../../lib/dialog/interfaces'
import {
  StyledDialog,
  StyledDialogBackground,
  StyledIcon,
  StyledDialogBody,
  StyledDialogTitle,
  StyledDialogMessage,
  StyledDialogPromptInput,
  StyledDialogButtonGroup,
  StyledDialogButton
} from './styled'

interface DialogProps {
  dialog?: DialogStore
}

@inject('dialog')
@observer
export default class Dialog extends React.Component<DialogProps> {
  closeDialog = () => {
    this.props.dialog!.closeDialog()
  }

  render() {
    const { current: currentDialog } = this.props.dialog!
    if (currentDialog == null) return null
    switch (currentDialog.type) {
      case DialogTypes.MessageBox:
        return null

      case DialogTypes.Prompt:
        const promptDialog = currentDialog as PromptDialogOptions
        return (
          <StyledDialogBackground>
            <StyledDialog>
              <StyledIcon>⚠️</StyledIcon>
              <StyledDialogBody>
                <PromptDialog
                  key={currentDialog.id}
                  options={promptDialog}
                  closeDialog={this.closeDialog}
                />
              </StyledDialogBody>
            </StyledDialog>
          </StyledDialogBackground>
        )
    }
    return null
  }
}

interface PromptDialogProps {
  options: PromptDialogOptions
  closeDialog: () => void
}

interface PromptDialogState {
  value: string
}

class PromptDialog extends React.Component<
  PromptDialogProps,
  PromptDialogState
> {
  state = {
    value:
      this.props.options.defaultValue == null
        ? ''
        : this.props.options.defaultValue
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
    const { options, closeDialog } = this.props
    return (
      <>
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
      </>
    )
  }
}
