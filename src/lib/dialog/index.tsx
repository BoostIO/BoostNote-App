import { useState, useCallback } from 'react'
import {
  DialogData,
  PromptDialogOptions,
  DialogTypes,
  MessageBoxDialogOptions,
  DialogContext
} from './types'
import { createStoreContext } from '../utils/context'
export * from './types'

let id = 0

function createDialog(): DialogContext {
  const [data, setData] = useState<DialogData | null>(null)
  const prompt = useCallback((options: PromptDialogOptions) => {
    setData({
      id: id++,
      type: DialogTypes.Prompt,
      ...options
    })
  }, [])
  const messageBox = useCallback((options: MessageBoxDialogOptions) => {
    setData({
      id: id++,
      type: DialogTypes.MessageBox,
      ...options
    })
  }, [])
  const closeDialog = useCallback(() => {
    setData(null)
  }, [])

  return {
    data,
    prompt,
    messageBox,
    closeDialog
  }
}

export const {
  StoreProvider: DialogProvider,
  useStore: useDialog
} = createStoreContext(createDialog, 'dialog')
