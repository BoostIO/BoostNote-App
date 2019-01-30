import React from 'react'
import { inject, observer } from 'mobx-react'
import DialogStore from '../../lib/dialog/DialogStore'
import DialogIcon from './DialogIcon'
import PromptDialogBody from './PromptDialogBody'
import { DialogTypes, DialogData } from '../../lib/dialog/interfaces'
import { StyledDialog, StyledDialogBackground } from './styled'
import MessageBoxDialogBody from './MessageBoxDialogBody'

type DialogProps = {
  dialog?: DialogStore
}

@inject('dialog')
@observer
export default class Dialog extends React.Component<DialogProps> {
  closeDialog = () => {
    this.props.dialog!.closeDialog()
  }

  renderBody(dialogData: DialogData) {
    switch (dialogData.type) {
      case DialogTypes.MessageBox:
        return (
          <MessageBoxDialogBody
            key={dialogData.id}
            data={dialogData}
            closeDialog={this.closeDialog}
          />
        )
      case DialogTypes.Prompt:
        return (
          <PromptDialogBody
            key={dialogData.id}
            data={dialogData}
            closeDialog={this.closeDialog}
          />
        )
    }
    throw new Error('Invalid dialog type.')
  }

  render() {
    const { currentData: currentDialogData } = this.props.dialog!
    if (currentDialogData == null) return null
    return (
      <StyledDialogBackground>
        <StyledDialog>
          <DialogIcon icon={currentDialogData.iconType} />
          {this.renderBody(currentDialogData)}
        </StyledDialog>
      </StyledDialogBackground>
    )
  }
}
