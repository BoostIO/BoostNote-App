import { observable, action } from 'mobx'
import { DialogData, PromptDialogOptions, DialogTypes } from './interfaces'

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

  closeDialog() {
    this.setOptions()
  }
}
