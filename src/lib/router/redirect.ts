import { useDb } from '../db'
import { useRouter } from './store'
import { useEffect, useRef } from 'react'
import { entries } from '../db/utils'
import { useModal } from '../modal'
import { usePreferences } from '../preferences'

export default function useRedirectHandler() {
  const db = useDb()
  const { push, pathname } = useRouter()
  const { openModal } = useModal()
  const { preferences } = usePreferences()

  const storageMapRef = useRef(db.storageMap)
  useEffect(() => {
    const storageEntries = entries(storageMapRef.current)

    if (pathname !== '/app') return

    if (storageEntries.length === 0) {
      if (preferences['general.enableDownloadAppModal'] === true) {
        openModal('download-app')
      }
      push('/app/storages')
    } else {
      push(`/app/storages/${storageEntries[0][1].id}`)
    }
  }, [pathname, push])
}
