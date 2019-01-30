import { observable, action } from 'mobx'
import {
  DialogData,
  PromptDialogOptions,
  DialogTypes,
  MessageBoxDialogOptions
} from './interfaces'

let id = 0
export default class DialogStore {
  @observable currentData?: DialogData

  @action
  setOptions(data?: DialogData) {
    this.currentData = data
  }

  prompt(options: PromptDialogOptions) {
    this.setOptions({
      id: id++,
      type: DialogTypes.Prompt,
      ...options
    })
  }

  messageBox(options: MessageBoxDialogOptions) {
    this.setOptions({
      id: id++,
      type: DialogTypes.MessageBox,
      ...options
    })
  }

  closeDialog() {
    this.setOptions()
  }
}
