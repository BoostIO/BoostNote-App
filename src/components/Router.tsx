import React from 'react'
import NotePage from './NotePage'
import { useRouteParams } from '../lib/router'
import { StyledNotFoundPage } from './styled'

export default () => {
  const routeParams = useRouteParams()
  switch (routeParams.name) {
    case 'storages.allNotes':
    case 'storages.notes':
    case 'storages.trashCan':
    case 'storages.tags.show':
      return <NotePage />
  }
  return (
    <StyledNotFoundPage>
      <h1>Page not found</h1>
      <p>Check the URL or click other link in the left side navigation.</p>
    </StyledNotFoundPage>
  )
}
