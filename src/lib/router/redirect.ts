import { useDb } from '../db'
import { useRouter } from './store'
import { useEffect } from 'react'

export default function useRedirectHandler() {
  const db = useDb()
  const { push, pathname } = useRouter()

  useEffect(() => {
    if (!db.initialized || db.storageMap == null) {
      return
    }
    if (pathname === '/app' && Object.keys(db.storageMap).length === 0) {
      push('/app/storages')
    }
    return
  }, [pathname, db.initialized])
}
