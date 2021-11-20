import React, {
  CSSProperties,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react'
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
  sendIpcMessage,
  signOutBroadcast,
} from '../lib/electronOnly'
import { DidFailLoadEvent, IpcRendererEvent } from 'electron/main'
import styled from '../design/lib/styled'
import { boostHubBaseUrl } from '../cloud/lib/consts'
import Button from '../design/components/atoms/Button'

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
}

const BoostHubWebview = ({
  src,
  style,
  className,
  controlRef,
  onDidNavigate,
}: BoostHubWebviewProps) => {
  const webviewRef = useRef<WebviewTag>(null)
  const domReadyRef = useRef<boolean>(false)
  const [connectionErrorOccurred, setConnectionErrorOccurred] = useState(false)

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
    const onDidFailLoad = (event: DidFailLoadEvent) => {
      console.warn('did fail load', event)
      if (event.errorDescription !== 'ERR_CONNECTION_REFUSED') {
        return
      }
      setConnectionErrorOccurred(true)
    }
    webview.addEventListener('did-fail-load', onDidFailLoad)
    return () => {
      webview.removeEventListener('did-fail-load', onDidFailLoad)
    }
  }, [])

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

    const newDocIpcEventHandler = () => {
      webview.send('new-doc')
    }
    const searchIpcEventHandler = () => {
      webview.send('search')
    }
    const toggleSettingsIpcEventHandler = () => {
      webview.send('toggle-settings')
    }
    const saveAsIpcEventHandler = () => {
      webview.send('save-as')
    }
    const applyBoldStyleIpcEventHandler = () => {
      webview.send('apply-bold-style')
    }
    const applyItalicStyleIpcEventHandler = () => {
      webview.send('apply-italic-style')
    }
    const focusEditorIpcEventHandler = () => {
      webview.send('focus-editor')
    }
    const focusTitleIpcEventHandler = () => {
      webview.send('focus-title')
    }
    const togglePreviewModeIpcEventHandler = () => {
      webview.send('toggle-preview-mode')
    }
    const toggleSplitEditModeIpcEventHandler = () => {
      webview.send('toggle-split-edit-mode')
    }
    const switchSpaceIpcEventHandler = (
      _event: IpcRendererEvent,
      index: number
    ) => {
      webview.send('switch-space', index)
    }
    const openBoostNoteUrlIpcEventHandler = (
      _event: IpcRendererEvent,
      index: number
    ) => {
      webview.send('open-boostnote-url', index)
    }

    addIpcListener('new-doc', newDocIpcEventHandler)
    addIpcListener('search', searchIpcEventHandler)
    addIpcListener('toggle-settings', toggleSettingsIpcEventHandler)
    addIpcListener('save-as', saveAsIpcEventHandler)
    addIpcListener('apply-bold-style', applyBoldStyleIpcEventHandler)
    addIpcListener('apply-italic-style', applyItalicStyleIpcEventHandler)
    addIpcListener('focus-editor', focusEditorIpcEventHandler)
    addIpcListener('focus-title', focusTitleIpcEventHandler)
    addIpcListener('toggle-preview-mode', togglePreviewModeIpcEventHandler)
    addIpcListener('toggle-split-edit-mode', toggleSplitEditModeIpcEventHandler)
    addIpcListener('switch-space', switchSpaceIpcEventHandler)
    addIpcListener('open-boostnote-url', openBoostNoteUrlIpcEventHandler)

    return () => {
      removeIpcListener('reload', reloadIpcEventHandler)
      removeIpcListener('force-reload', forceReloadIpcEventHandler)
      removeIpcListener('toggle-dev-tools', toggleDevToolsIpcEventHandler)

      removeIpcListener('new-doc', newDocIpcEventHandler)
      removeIpcListener('search', searchIpcEventHandler)
      removeIpcListener('toggle-settings', toggleSettingsIpcEventHandler)
      removeIpcListener('save-as', saveAsIpcEventHandler)
      removeIpcListener('apply-bold-style', applyBoldStyleIpcEventHandler)
      removeIpcListener('apply-italic-style', applyItalicStyleIpcEventHandler)
      removeIpcListener('focus-editor', focusEditorIpcEventHandler)
      removeIpcListener('focus-title', focusTitleIpcEventHandler)
      removeIpcListener('toggle-preview-mode', togglePreviewModeIpcEventHandler)
      removeIpcListener(
        'toggle-split-edit-mode',
        toggleSplitEditModeIpcEventHandler
      )
      removeIpcListener('switch-space', switchSpaceIpcEventHandler)
      removeIpcListener('open-boostnote-url', openBoostNoteUrlIpcEventHandler)
    }
  })

  useEffectOnce(() => {
    const webview = webviewRef.current!

    const ipcMessageEventHandler = (event: IpcMessageEvent) => {
      switch (event.channel) {
        // Discard after v0.23: sign-in-page-load is for smooth migration from <= v0.22 to v0.23
        case 'sign-in-page-load':
          const preferences = localStorage.getItem(
            'note.boostio.co:preferences'
          )
          if (preferences == null) {
            return
          }
          const parsedPreferences = JSON.parse(preferences)
          const accessToken = parsedPreferences['cloud.user']?.accessToken

          if (accessToken != null) {
            webview.send('sign-in-via-access-token', accessToken)
          }

          localStorage.setItem(
            'backup:note.boostio.co:preferences',
            preferences
          )
          localStorage.removeItem('note.boostio.co:preferences')
          return
        case 'new-window':
          const urlToOpen = event.args[0]
          if (typeof urlToOpen !== 'string') {
            console.warn(
              'The first argument of new-window event must be a string.'
            )
            return
          }

          if (urlToOpen.startsWith(process.env.BOOST_HUB_BASE_URL!)) {
            openNewWindow(urlToOpen)
          } else {
            openExternal(urlToOpen)
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
                    label: 'Go To Desktop Home Page',
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
        case 'sign-out-event':
          signOutBroadcast()
          break
        case 'sign-in-event':
          // broadcast to other windows that sign in event happened
          signInBroadcast(webview.getWebContentsId())
          break
        case 'register-protocol':
          sendIpcMessage('register-protocol', [])
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
      {connectionErrorOccurred && (
        <div className='connection-error'>
          <div className='connection-error__body'>
            <h1>Connection Refused</h1>
            <p>
              Cannot reach the server... Please check your internet connection.
            </p>
            <div>
              <Button
                onClick={() => {
                  setConnectionErrorOccurred(false)
                  reload()
                }}
              >
                Reload
              </Button>
            </div>
          </div>
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

  & > .connection-error {
    z-index: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #1e2024;
    color: #fff;
    font-family: ${({ theme }) => theme.fonts.family};
    display: flex;
    justify-content: center;
  }

  .connection-error__body {
    max-width: 640px;
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`
