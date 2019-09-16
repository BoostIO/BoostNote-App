import React from 'react'
import NotePage from './NotePage'
import { useNotesPathname } from '../lib/router'
import { StyledNotFoundPage } from './styled'

export default () => {
  const [storageId] = useNotesPathname()
  if (storageId != null) return <NotePage />
  return (
    <StyledNotFoundPage>
      <h1>Page not found</h1>
      <p>Check the URL or click other link in the left side navigation.</p>
    </StyledNotFoundPage>
  )
}
