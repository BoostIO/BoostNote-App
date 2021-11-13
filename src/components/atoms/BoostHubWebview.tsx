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
import { openNew } from '../../lib/platform'
import {
  boostHubNavigateRequestEventEmitter,
  boostHubTeamCreateEventEmitter,
  boostHubTeamUpdateEventEmitter,
  boostHubTeamDeleteEventEmitter,
  boostHubAccountDeleteEventEmitter,
  boostHubReloadAllWebViewsEventEmitter,
  boostHubCreateLocalSpaceEventEmitter,
  boostHubSubscriptionDeleteEventEmitter,
  boostHubSubscriptionUpdateEventEmitter,
  boosthubNotificationCountsEventEmitter,
  boostHubSidebarSpaceEventEmitter,
  boostHubAppRouterEventEmitter,
  boostHubCreateCloudSpaceEventEmitter,
} from '../../lib/events'
import { usePreferences } from '../../lib/preferences'
import {
  openContextMenu,
  openExternal,
  openNewWindow,
  signInBroadcast,
} from '../../lib/electronOnly'
import { DidFailLoadEvent } from 'electron/main'
import styled from '../../design/lib/styled'

export interface WebviewControl {
  focus(): void
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
  onDidFailLoad?: (event: DidFailLoadEvent) => void
}

const BoostHubWebview = ({
  src,
  style,
  className,
  controlRef,
  onDidNavigate,
  onDidFailLoad,
}: BoostHubWebviewProps) => {
  const webviewRef = useRef<WebviewTag>(null)
  const { preferences } = usePreferences()
  const { signOutCloud } = useBoostHub()
  const domReadyRef = useRef<boolean>(false)
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

  const focus = useCallback(() => {
    webviewRef.current!.focus()
  }, [])

  useEffect(() => {
    if (controlRef == null) {
      return
    }
    controlRef.current = {
      focus,
      reload,
      goBack,
      goForward,
      openDevTools,
      sendMessage,
    }
  }, [controlRef, reload, goBack, goForward, openDevTools, sendMessage, focus])

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

  useEffect(() => {
    const webview = webviewRef.current!
    if (onDidFailLoad == null) {
      return
    }
    webview.addEventListener('did-fail-load', onDidFailLoad)
    return () => {
      webview.removeEventListener('did-fail-load', onDidFailLoad)
    }
  }, [onDidFailLoad])

  useEffectOnce(() => {
    const webview = webviewRef.current!

    const ipcMessageEventHandler = (event: IpcMessageEvent) => {
      switch (event.channel) {
        case 'new-window':
          const urlToOpen = event.args[0]
          if (urlToOpen && urlToOpen.startsWith('https://boostnote.io')) {
            // open in new browser window
            openExternal(urlToOpen)
          } else {
            // open inside new window (desktop app webview)
            openNewWindow()
            // todo: [komediruzecki-2021-10-18] once window is opened, send some request to load particular link there
            // this could be done by the above function or separately
          }
          break
        case 'new-space':
          boostHubCreateCloudSpaceEventEmitter.dispatch()
          break
        case 'router':
          boostHubAppRouterEventEmitter.dispatch({ target: event.args[0] })
          break
        case 'sidebar-spaces':
          boostHubSidebarSpaceEventEmitter.dispatch()
          break
        case 'request-app-navigate':
          boostHubNavigateRequestEventEmitter.dispatch({ url: event.args[0] })
          break
        case 'create-local-space':
          boostHubCreateLocalSpaceEventEmitter.dispatch()
          break
        case 'team-create':
          boostHubTeamCreateEventEmitter.dispatch({ team: event.args[0] })
          break
        case 'team-update':
          boostHubTeamUpdateEventEmitter.dispatch({ team: event.args[0] })
          break
        case 'notification-counts':
          boosthubNotificationCountsEventEmitter.dispatch(event.args[0])
          break
        case 'subscription-update':
          boostHubSubscriptionUpdateEventEmitter.dispatch({
            subscription: event.args[0],
          })
          break
        case 'subscription-delete':
          boostHubSubscriptionDeleteEventEmitter.dispatch({
            subscription: event.args[0],
          })
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
        case 'open-external-url':
          const [url] = event.args
          openExternal(url)
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
                type: 'submenu',
                label: 'Other Actions',
                submenu: [
                  {
                    type: 'normal',
                    label: 'Go To Home Page',
                    click: () => {
                      webview.loadURL(src)
                    },
                  },
                  {
                    type: 'normal',
                    label: 'Open Dev Tools',
                    click: openDevTools,
                  },
                  {
                    type: 'normal',
                    label: 'Hard Reload (Ignore Cache)',
                    click: () => {
                      webview.reloadIgnoringCache()
                    },
                  },
                ],
              },
              {
                type: 'separator',
              },
              {
                type: 'normal',
                label: 'Sign Out',
                click: () => signOutCloud(),
              },
            ],
          })
          break
        case 'sign-out':
          signOutCloud()
          break
        case 'sign-in-event':
          // broadcast to other windows that sign in event happened
          signInBroadcast()
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

    const reloadHandler = () => {
      webview.reload()
    }
    boostHubReloadAllWebViewsEventEmitter.listen(reloadHandler)

    const domReadyHandler = () => {
      domReadyRef.current = true
    }
    webview.addEventListener('dom-ready', domReadyHandler)

    return () => {
      webview.removeEventListener('ipc-message', ipcMessageEventHandler)
      webview.removeEventListener('new-window', newWindowEventHandler)
      webview.removeEventListener('dom-ready', domReadyHandler)
      boostHubReloadAllWebViewsEventEmitter.unlisten(reloadHandler)
    }
  })

  return (
    <Container className={className} style={style}>
      <webview
        ref={webviewRef}
        src={src}
        tabIndex={-1}
        useragent={boostHubWebViewUserAgent}
        preload={boostHubPreloadUrl}
        webpreferences='contextIsolation=no'
      />
    </Container>
  )
}

export default BoostHubWebview

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

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
