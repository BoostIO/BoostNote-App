import { useCallback, useState } from 'react'
import { useToast } from '../stores/toast'

interface UseApiProps<P, R> {
  api: (...args: P[]) => Promise<R>
  cb?: (...res: R[]) => any
}

interface UseApiRes<P> {
  sending: boolean
  submit: (...args: P[]) => void
}

const useApi = <P, R>({ api, cb }: UseApiProps<P, R>) => {
  const [sending, setSending] = useState(false)
  const { pushApiErrorMessage } = useToast()

  const submit = useCallback(
    async (args) => {
      if (sending) {
        return
      }

      setSending(true)
      try {
        const data = await api(...args)
        if (cb != null) {
          cb(data)
        }
      } catch (error) {
        pushApiErrorMessage(error)
      }
      setSending(true)
    },
    [sending, api, cb, pushApiErrorMessage]
  )

  return {
    sending,
    submit,
  } as UseApiRes<P>
}

export default useApi
