export enum DialogTypes {
  Prompt = 'Prompt',
  MessageBox = 'MessageBox'
}

export enum DialogIconTypes {
  Question = 'Question',
  Info = 'Info',
  Error = 'Error',
  Warning = 'Warning'
}

export interface MessageBoxDialogOptions {
  title: string
  message: string
  iconType: DialogIconTypes
  buttons: string[]
  defaultButtonIndex?: number
  cancelButtonIndex?: number
  onClose: (value: number | null) => void
}

export interface PromptDialogOptions {
  title: string
  message: string
  iconType: DialogIconTypes
  defaultValue?: string
  submitButtonLabel?: string
  cancelButtonLabel?: string
  onClose: (value: string | null) => void
}

export interface BaseDialogData {
  id: number
  type: DialogTypes
  title: string
  message: string
  iconType: DialogIconTypes
}

export type MessageBoxDialogData = BaseDialogData &
  MessageBoxDialogOptions & {
    type: DialogTypes.MessageBox
  }
export type PromptDialogData = BaseDialogData &
  PromptDialogOptions & {
    type: DialogTypes.Prompt
  }

export type DialogData = MessageBoxDialogData | PromptDialogData

export interface DialogContext {
  data: DialogData | null
  prompt(options: PromptDialogOptions): void
  messageBox(options: MessageBoxDialogOptions): void
  closeDialog(): void
}
