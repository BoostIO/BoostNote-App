import React, {
  CSSProperties,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  boostHubWebViewUserAgent,
  boostHubPreloadUrl,
} from '../../lib/boosthub'
import {
  WebviewTag,
  DidNavigateEvent,
  IpcMessageEvent,
  DidNavigateInPageEvent,
  NewWindowEvent,
  DidFailLoadEvent,
  LoadCommitEvent,
} from 'electron'
import { useEffectOnce } from 'react-use'
import styled from '../../lib/styled'
import Icon from './Icon'
import { mdiLoading } from '@mdi/js'
import { openNew } from '../../lib/platform'
import { FormSecondaryButton } from './form'
import {
  boostHubNavigateRequestEventEmitter,
  boostHubTeamCreateEventEmitter,
  boostHubTeamUpdateEventEmitter,
  boostHubTeamDeleteEventEmitter,
  boostHubAccountDeleteEventEmitter,
} from '../../lib/events'

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

interface WebviewError {
  code: number
  description: string
  validatedUrl: string
}

const BoostHubWebview = ({
  src,
  style,
  className,
  controlRef,
  onDidNavigate,
  onDidNavigateInPage,
}: BoostHubWebviewProps) => {
  const webviewRef = useRef<WebviewTag>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<WebviewError | null>(null)

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
    if (onDidNavigateInPage == null) {
      return
    }
    webview.addEventListener('did-navigate-in-page', onDidNavigateInPage)
    return () => {
      webview.removeEventListener('did-navigate-in-page', onDidNavigateInPage)
    }
  }, [onDidNavigateInPage])

  useEffectOnce(() => {
    const webview = webviewRef.current!
    const didStartLoadingEventHandler = () => {
      setLoading(true)
    }
    const didStopLoadingEventHandler = () => {
      setLoading(false)
    }
    webview.addEventListener('did-start-loading', didStartLoadingEventHandler)
    webview.addEventListener('did-stop-loading', didStopLoadingEventHandler)

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

    const didFailLoadEventHandler = (event: DidFailLoadEvent) => {
      switch (event.errorCode) {
        case -102:
          setError({
            code: event.errorCode,
            description: event.errorDescription,
            validatedUrl: event.validatedURL,
          })
          break
        case -3:
          // Skip
          break
        default:
          console.warn('unhandled did fail load event:', event)
          break
      }
    }
    webview.addEventListener('did-fail-load', didFailLoadEventHandler)

    const loadCommitEventHandler = (_event: LoadCommitEvent) => {
      setError(null)
    }
    webview.addEventListener('load-commit', loadCommitEventHandler)

    const didFinishLoadEventHandler = () => {
      setError(null)
    }
    webview.addEventListener('did-finish-load', didFinishLoadEventHandler)

    // TODO: intercept webcontents's navigate event

    return () => {
      webview.removeEventListener(
        'did-start-loading',
        didStartLoadingEventHandler
      )
      webview.removeEventListener(
        'did-stop-loading',
        didStopLoadingEventHandler
      )
      webview.removeEventListener('ipc-message', ipcMessageEventHandler)
      webview.removeEventListener('new-window', newWindowEventHandler)
      webview.removeEventListener('did-fail-load', didFailLoadEventHandler)
      webview.removeEventListener('load-commit', loadCommitEventHandler)
      webview.removeEventListener('did-finish-load', didFinishLoadEventHandler)
    }
  })

  return (
    <Container className={className} style={style}>
      {loading && (
        <div className='container'>
          <Icon path={mdiLoading} spin />
          &nbsp; Loading...
        </div>
      )}
      {!loading && error != null && (
        <div className='container'>
          <div className='error'>
            <h1>Failed to load</h1>
            <p>{error.description}</p>
            <FormSecondaryButton onClick={reload}>
              Reload page
            </FormSecondaryButton>
          </div>
        </div>
      )}
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
