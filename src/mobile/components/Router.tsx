import React from 'react'
import { useRouteParams } from '../lib/router'
import { useDb } from '../lib/db'
// import AttachmentsPage from './pages/AttachmentsPage'
import useRedirectHandler from '../lib/redirect'
import styled from '../../lib/styled'
import NotePage from './pages/NotePage'
import TopBarToggleNavButton from './atoms/TopBarToggleNavButton'
import TopBarLayout from './layouts/TopBarLayout'
import StorageCreatePage from './pages/StorageCreatePage'
import StorageEditPage from './pages/StorageEditPage'

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
      const storage = db.storageMap[routeParams.storageId]
      if (storage == null) {
        break
      }
      return <NotePage storage={storage} />
    }
    case 'storages.create':
      return <StorageCreatePage />
    case 'storages.settings': {
      const storage = db.storageMap[routeParams.storageId]
      if (storage == null) {
        break
      }
      return <StorageEditPage key={storage.id} storage={storage} />
    }
  }
  return (
    <TopBarLayout leftControl={<TopBarToggleNavButton />}>
      <NotFoundPageContainer>
        <h1>Page not found</h1>
      </NotFoundPageContainer>
    </TopBarLayout>
  )
}
