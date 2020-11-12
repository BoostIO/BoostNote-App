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
import {
  BoostHubNavigateRequestEvent,
  listenBoostHubNavigateRequestEvent,
  unlistenBoostHubNavigateRequestEvent,
} from '../lib/events'
import { parse as parseUrl } from 'url'
import { openNew } from '../lib/platform'

const NotFoundPageContainer = styled.div`
  padding: 15px 25px;
`

const Router = () => {
  const routeParams = useRouteParams()
  const db = useDb()
  const { preferences } = usePreferences()
  const appMode = preferences['general.appMode']
  const { push } = useRouter()

  useEffect(() => {
    const boostHubNavigateRequestHandler = (
      event: BoostHubNavigateRequestEvent
    ) => {
      const url = event.detail.url
      const { pathname, host } = parseUrl(url)
      if (host != null) {
        openNew(url)
        return
      }
      const firstPathname = pathname!.slice(1).split('/')[0]
      switch (firstPathname) {
        case 'account':
          // TODO: Handle account delete
          break
        case '':
        case 'api':
        case 'desktop':
        case 'integration':
        case 'settings':
        case 'oauth':
        case 'oauth2':
        case 'shared':
        case 'features':
        case 'gdpr-policy':
        case 'invite':
        case 'login_complete':
        case 'policy':
        case 'pricing':
        case 'signin':
        case 'signup':
        case 'terms':
          openNew(url)
          break
        default:
          push(`/app/boosthub/teams/${firstPathname}`)
          break
      }
    }
    listenBoostHubNavigateRequestEvent(boostHubNavigateRequestHandler)

    return () => {
      unlistenBoostHubNavigateRequestEvent(boostHubNavigateRequestHandler)
    }
  }, [push])

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
