import React, { useEffect, useMemo } from 'react'
import { useRouter } from '../lib/router'
import { useRouteParams, AllRouteParams } from '../lib/routeParams'
import { useDb } from '../lib/db'
import FSDbDeprecationPage from './pages/FsDbDeprecationPage'
import { values } from '../lib/db/utils'
import BoostHubTeamsShowPage from './pages/BoostHubTeamsShowPage'
import BoostHubTeamsCreatePage from './pages/BoostHubTeamsCreatePage'
import BoostHubAccountDeletePage from './pages/BoostHubAccountDeletePage'
import {
  boostHubAppRouterEventEmitter,
  BoostHubNavigateRequestEvent,
  boostHubNavigateRequestEventEmitter,
  BoostHubAppRouterEvent,
} from '../lib/events'
import { parse as parseUrl } from 'url'
import { openNew } from '../lib/platform'
import BoostHubLoginPage from './pages/BoostHubLoginPage'
import { ObjectMap, NoteStorage, FSNoteStorage } from '../lib/db/types'
import { useGeneralStatus } from '../lib/generalStatus'
import NotFoundErrorPage from './pages/NotFoundErrorPage'

const Router = () => {
  const routeParams = useRouteParams()
  const { storageMap } = useDb()
  const { push, goBack, goForward } = useRouter()
  const { generalStatus } = useGeneralStatus()

  useEffect(() => {
    const boostHubAppRouterEventHandler = (event: BoostHubAppRouterEvent) => {
      switch (event.detail.target) {
        case 'forward':
          goForward()
          return
        case 'back':
        default:
          goBack()
          return
      }
    }

    boostHubAppRouterEventEmitter.listen(boostHubAppRouterEventHandler)
    return () => {
      boostHubAppRouterEventEmitter.unlisten(boostHubAppRouterEventHandler)
    }
  }, [goBack, goForward])

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
      const pathnameElements = pathname!.slice(1).split('/')
      const firstPathnameElement = pathnameElements[0]
      switch (firstPathnameElement) {
        case 'account':
          if (pathnameElements[1] === 'delete') {
            push('/app/boosthub/account/delete')
          } else {
            openNew(url)
          }
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
          push(`/app/boosthub/teams/${firstPathnameElement}`)
          break
      }
    }
    boostHubNavigateRequestEventEmitter.listen(boostHubNavigateRequestHandler)

    return () => {
      boostHubNavigateRequestEventEmitter.unlisten(
        boostHubNavigateRequestHandler
      )
    }
  }, [push])

  useRedirect()

  return (
    <>
      {useContent(routeParams, storageMap)}
      {generalStatus.boostHubTeams.map((team) => {
        const active =
          routeParams.name === 'boosthub.teams.show' &&
          routeParams.domain === team.domain
        return (
          <BoostHubTeamsShowPage
            active={active}
            key={team.domain}
            domain={team.domain}
          />
        )
      })}
    </>
  )
}

export default Router

function useContent(
  routeParams: AllRouteParams,
  storageMap: ObjectMap<NoteStorage>
) {
  switch (routeParams.name) {
    case 'boosthub.login':
      return <BoostHubLoginPage />
    case 'boosthub.teams.create':
      return <BoostHubTeamsCreatePage />
    case 'boosthub.account.delete':
      return <BoostHubAccountDeletePage />
    case 'boosthub.teams.show':
      return null
    case 'local': {
      const { workspaceId } = routeParams
      const storage = storageMap[workspaceId]
      if (storage == null) {
        break
      }
      return <FSDbDeprecationPage storage={storage as FSNoteStorage} />
    }
  }
  return <NotFoundErrorPage />
}

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
    if (pathname === '' || pathname === '/' || pathname === '/app') {
      if (firstStorageId == null) {
        replace('/app/storages')
      } else {
        replace(`/app/storages/${firstStorageId}`)
      }
    }
  }, [pathname, replace, firstStorageId])
}
