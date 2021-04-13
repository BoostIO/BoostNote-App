import { useCallback } from 'react'
import { useToast } from '../stores/toast'

export type BulkApiAction = (
  id: string,
  act: string,
  body: { api: (args: any) => Promise<any>; cb?: (res: any) => any }
) => Promise<{ err: boolean; error?: unknown }>

interface UseBulkApiRes {
  sendingMap: Map<string, string>
  send: BulkApiAction
}

const useBulkApi = () => {
  const sendingMap = new Map<string, string>()
  const { pushApiErrorMessage } = useToast()

  const send = useCallback(
    async (id: string, act: string, { api, cb }) => {
      const res = { err: false, error: undefined }
      if (sendingMap.get(id)) {
        return
      }

      sendingMap.set(id, act)
      try {
        const data = await api()
        if (cb != null) {
          cb(data)
        }
      } catch (error) {
        res.err = true
        res.error = error
        console.error(error)
        pushApiErrorMessage(error)
      }
      sendingMap.delete(id)
      return res
    },
    [sendingMap, pushApiErrorMessage]
  )

  return {
    sendingMap,
    send,
  } as UseBulkApiRes
}

export default useBulkApi
