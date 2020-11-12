import React, { useState, useRef, useCallback, useMemo } from 'react'
import { getBoostHubTeamPageUrl } from '../../lib/boosthub'
import styled from '../../lib/styled'
import { DidNavigateInPageEvent, DidNavigateEvent } from 'electron'
import { openContextMenu } from '../../lib/electronOnly'
import { usePreferences } from '../../lib/preferences'
import cc from 'classcat'
import { osName } from '../../lib/platform'
import { borderBottom } from '../../lib/styled/styleFunctions'
import { mdiChevronLeft, mdiChevronRight, mdiRefresh } from '@mdi/js'
import Icon from '../atoms/Icon'
import { parse as parseUrl } from 'url'
import BoostHubWebview, { WebviewControl } from '../atoms/BoostHubWebview'

interface BoostHubPageProps {
  domain: string
}

const BoostHubPage = ({ domain }: BoostHubPageProps) => {
  const webviewControlRef = useRef<WebviewControl>()
  const teamPageUrl = getBoostHubTeamPageUrl(domain)
  const [url, setUrl] = useState(teamPageUrl)
  const { preferences, setPreferences } = usePreferences()

  const generalShowAppNavigator = preferences['general.showAppNavigator']

  const openToolbarContextMenu = useCallback(() => {
    openContextMenu({
      menuItems: [
        {
          type: 'normal',
          label: 'Open Dev tool for web view',
          click: () => {
            webviewControlRef.current!.openDevTools()
          },
        },
        {
          type: 'separator',
        },
        {
          type: 'normal',
          label: generalShowAppNavigator
            ? 'Hide App Navigator'
            : 'Show App Navigator',
          click: () => {
            setPreferences({
              'general.showAppNavigator': !generalShowAppNavigator,
            })
          },
        },
      ],
    })
  }, [generalShowAppNavigator, setPreferences])

  const pathname = useMemo(() => {
    return '/' + parseUrl(url).pathname!.split('/').slice(2).join('/')
  }, [url])

  const reloadWebview = useCallback(() => {
    webviewControlRef.current!.reload()
  }, [])
  const goForwardWebview = useCallback(() => {
    webviewControlRef.current!.goForward()
  }, [])
  const goBackWebview = useCallback(() => {
    webviewControlRef.current!.goBack()
  }, [])

  const updateUrl = useCallback(
    (event: DidNavigateInPageEvent | DidNavigateEvent) => {
      setUrl(event.url)
    },
    []
  )

  return (
    <Container key={domain}>
      <div className={cc(['toolbar'])} onContextMenu={openToolbarContextMenu}>
        {!generalShowAppNavigator && osName === 'macos' && <Spacer />}
        <button onClick={goBackWebview}>
          <Icon path={mdiChevronLeft} />
        </button>
        <button onClick={goForwardWebview}>
          <Icon path={mdiChevronRight} />
        </button>
        <button onClick={reloadWebview}>
          <Icon path={mdiRefresh} />
        </button>
        <div>
          /{domain}
          {pathname}
        </div>
      </div>
      <div className='webview'>
        <BoostHubWebview
          src={teamPageUrl}
          onDidNavigate={updateUrl}
          onDidNavigateInPage={updateUrl}
          controlRef={webviewControlRef}
        />
      </div>
    </Container>
  )
}

export default BoostHubPage

const Spacer = styled.div`
  height: 24px;
  width: 70px;
  flex-shrink: 0;
`
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  .toolbar {
    flex-shrink: 0;
    height: 24px;
    -webkit-app-region: drag;
    display: flex;
    align-items: center;
    ${borderBottom}
  }
  .webview {
    flex: 1;
    position: relative;
    width: 100%;

    & > webview {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
`
