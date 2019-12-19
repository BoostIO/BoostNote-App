import React from 'react'
import isElectron from 'is-electron'
import { getAppLinkFromUserAgent } from '../../lib/download'
import { openNew } from '../../lib/utils/platform'
import styled from '../../lib/styled'
import cc from 'classcat'

const AppLinkContainer = styled.button`
  display: block;
  background-color: rgb(3, 197, 136);
  font-size: 13px;
  padding: 0 16px;
  height: 40px;
  line-height: 1;
  color: rgb(255, 255, 255);
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  border-radius: 4px;
  margin-bottom: 10px;

  &:not(:disabled):hover {
    cursor: pointer;
    opacity: 0.8;
  }

  &.darker {
    background-color: #d7d7d7;
    color: #000;
  }

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
