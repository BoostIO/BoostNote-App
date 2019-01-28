import { observable, action } from 'mobx'
import { DialogOptions, PromptDialogOptions, DialogTypes } from './interfaces'
import { Omit } from '../types'

let id = 0
export default class DialogStore {
  @observable options?: DialogOptions

  @action
  setOptions(options?: DialogOptions) {
    this.options = options
  }

  prompt(options: Omit<PromptDialogOptions, 'type' | 'id'>) {
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
