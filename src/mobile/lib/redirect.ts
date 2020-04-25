import { useDb } from './db'
import { useRouter } from './router'
import { useRef } from 'react'
import { entries } from '../../lib/db/utils'
import { useEffectOnce } from 'react-use'

export default function useRedirectHandler() {
  const db = useDb()
  const { replace, pathname } = useRouter()

  const storageMapRef = useRef(db.storageMap)
  useEffectOnce(() => {
    const storageEntries = entries(storageMapRef.current)

    if (pathname !== '/m') {
      return
    }
    if (storageEntries.length === 0) {
      replace('/m/storages')
    } else {
      replace(`/m/storages/${storageEntries[0][1].id}/notes`)
    }
  })
}
