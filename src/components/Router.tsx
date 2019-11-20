import React from 'react'
import NotePage from './NotePage'
import { useRouteParams } from '../lib/router'
import { StyledNotFoundPage } from './styled'
import StorageCreate from './Storage/StorageCreate'

export default () => {
  const routeParams = useRouteParams()
  switch (routeParams.name) {
    case 'storages.allNotes':
    case 'storages.notes':
    case 'storages.trashCan':
    case 'storages.tags.show':
      return <NotePage />
    case 'storages.create':
      return <StorageCreate />
  }
  return (
    <StyledNotFoundPage>
      <h1>Page not found</h1>
      <p>Check the URL or click other link in the left side navigation.</p>
    </StyledNotFoundPage>
  )
}
