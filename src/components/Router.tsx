import React from 'react'
import NotePage from './pages/NotePage'
import { useRouteParams } from '../lib/router'
import StorageCreatePage from './pages/StorageCreatePage'
import StorageEditPage from './pages/StorageEditPage'
import { useDb } from '../lib/db'
import AttachmentsPage from './pages/AttachmentsPage'
import useRedirectHandler from '../lib/router/redirect'
import styled from '../lib/styled'
import { usePreferences } from '../lib/preferences'
import WikiNotePage from './pages/WikiNotePage'

const NotFoundPageContainer = styled.div`
  padding: 15px 25px;
`

const Router = () => {
  const routeParams = useRouteParams()
  const db = useDb()
  const { preferences } = usePreferences()
  const navigationMode = preferences['general.navigationMode']
  useRedirectHandler()

  switch (routeParams.name) {
    case 'storages.notes':
    case 'storages.trashCan':
    case 'storages.tags.show': {
      const { storageId } = routeParams
      const storage = db.storageMap[storageId]
      if (storage == null) {
        break
      }

      if (navigationMode === 'note') {
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
    case 'storages.settings':
      const storage = db.storageMap[routeParams.storageId]
      if (storage == null) {
        break
      }
      return <StorageEditPage key={routeParams.storageId} storage={storage} />
  }
  return (
    <NotFoundPageContainer>
      <h1>Page not found</h1>
      <p>Check the URL or click other link in the left side navigation.</p>
    </NotFoundPageContainer>
  )
}

export default Router
