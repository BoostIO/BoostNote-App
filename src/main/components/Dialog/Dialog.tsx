import React, { ChangeEventHandler } from 'react'
import { inject, observer } from 'mobx-react'
import DialogStore from '../../lib/dialog/DialogStore'
import { StyledDialog } from './styled'
import { DialogTypes, PromptDialogOptions } from '../../lib/dialog/interfaces'

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
    const options = this.props.dialog!.options
    if (options == null) return null
    switch (options.type) {
      case DialogTypes.MessageBox:
        return null

      case DialogTypes.Prompt:
        const promptOptions = options as PromptDialogOptions
        return (
          <StyledDialog>
            <PromptDialog
              key={options.id}
              options={promptOptions}
              closeDialog={this.closeDialog}
            />
          </StyledDialog>
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
        <h1>{options.title}</h1>
        <p>{options.message}</p>
        <input
          ref={this.inputRef}
          value={this.state.value}
          onChange={this.updateValue}
        />

        <button
          onClick={() => {
            closeDialog()
            options.onClose(this.state.value)
          }}
        >
          Ok
        </button>
        <button
          onClick={() => {
            closeDialog()
            options.onClose(null)
          }}
        >
          Cancel
        </button>
      </>
    )
  }
}
