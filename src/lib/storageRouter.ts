import { useRef, useEffect, useCallback } from 'react'
import { createStoreContext } from './context'
import { useRouter } from './router'
import { useActiveStorageId } from './routeParams'

function useStorageRouterStore() {
  const { push, pathname } = useRouter()
  const lastStoragePathnameMapRef = useRef<Map<string, string>>(new Map())
  const activeStorageId = useActiveStorageId()

  const navigate = useCallback(
    (storageId: string) => {
      if (storageId === activeStorageId) {
        push(`/app/storages/${storageId}`)
        return
      }
      const lastStoragePathname = lastStoragePathnameMapRef.current.get(
        storageId
      )
      if (lastStoragePathname == null) {
        push(`/app/storages/${storageId}`)
        return
      }
      push(lastStoragePathname)
    },
    [activeStorageId, push]
  )

  const navigateToNoteWithEditorFocus = useCallback(
    (
      storageId: string,
      noteId: string,
      noteFolderPathname = '/',
      focusEditorPosition = '0,0'
    ) => {
      push(
        `/app/storages/${storageId}/notes${
          noteFolderPathname === '/' ? '' : noteFolderPathname
        }/${noteId}/#L${focusEditorPosition}`
      )
    },
    [push]
  )

  const navigateToNote = useCallback(
    (storageId: string, noteId: string, noteFolderPathname = '/') => {
      navigateToNoteWithEditorFocus(storageId, noteId, noteFolderPathname)
    },
    [navigateToNoteWithEditorFocus]
  )

  useEffect(() => {
    if (activeStorageId != null) {
      lastStoragePathnameMapRef.current.set(activeStorageId, pathname)
    }
  }, [activeStorageId, lastStoragePathnameMapRef, pathname])

  return {
    navigate,
    navigateToNote,
    navigateToNoteWithEditorFocus,
  }
}

export const {
  StoreProvider: StorageRouterProvider,
  useStore: useStorageRouter,
} = createStoreContext(useStorageRouterStore)
