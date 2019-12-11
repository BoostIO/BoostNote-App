import { useDb } from '../db'
import { useRouter } from './store'
import { useEffect } from 'react'

export default function useRedirectHandler() {
  const db = useDb()
  const { push, pathname } = useRouter()

  useEffect(() => {
    if (pathname === '/app' && Object.keys(db.storageMap).length === 0) {
      push('/app/storages')
    }
  }, [pathname, db.storageMap, push])
}
