import React from 'react'
import { inject, observer } from 'mobx-react'
import DialogStore from '../../lib/dialog/DialogStore'
import DialogIcon from './DialogIcon'
import PromptDialog from './PromptDialogBody'
import {
  DialogTypes,
  PromptDialogData,
  DialogData
} from '../../lib/dialog/interfaces'
import { StyledDialog, StyledDialogBackground } from './styled'

type DialogProps = {
  dialog?: DialogStore
}

@inject('dialog')
@observer
export default class Dialog extends React.Component<DialogProps> {
  closeDialog = () => {
    this.props.dialog!.closeDialog()
  }

  renderBody(currentDialog: DialogData) {
    switch (currentDialog.type) {
      case DialogTypes.MessageBox:
        return null
      case DialogTypes.Prompt:
        const promptDialog = currentDialog as PromptDialogData
        return (
          <PromptDialog
            key={currentDialog.id}
            dialog={promptDialog}
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
