import { useState, useCallback } from 'react'
import {
  DialogData,
  DialogTypes,
  MessageBoxDialogOptions,
  DialogContext,
  DialogIconTypes,
} from './types'
import { createStoreContext } from '../../utils/context'
export * from './types'

let id = 0

function useDialogStore(): DialogContext {
  const [data, setData] = useState<DialogData | null>(null)

  const messageBox = useCallback((options: MessageBoxDialogOptions) => {
    setData({
      id: id++,
      ...options,
      type: DialogTypes.MessageBox,
      iconType: options.iconType || DialogIconTypes.Warning,
    })
  }, [])

  const closeDialog = useCallback(() => {
    setData(null)
  }, [])

  return {
    data,
    messageBox,
    closeDialog,
  }
}

export const {
  StoreProvider: V2DialogProvider,
  useStore: useDialog,
} = createStoreContext(useDialogStore, 'dialog')
