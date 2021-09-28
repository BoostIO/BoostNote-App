import { useCallback, useState } from 'react'
import { useToast } from '../stores/toast'

export type BulkApiActionRes =
  | { err: true; error: any }
  | { err: false; data: any }

export type BulkApiAction = (
  id: string,
  act: string,
  body: { api: (args: any) => Promise<any>; cb?: (res: any) => any }
) => Promise<BulkApiActionRes>

interface UseBulkApiRes {
  sendingMap: Map<string, string>
  send: BulkApiAction
}

const useBulkApi = () => {
  const [sendingMap, setSendingMap] = useState<Map<string, string>>(new Map())
  const { pushMessage } = useToast()

  const send = useCallback(
    async (id: string, act: string, { api, cb }) => {
      let res: BulkApiActionRes = { err: false, data: {} }
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
        res.data = data
        if (cb != null) {
          cb(data)
        }
      } catch (error) {
        res = {
          err: true,
          error: {},
        }

        if (
          error.response != null &&
          typeof error.response.text === 'function'
        ) {
          try {
            res.error.status = error.response.status.toString()
            res.error.body = await error.response.text()
            const splits = res.error.body.split('\n')[0].split(': ')
            splits.shift()
            res.error.description = splits
          } catch (error) {}
        }

        pushMessage({
          title: res.error.status || 'Error',
          description: res.error.description || 'Something wrong happened',
        })
      }

      setSendingMap((prev) => {
        const newMap = new Map(prev)
        newMap.delete(id)
        return newMap
      })

      return res
    },
    [sendingMap, pushMessage]
  )

  return {
    sendingMap,
    send,
  } as UseBulkApiRes
}

export default useBulkApi
