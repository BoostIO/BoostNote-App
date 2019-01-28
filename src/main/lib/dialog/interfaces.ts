export enum DialogTypes {
  Prompt = 'Prompt',
  MessageBox = 'MessageBox'
}

export enum DialogIconTypes {
  Question = 'Question',
  Info = 'Info'
}

export interface BaseDialogOptions {
  id: number
  type: DialogTypes
  title: string
  message: string
  iconType: DialogIconTypes
}

export interface MessageBoxDialogOptions extends BaseDialogOptions {
  buttons: string[]
  defaultId: number
  cancelId: number
  onClose: (value: number | null) => void
}

export interface PromptDialogOptions extends BaseDialogOptions {
  defaultValue?: string
  onClose: (value: string | null) => void
}

export type DialogOptions = MessageBoxDialogOptions | PromptDialogOptions
