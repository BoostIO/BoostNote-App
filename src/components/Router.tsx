import React from 'react'
import NotePage from './NotePage'
import { useRouteParams } from '../lib/router'
import { StyledNotFoundPage } from './styled'
import { StorageEdit, StorageCreate } from './Storage'
import { useDb } from '../lib/db'
import TutorialsPage from './Tutorials/TutorialsPage'

export default () => {
  const routeParams = useRouteParams()
  const db = useDb()
  switch (routeParams.name) {
    case 'storages.allNotes':
    case 'storages.notes':
    case 'storages.trashCan':
    case 'storages.tags.show':
      return <NotePage />
    case 'storages.create':
      return <StorageCreate />
    case 'storages.edit':
      const storage = db.storageMap[routeParams.storageId]
      if (storage != null) {
        return <StorageEdit storage={storage} />
      } else {
        break
      }
    case 'tutorials.show':
      return <TutorialsPage pathname={routeParams.path} />
      break
  }
  return (
    <StyledNotFoundPage>
      <h1>Page not found</h1>
      <p>Check the URL or click other link in the left side navigation.</p>
    </StyledNotFoundPage>
  )
}
