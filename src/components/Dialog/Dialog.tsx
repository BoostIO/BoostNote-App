import React from 'react'
import { useDialog } from 'Lib/dialog'
import DialogIcon from './DialogIcon'
import PromptDialogBody from './PromptDialogBody'
import { DialogTypes, DialogData } from 'Lib/dialog/types'
import { StyledDialog, StyledDialogBackground } from './styled'
import MessageBoxDialogBody from './MessageBoxDialogBody'

export default () => {
  const { data, closeDialog } = useDialog()

  if (data == null) return null

  function renderBody(dialogData: DialogData) {
    switch (dialogData.type) {
      case DialogTypes.MessageBox:
        return (
          <MessageBoxDialogBody
            key={dialogData.id}
            data={dialogData}
            closeDialog={closeDialog}
          />
        )
      case DialogTypes.Prompt:
        return (
          <PromptDialogBody
            key={dialogData.id}
            data={dialogData}
            closeDialog={closeDialog}
          />
        )
    }
    throw new Error('Invalid dialog type.')
  }

  return (
    <StyledDialogBackground>
      <StyledDialog>
        <DialogIcon icon={data.iconType} />

        {renderBody(data)}
      </StyledDialog>
    </StyledDialogBackground>
  )
}
