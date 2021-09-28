import { useState, useCallback } from 'react'
import { generateSecret } from '../../../../cloud/lib/utils/secret'
import { createStoreContext } from '../../utils/context'

export interface ToastMessage {
  id: string
  title: string
  description: string
  type?: 'info' | 'error' | 'success'
  createdAt: Date
  onClick?: () => void
}

interface ToastStore {
  readonly messages: ToastMessage[]
  pushMessage: (message: Omit<ToastMessage, 'id' | 'createdAt'>) => void
  pushApiErrorMessage: (error: any) => void
  removeMessage: (message: ToastMessage) => void
}

const useToastStore = (): ToastStore => {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const pushMessage = useCallback(
    ({ title, description, type = 'error', onClick }) => {
      console.log(`setting new message: ${description}`)
      setMessages((prev) => {
        return [
          {
            id: generateSecret(),
            createdAt: new Date(),
            title,
            type,
            description,
            onClick,
          },
          ...prev,
        ]
      })
    },
    [setMessages]
  )

  const pushApiErrorMessage = useCallback(
    async (error: any) => {
      let title = 'Error'
      let description = 'Something wrong happened'

      if (error.response != null && typeof error.response.text === 'function') {
        try {
          title = error.response.status.toString()
          const errorMessage = await error.response.text()
          const splits = errorMessage.split('\n')[0].split(': ')
          splits.shift()
          description = splits
        } catch (error) {}
      }

      setMessages((prev) => [
        {
          id: generateSecret(),
          createdAt: new Date(),
          title,
          type: 'error',
          description,
        },
        ...prev,
      ])
    },
    [setMessages]
  )

  return {
    messages,
    pushMessage,
    pushApiErrorMessage,
    removeMessage: (message) =>
      setMessages(messages.filter(({ id }) => id !== message.id)),
  }
}

export const {
  StoreProvider: V2ToastProvider,
  useStore: useToast,
} = createStoreContext(useToastStore)
