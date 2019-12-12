import { useDb } from '../db'
import { useRouter } from './store'
import { useEffect, useMemo } from 'react'
import { entries } from '../db/utils'

export default function useRedirectHandler() {
  const db = useDb()
  const { push, pathname } = useRouter()

  const storageEntries = useMemo(() => {
    return entries(db.storageMap)
  }, [db.storageMap])

  useEffect(() => {
    if (pathname === '/app')
      if (storageEntries.length === 0) {
        push('/app/storages')
      } else {
        push(`/app/storages/${storageEntries[0][1].id}`)
      }
  }, [pathname, db.storageMap, push])
}
