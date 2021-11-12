import React, { CSSProperties, useRef, useCallback, useEffect } from 'react'
import { boostHubWebViewUserAgent, boostHubPreloadUrl } from '../lib/boosthub'
import {
  WebviewTag,
  DidNavigateEvent,
  IpcMessageEvent,
  DidNavigateInPageEvent,
  NewWindowEvent,
  WillNavigateEvent,
} from 'electron'
import { useEffectOnce } from 'react-use'
import { openNew } from '../lib/platform'
import {
  openContextMenu,
  openExternal,
  openNewWindow,
  signInBroadcast,
  addIpcListener,
  removeIpcListener,
} from '../lib/electronOnly'
import { DidFailLoadEvent } from 'electron/main'
import styled from '../design/lib/styled'
import { boostHubBaseUrl } from '../cloud/lib/consts'

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
  const domReadyRef = useRef<boolean>(false)

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
    const willNavigateEventListener = async (event: WillNavigateEvent) => {
      if (!new URL(event.url).href.startsWith(boostHubBaseUrl)) {
        openExternal(event.url)
      }
    }

    const newWindowEventListener = async (event: NewWindowEvent) => {
      if (!new URL(event.url).href.startsWith(boostHubBaseUrl)) {
        openExternal(event.url)
      }
    }

    webview.addEventListener('will-navigate', willNavigateEventListener)
    webview.addEventListener('new-window', newWindowEventListener)

    return () => {
      webview.removeEventListener('will-navigate', willNavigateEventListener)
      webview.removeEventListener('new-window', newWindowEventListener)
    }
  }, [])

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
    if (webview == null) {
      return
    }
    const reloadIpcEventHandler = () => {
      webview.reload()
    }
    const forceReloadIpcEventHandler = () => {
      webview.reloadIgnoringCache()
    }
    const toggleDevToolsIpcEventHandler = () => {
      if (webview.isDevToolsOpened()) {
        webview.closeDevTools()
      } else {
        webview.openDevTools()
      }
    }

    addIpcListener('reload', reloadIpcEventHandler)
    addIpcListener('force-reload', forceReloadIpcEventHandler)
    addIpcListener('toggle-dev-tools', toggleDevToolsIpcEventHandler)

    return () => {
      removeIpcListener('reload', reloadIpcEventHandler)
      removeIpcListener('force-reload', forceReloadIpcEventHandler)
      removeIpcListener('toggle-dev-tools', toggleDevToolsIpcEventHandler)
    }
  })

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
            openNewWindow(urlToOpen)
            // todo: [komediruzecki-2021-10-18] once window is opened, send some request to load particular link there
            // this could be done by the above function or separately
          }
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
              },
            ],
          })
          break
        case 'sign-out':
          break
        case 'sign-in-event':
          // broadcast to other windows that sign in event happened
          signInBroadcast(webview.getWebContentsId())
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

    const domReadyHandler = () => {
      domReadyRef.current = true
    }
    webview.addEventListener('dom-ready', domReadyHandler)

    return () => {
      webview.removeEventListener('ipc-message', ipcMessageEventHandler)
      webview.removeEventListener('new-window', newWindowEventHandler)
      webview.removeEventListener('dom-ready', domReadyHandler)
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
