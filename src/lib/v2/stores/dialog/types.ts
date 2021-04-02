import { ButtonProps } from '../../../../components/v2/atoms/Button'

export enum DialogTypes {
  MessageBox = 'MessageBox',
}

export enum DialogIconTypes {
  Question = 'Question',
  Warning = 'Warning',
}

export type MessageBoxButtonProps = ButtonProps & {
  label: string
  defaultButton?: boolean
  cancelButton?: boolean
}

export interface MessageBoxDialogOptions {
  title: string
  message: string
  iconType?: DialogIconTypes
  buttons?: MessageBoxButtonProps[]
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

export type DialogData = MessageBoxDialogData

export interface DialogContext {
  data: DialogData | null
  messageBox(options: MessageBoxDialogOptions): void
  closeDialog(): void
}
