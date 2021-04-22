import { useCallback, useState } from 'react'
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
  const [sendingMap, setSendingMap] = useState<Map<string, string>>(new Map())
  const { pushApiErrorMessage } = useToast()

  const send = useCallback(
    async (id: string, act: string, { api, cb }) => {
      const res = { err: false, error: undefined }
      if (sendingMap.get(id)) {
        return
      }

      setSendingMap((prev) => {
        const newMap = new Map(prev)
        newMap.delete(id)
        newMap.set(id, act)
        return newMap
      })
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

      setSendingMap((prev) => {
        const newMap = new Map(prev)
        newMap.delete(id)
        return newMap
      })

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
