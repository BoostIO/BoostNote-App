import { useDb } from '../db'
import { useRouter } from '../router/store'
import { useEffect, useRef } from 'react'
import { useModal } from './store'
import { usePreferences } from '../preferences'

export default function useLoadModalsOnRouteChangeHandler() {
  const { pathname } = useRouter()
  const db = useDb()
  const { openModal } = useModal()
  const { preferences } = usePreferences()

  const storageMapRef = useRef(db.storageMap)
  useEffect(() => {
    if (
      pathname === '/app/storages' &&
      Object.keys(storageMapRef.current).length === 0 &&
      preferences['general.enableDownloadAppModal'] === true
    ) {
      openModal('download-app')
    }
  }, [pathname, openModal, preferences])
}
