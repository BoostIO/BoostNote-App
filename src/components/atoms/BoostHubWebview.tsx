import React, {
  CSSProperties,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import {
  boostHubWebViewUserAgent,
  boostHubPreloadUrl,
  useBoostHub,
} from '../../lib/boosthub'
import {
  WebviewTag,
  DidNavigateEvent,
  IpcMessageEvent,
  DidNavigateInPageEvent,
  NewWindowEvent,
} from 'electron'
import { useEffectOnce } from 'react-use'
import styled from '../../lib/styled'
import { openNew } from '../../lib/platform'
import {
  boostHubNavigateRequestEventEmitter,
  boostHubTeamCreateEventEmitter,
  boostHubTeamUpdateEventEmitter,
  boostHubTeamDeleteEventEmitter,
  boostHubAccountDeleteEventEmitter,
} from '../../lib/events'
import { usePreferences } from '../../lib/preferences'
import { openContextMenu } from '../../lib/electronOnly'

export interface WebviewControl {
  reload(): void
  goBack(): void
  goForward(): void
  openDevTools(): void
  sendMessage(channel: string, ...args: any[]): void
}

interface BoostHubWebviewProps {
  src: string
  style?: CSSProperties
  className?: string
  controlRef?: React.MutableRefObject<WebviewControl | undefined>
  onDidNavigate?: (event: DidNavigateEvent) => void
  onDidNavigateInPage?: (event: DidNavigateInPageEvent) => void
}

const BoostHubWebview = ({
  src,
  style,
  className,
  controlRef,
  onDidNavigate,
}: BoostHubWebviewProps) => {
  const webviewRef = useRef<WebviewTag>(null)
  const { preferences, setPreferences } = usePreferences()
  const { signOut } = useBoostHub()
  const cloudUser = preferences['cloud.user']

  const accessToken = useMemo(() => {
    if (cloudUser == null) {
      return null
    }
    return cloudUser.accessToken
  }, [cloudUser])

  const reload = useCallback(() => {
    webviewRef.current!.reload()
  }, [])

  const goBack = useCallback(() => {
    webviewRef.current!.goBack()
  }, [])

  const goForward = useCallback(() => {
    webviewRef.current!.goForward()
  }, [])

  const openDevTools = useCallback(() => {
    webviewRef.current!.openDevTools()
  }, [])

  const sendMessage = useCallback((channel: string, ...args: any[]) => {
    webviewRef.current!.send(channel, ...args)
  }, [])

  useEffect(() => {
    if (controlRef == null) {
      return
    }
    controlRef.current = {
      reload,
      goBack,
      goForward,
      openDevTools,
      sendMessage,
    }
  }, [controlRef, reload, goBack, goForward, openDevTools, sendMessage])

  useEffect(() => {
    const webview = webviewRef.current!
    if (onDidNavigate == null) {
      return
    }
    webview.addEventListener('did-navigate', onDidNavigate)
    return () => {
      webview.removeEventListener('did-navigate', onDidNavigate)
    }
  }, [onDidNavigate])

  useEffectOnce(() => {
    const webview = webviewRef.current!

    const ipcMessageEventHandler = (event: IpcMessageEvent) => {
      switch (event.channel) {
        case 'request-app-navigate':
          boostHubNavigateRequestEventEmitter.dispatch({ url: event.args[0] })
          break
        case 'team-create':
          boostHubTeamCreateEventEmitter.dispatch({ team: event.args[0] })
          break
        case 'team-update':
          boostHubTeamUpdateEventEmitter.dispatch({ team: event.args[0] })
          break
        case 'team-delete':
          boostHubTeamDeleteEventEmitter.dispatch({ team: event.args[0] })
          break
        case 'account-delete':
          boostHubAccountDeleteEventEmitter.dispatch()
          break
        case 'request-access-token':
          webview.send('update-access-token', accessToken)
          break
        case 'open-context-menu':
          openContextMenu({
            menuItems: [
              {
                type: 'normal',
                label: 'Back',
                click: goBack,
              },
              {
                type: 'normal',
                label: 'Forward',
                click: goForward,
              },
              {
                type: 'normal',
                label: 'Reload',
                click: reload,
              },
              {
                type: 'separator',
              },
              {
                type: 'normal',
                label: 'Sign Out',
                click: signOut,
              },
              {
                type: 'separator',
              },
              {
                type: 'normal',
                label: 'Open Dev Tools',
                click: openDevTools,
              },
              {
                type: 'normal',
                label: 'Toggle App Navigator',
                click: () => {
                  setPreferences((prevPreferences) => {
                    return {
                      ...prevPreferences,
                      'general.showAppNavigator': !prevPreferences[
                        'general.showAppNavigator'
                      ],
                    }
                  })
                },
              },
            ],
          })
          break
        case 'sign-out':
          signOut()
          break
        default:
          console.log('Unhandled ipc message event', event.channel, event.args)
          break
      }
    }
    webview.addEventListener('ipc-message', ipcMessageEventHandler)

    const newWindowEventHandler = (event: NewWindowEvent) => {
      event.preventDefault()
      openNew(event.url)
    }
    webview.addEventListener('new-window', newWindowEventHandler)

    return () => {
      webview.removeEventListener('ipc-message', ipcMessageEventHandler)
      webview.removeEventListener('new-window', newWindowEventHandler)
    }
  })

  return (
    <Container className={className} style={style}>
      <webview
        ref={webviewRef}
        src={src}
        useragent={boostHubWebViewUserAgent}
        preload={boostHubPreloadUrl}
      />
    </Container>
  )
}

export default BoostHubWebview

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  & > .container {
    z-index: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.backgroundColor};
  }
  .error {
    max-width: 500px;
    text-align: center;
  }
  & > webview {
    z-index: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
`
