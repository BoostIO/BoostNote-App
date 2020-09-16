import React from 'react'
import NotePage from './pages/NotePage'
import { useRouteParams } from '../lib/router'
import StorageCreatePage from './pages/StorageCreatePage'
import StorageEditPage from './pages/StorageEditPage'
import { useDb } from '../lib/db'
import AttachmentsPage from './pages/AttachmentsPage'
import useRedirectHandler from '../lib/router/redirect'
import styled from '../lib/styled'

const NotFoundPageContainer = styled.div`
  padding: 15px 25px;
`

export default () => {
  const routeParams = useRouteParams()
  const db = useDb()

  useRedirectHandler()

  switch (routeParams.name) {
    case 'storages.notes':
    case 'storages.trashCan':
    case 'storages.tags.show': {
      const { storageId, noteId } = routeParams
      const storage = db.storageMap[storageId]
      if (storage == null) {
        break
      }
      return <NotePage storage={storage} noteId={noteId} />
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
