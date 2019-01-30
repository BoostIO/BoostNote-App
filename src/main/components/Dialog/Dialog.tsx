import React from 'react'
import { inject, observer } from 'mobx-react'
import DialogStore from '../../lib/dialog/DialogStore'
import DialogIcon from './DialogIcon'
import {
  DialogTypes,
  PromptDialogData,
  DialogData
} from '../../lib/dialog/interfaces'
import PromptDialogBody from './PromptDialogBody'
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
        return (
          <PromptDialogBody
            key={currentDialog.id}
            dialog={currentDialog}
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
