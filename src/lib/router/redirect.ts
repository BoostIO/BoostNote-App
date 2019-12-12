import { useDb } from '../db'
import { useRouter } from './store'
import { useEffect, useRef } from 'react'
import { entries } from '../db/utils'
import { useModal } from '../modal'
import { usePreferences } from '../preferences'

export default function useRedirectHandler() {
  const db = useDb()
  const { replace, pathname } = useRouter()
  const { openModal } = useModal()
  const { preferences } = usePreferences()

  const storageMapRef = useRef(db.storageMap)
  useEffect(() => {
    const storageEntries = entries(storageMapRef.current)

    if (pathname !== '/app') return

    if (storageEntries.length === 0) {
      if (preferences['general.enableDownloadAppModal']) {
        openModal('download-app')
      }
      replace('/app/storages')
    } else {
      replace(`/app/storages/${storageEntries[0][1].id}`)
    }
  }, [pathname, replace])
}
