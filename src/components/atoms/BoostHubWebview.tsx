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
import { openNew, osName } from '../../lib/platform'
import {
  boostHubNavigateRequestEventEmitter,
  boostHubTeamCreateEventEmitter,
  boostHubTeamUpdateEventEmitter,
  boostHubTeamDeleteEventEmitter,
  boostHubAccountDeleteEventEmitter,
  boostHubReloadAllWebViewsEventEmitter,
  boostHubCreateLocalSpaceEventEmitter,
} from '../../lib/events'
import { usePreferences } from '../../lib/preferences'
import { openContextMenu } from '../../lib/electronOnly'
import { DidFailLoadEvent, MouseInputEvent } from 'electron/main'

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
  const { preferences, setPreferences } = usePreferences()
  const { signOut } = useBoostHub()
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
                    label: 'Toggle App Navigator',
                    click: () => {
                      setPreferences((prevPreferences) => {
                        return {
                          'general.showAppNavigator': !prevPreferences[
                            'general.showAppNavigator'
                          ],
                        }
                      })
                    },
                  },
                  {
                    type: 'normal',
                    label: 'Open Dev Tools',
                    click: openDevTools,
                  },
                  {
                    type: 'normal',
                    label: 'Hard Reload(Ignore Cache)',
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
                click: signOut,
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

  const sendInputEvent = useCallback(
    (event: MouseInputEvent, focusBeforeSending = false) => {
      setImmediate(() => {
        if (webviewRef.current == null) {
          return
        }
        if (!domReadyRef.current) {
          return
        }

        if (focusBeforeSending) {
          webviewRef.current.focus()
        }

        webviewRef.current.sendInputEvent(event)
      })
    },
    []
  )

  const bypassClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { x, y } = getTargetPosition(event)
      const button = getTargetButton(event)
      if (button == null) {
        return
      }

      sendInputEvent(
        {
          button,
          clickCount: 1,
          type: 'mouseDown',
          x,
          y,
        },
        true
      )
      sendInputEvent({
        button,
        clickCount: 1,
        type: 'mouseUp',
        x,
        y,
      })
    },
    [sendInputEvent]
  )

  const bypassDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { x, y } = getTargetPosition(event)
      const button = getTargetButton(event)
      if (button == null) {
        return
      }

      sendInputEvent(
        {
          button,
          clickCount: 2,
          type: 'mouseDown',
          x,
          y,
        },
        true
      )
      sendInputEvent({
        button,
        clickCount: 2,
        type: 'mouseUp',
        x,
        y,
      })
    },
    [sendInputEvent]
  )
  const bypassContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { x, y } = getTargetPosition(event)
      const button = getTargetButton(event)
      if (button == null) {
        return
      }

      sendInputEvent(
        {
          button,
          clickCount: 1,
          type: 'mouseDown',
          x,
          y,
        },
        true
      )
      sendInputEvent({
        button,
        clickCount: 1,
        type: 'mouseUp',
        x,
        y,
      })
    },
    [sendInputEvent]
  )

  const bypassMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { x, y } = getTargetPosition(event)

      sendInputEvent({
        type: 'mouseEnter',
        x,
        y,
      })
    },
    [sendInputEvent]
  )
  const bypassMouseLeave = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { x, y } = getTargetPosition(event)

      sendInputEvent({
        type: 'mouseLeave',
        x,
        y,
      })
    },
    [sendInputEvent]
  )

  const bypassMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { x, y } = getTargetPosition(event)

      sendInputEvent({
        type: 'mouseMove',
        x,
        y,
        movementX: event.movementX,
        movementY: event.movementY,
      })
    },
    [sendInputEvent]
  )

  return (
    <Container className={className} style={style}>
      {osName === 'macos' && (
        <div
          className='draggable'
          onClick={bypassClick}
          onContextMenu={bypassContextMenu}
          onDoubleClick={bypassDoubleClick}
          onMouseEnter={bypassMouseEnter}
          onMouseLeave={bypassMouseLeave}
          onMouseMove={bypassMouseMove}
        >
          Draggable Area
        </div>
      )}
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
  & > .draggable {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    height: 44px;
    background-color: rgba(255, 0, 0, 0.2);
    -webkit-user-select: none;
    -webkit-app-region: drag;
    opacity: 0;
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

function getTargetButton(
  event: React.MouseEvent<HTMLDivElement>
): 'left' | 'right' | 'middle' | null {
  switch (event.button) {
    case 0:
      return 'left'
    case 1:
      return 'middle'
    case 2:
      return 'right'
  }
  return null
}

function getTargetPosition(
  event: React.MouseEvent<HTMLDivElement>
): { x: number; y: number } {
  const rect = (event.target as HTMLDivElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return {
    x,
    y,
  }
}
