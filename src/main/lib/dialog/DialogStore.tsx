import { observable, action } from 'mobx'
import { DialogProps, PromptDialogOptions, DialogTypes } from './interfaces'

let id = 0
export default class DialogStore {
  @observable current?: DialogProps

  @action
  setOptions(props?: DialogProps) {
    this.current = props
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
