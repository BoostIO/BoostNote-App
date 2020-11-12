import React, { useEffect, useMemo } from 'react'
import NotePage from './pages/NotePage'
import { useRouter } from '../lib/router'
import { useRouteParams } from '../lib/routeParams'
import StorageCreatePage from './pages/StorageCreatePage'
import { useDb } from '../lib/db'
import AttachmentsPage from './pages/AttachmentsPage'
import styled from '../lib/styled'
import { usePreferences } from '../lib/preferences'
import WikiNotePage from './pages/WikiNotePage'
import { values } from '../lib/db/utils'
import BoostHubTeamsShowPage from './pages/BoostHubTeamsShowPage'
import BoostHubTeamsCreatePage from './pages/BoostHubTeamsCreatePage'

const NotFoundPageContainer = styled.div`
  padding: 15px 25px;
`

const Router = () => {
  const routeParams = useRouteParams()
  const db = useDb()
  const { preferences } = usePreferences()
  const appMode = preferences['general.appMode']
  useRedirect()

  switch (routeParams.name) {
    case 'boosthub.teams.create':
      return <BoostHubTeamsCreatePage />
    case 'boosthub.teams.show':
      return <BoostHubTeamsShowPage domain={routeParams.domain} />
    case 'storages.notes':
    case 'storages.trashCan':
    case 'storages.tags.show': {
      const { storageId } = routeParams
      const storage = db.storageMap[storageId]
      if (storage == null) {
        break
      }

      if (appMode === 'note') {
        return <NotePage storage={storage} />
      }
      return <WikiNotePage storage={storage} />
    }
    case 'storages.attachments': {
      const { storageId } = routeParams
      const storage = db.storageMap[storageId]
      if (storage == null) {
        break
      }
      return <AttachmentsPage storage={storage} />
    }
    case 'storages.create':
      return <StorageCreatePage />
  }
  return (
    <NotFoundPageContainer>
      <h1>Page not found</h1>
      <p>Check the URL or click other link in the left side navigation.</p>
    </NotFoundPageContainer>
  )
}

export default Router

function useRedirect() {
  const { pathname, replace } = useRouter()
  const { storageMap } = useDb()

  const firstStorageId = useMemo<string | null>(() => {
    const storages = values(storageMap)
    if (storages.length > 0) {
      return storages[0].id
    }
    return null
  }, [storageMap])

  useEffect(() => {
    if (pathname === '/app') {
      if (firstStorageId == null) {
        replace('/app/storages')
      } else {
        replace(`/app/storages/${firstStorageId}`)
      }
    }
  }, [pathname, replace, firstStorageId])
}
