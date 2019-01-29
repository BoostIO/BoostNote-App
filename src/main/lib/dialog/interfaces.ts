export enum DialogTypes {
  Prompt = 'Prompt',
  MessageBox = 'MessageBox'
}

export enum DialogIconTypes {
  Question = 'Question',
  Info = 'Info'
}

export interface MessageBoxDialogOptions {
  title: string
  message: string
  iconType: DialogIconTypes
  buttons: string[]
  defaultId: number
  cancelId: number
  onClose: (value: number | null) => void
}

export interface PromptDialogOptions {
  title: string
  message: string
  iconType: DialogIconTypes
  defaultValue?: string
  onClose: (value: string | null) => void
}

export interface BaseDialogProps {
  id: number
  type: DialogTypes
  title: string
  message: string
  iconType: DialogIconTypes
}

export type MessageBoxDialogProps = BaseDialogProps & MessageBoxDialogOptions
export type PromptDialogProps = BaseDialogProps & PromptDialogOptions

export type DialogProps = MessageBoxDialogProps | PromptDialogProps
