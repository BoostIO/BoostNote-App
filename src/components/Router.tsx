import React from 'react'
import NotePage from './NotePage'
import { storageRegexp, useRoute } from '../lib/route'
import { StyledNotFoundPage } from './styled'

export default () => {
  const { pathname } = useRoute()
  if (storageRegexp.exec(pathname)) return <NotePage />
  return (
    <StyledNotFoundPage>
      <h1>Page not found</h1>
      <p>Check the URL or click other link in the left side navigation.</p>
    </StyledNotFoundPage>
  )
}
