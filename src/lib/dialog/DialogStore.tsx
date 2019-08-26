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
  setData(data?: DialogData) {
    this.currentData = data
  }

  prompt(options: PromptDialogOptions) {
    this.setData({
      id: id++,
      type: DialogTypes.Prompt,
      ...options
    })
  }

  messageBox(options: MessageBoxDialogOptions) {
    this.setData({
      id: id++,
      type: DialogTypes.MessageBox,
      ...options
    })
  }

  closeDialog() {
    this.setData()
  }
}
