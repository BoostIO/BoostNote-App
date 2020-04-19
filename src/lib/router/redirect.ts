import { useDb } from '../db'
import { useRouter } from './store'
import { useEffect, useRef } from 'react'
import { entries } from '../db/utils'

export default function useRedirectHandler() {
  const db = useDb()
  const { replace, pathname } = useRouter()

  const storageMapRef = useRef(db.storageMap)
  useEffect(() => {
    const storageEntries = entries(storageMapRef.current)

    if (pathname !== '/app') return

    if (storageEntries.length === 0) {
      replace('/app/storages')
    } else {
      replace(`/app/storages/${storageEntries[0][1].id}`)
    }
    /* eslint-disable */
  }, [pathname, replace])
}
