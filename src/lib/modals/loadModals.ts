import { useDb } from '../db'
import { useRouter } from '../router/store'
import { useEffect } from 'react'
import { useModals } from './store'

export default function useLoadModalsHandler() {
  const db = useDb()
  const { pathname } = useRouter()
  const { setModalsContent } = useModals()

  useEffect(() => {
    if (!db.initialized || db.storageMap == null) {
      return
    }
    if (
      pathname === '/app/storages' &&
      Object.keys(db.storageMap).length === 0
    ) {
      setModalsContent('download-app')
    }
    return
  }, [pathname, db.initialized])
}
