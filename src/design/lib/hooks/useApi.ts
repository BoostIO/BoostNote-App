import { useCallback, useState } from 'react'
import { useToast } from '../stores/toast'

interface UseApiProps<P, R> {
  api: (args: P) => Promise<R>
  cb?: (res: R, args: P) => any
}

interface UseApiRes<P> {
  sending: boolean
  submit: (...args: P[]) => Promise<{ err: boolean; error?: unknown }>
}

const useApi = <P, R>({ api, cb }: UseApiProps<P, R>) => {
  const [sending, setSending] = useState(false)
  const { pushApiErrorMessage } = useToast()

  const submit = useCallback(
    async (args: P) => {
      const res = { err: false, error: undefined }
      if (sending) {
        return
      }

      setSending(true)
      try {
        const data = await api(args)
        if (cb != null) {
          cb(data, args)
        }
      } catch (error) {
        res.err = true
        res.error = error
        console.error(error)
        pushApiErrorMessage(error)
      }
      setSending(false)
      return res
    },
    [sending, api, cb, pushApiErrorMessage]
  )

  return {
    sending,
    submit,
  } as UseApiRes<P>
}

export default useApi
