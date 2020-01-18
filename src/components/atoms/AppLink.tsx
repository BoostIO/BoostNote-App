import React from 'react'
import isElectron from 'is-electron'
import { getAppLinkFromUserAgent } from 'Lib/download'
import { openNew } from 'Lib/utils/platform'
import styled from 'Lib/styled'
import cc from 'classcat'
import { primaryButtonStyle } from 'Lib/styled/styleFunctions'

const AppLinkContainer = styled.button`
  ${primaryButtonStyle}
  display: block;
  padding: 0 16px;
  height: 40px;
  line-height: 1;
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  border-radius: 2px;
  margin-bottom: 10px;

  .subtext {
    font-size: 12px;
  }
`

interface AppLinkProps {
  className?: string
}
const AppLink = ({ className }: AppLinkProps) => {
  const runningOnElectron = isElectron()
  const userAgent = getAppLinkFromUserAgent()

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    openNew(runningOnElectron ? 'https://note.boostio.co/app' : userAgent.link)
  }

  return (
    <AppLinkContainer
      className={cc(['button', className])}
      disabled={!runningOnElectron && userAgent.link == null}
      onClick={handleClick}
    >
      {runningOnElectron
        ? 'Open in browser'
        : `Download ${userAgent.os !== '' ? `for ${userAgent.os}` : 'our app'}`}
    </AppLinkContainer>
  )
}

export default AppLink
