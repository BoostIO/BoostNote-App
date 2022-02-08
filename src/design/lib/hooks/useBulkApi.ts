import { useCallback, useState } from 'react'
import { useToast } from '../stores/toast'

export type BulkApiActionRes<T = any> =
  | { err: true; error: unknown }
  | { err: false; data: T }

export type BulkApiAction = (
  id: string,
  act: string,
  body: {
    api: () => Promise<any>
    cb?: (res: any) => any
    onError?: (err: any) => Promise<{ overrideDefault: boolean }>
  }
) => Promise<BulkApiActionRes>

interface UseBulkApiRes {
  sendingMap: Map<string, string>
  send: BulkApiAction
}

const useBulkApi = () => {
  const [sendingMap, setSendingMap] = useState<Map<string, string>>(new Map())
  const { pushApiErrorMessage } = useToast()

  const send: BulkApiAction = useCallback(
    async (id: string, act: string, { api, cb, onError }) => {
      let res: BulkApiActionRes = { err: false, data: undefined }
      if (sendingMap.get(id)) {
        return {
          err: true,
          error: 'Resource occupied',
        } as BulkApiActionRes
      }

      setSendingMap((prev) => {
        const newMap = new Map(prev)
        newMap.delete(id)
        newMap.set(id, act)
        return newMap
      })
      try {
        const data = await api()
        res.data = data
        if (cb != null) {
          cb(data)
        }
      } catch (error) {
        res = {
          err: true,
          error: error,
        }
        console.error(error)

        if (onError != null) {
          const onErrorRes = await onError(error)
          if (!onErrorRes.overrideDefault) {
            pushApiErrorMessage(error)
          }
        } else {
          pushApiErrorMessage(error)
        }
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
