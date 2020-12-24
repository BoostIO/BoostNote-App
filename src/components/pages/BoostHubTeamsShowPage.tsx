import React, { useState, useRef, useCallback, useEffect } from 'react'
import { getBoostHubTeamPageUrl } from '../../lib/boosthub'
import styled from '../../lib/styled'
import { DidNavigateInPageEvent, DidNavigateEvent } from 'electron'
import {
  openContextMenu,
  addIpcListener,
  removeIpcListener,
} from '../../lib/electronOnly'
import { usePreferences } from '../../lib/preferences'
import { osName } from '../../lib/platform'
import {
  borderBottom,
  border,
  uiTextColor,
  textOverflow,
} from '../../lib/styled/styleFunctions'
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiRefresh,
  mdiContentCopy,
} from '@mdi/js'
import Icon from '../atoms/Icon'
import BoostHubWebview, { WebviewControl } from '../atoms/BoostHubWebview'
import copy from 'copy-to-clipboard'
import { boostHubToggleSettingsEventEmitter } from '../../lib/events'

interface BoostHubTeamsShowPageProps {
  active: boolean
  domain: string
}

const BoostHubTeamsShowPage = ({
  active,
  domain,
}: BoostHubTeamsShowPageProps) => {
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

  const copyUrl = useCallback(() => {
    copy(url)
  }, [url])

  useEffect(() => {
    if (!active) {
      return
    }

    const toggleSettingsHandler = () => {
      webviewControlRef.current!.sendMessage('toggle-settings')
    }
    boostHubToggleSettingsEventEmitter.listen(toggleSettingsHandler)

    const newNoteHandler = () => {
      webviewControlRef.current!.sendMessage('new-note')
    }
    const newFolderHandler = () => {
      webviewControlRef.current!.sendMessage('new-folder')
    }
    const saveAsHandler = () => {
      webviewControlRef.current!.sendMessage('save-as')
    }
    const searchHandler = () => {
      webviewControlRef.current!.sendMessage('search')
    }
    const focusSideNavigatorHandler = () => {
      webviewControlRef.current!.sendMessage('focus-side-navigator')
    }
    const toggleSideNavigatorHandler = () => {
      webviewControlRef.current!.sendMessage('toggle-side-navigator')
    }
    const focusEditorHandler = () => {
      webviewControlRef.current!.sendMessage('focus-editor')
    }
    const focusTitle = () => {
      webviewControlRef.current!.sendMessage('focus-title')
    }
    const togglePreviewMode = () => {
      webviewControlRef.current!.sendMessage('toggle-preview-mode')
    }
    const toggleSplitEditMode = () => {
      webviewControlRef.current!.sendMessage('toggle-split-edit-mode')
    }
    const applyBoldStyle = () => {
      webviewControlRef.current!.sendMessage('apply-bold-style')
    }
    const applyItalicStyle = () => {
      webviewControlRef.current!.sendMessage('apply-italic-style')
    }
    addIpcListener('new-note', newNoteHandler)
    addIpcListener('new-folder', newFolderHandler)
    addIpcListener('save-as', saveAsHandler)
    addIpcListener('search', searchHandler)
    addIpcListener('focus-side-navigator', focusSideNavigatorHandler)
    addIpcListener('toggle-side-navigator', toggleSideNavigatorHandler)
    addIpcListener('focus-editor', focusEditorHandler)
    addIpcListener('focus-title', focusTitle)
    addIpcListener('toggle-preview-mode', togglePreviewMode)
    addIpcListener('toggle-split-edit-mode', toggleSplitEditMode)
    addIpcListener('apply-bold-style', applyBoldStyle)
    addIpcListener('apply-italic-style', applyItalicStyle)

    return () => {
      boostHubToggleSettingsEventEmitter.unlisten(toggleSettingsHandler)
      removeIpcListener('new-note', newNoteHandler)
      removeIpcListener('new-folder', newFolderHandler)
      removeIpcListener('save-as', saveAsHandler)
      removeIpcListener('search', searchHandler)
      removeIpcListener('focus-side-navigator', focusSideNavigatorHandler)
      removeIpcListener('toggle-side-navigator', toggleSideNavigatorHandler)
      removeIpcListener('focus-editor', focusEditorHandler)
      removeIpcListener('focus-title', focusTitle)
      removeIpcListener('toggle-preview-mode', togglePreviewMode)
      removeIpcListener('toggle-split-edit-mode', toggleSplitEditMode)
      removeIpcListener('apply-bold-style', applyBoldStyle)
      removeIpcListener('apply-italic-style', applyItalicStyle)
    }
  }, [active])

  return (
    <Container key={domain} className={active ? 'active' : ''}>
      <div className='toolbar' onContextMenu={openToolbarContextMenu}>
        {!generalShowAppNavigator && osName === 'macos' && <Spacer />}
        <button title='Go Back' onClick={goBackWebview}>
          <Icon path={mdiChevronLeft} />
        </button>
        <button title='Go Forward' onClick={goForwardWebview}>
          <Icon path={mdiChevronRight} />
        </button>
        <button title='Reload' onClick={reloadWebview}>
          <Icon path={mdiRefresh} />
        </button>
        <div title={url} className='url'>
          {url}
        </div>
        <button title='Copy URL' onClick={copyUrl}>
          <Icon path={mdiContentCopy} />
        </button>
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

export default BoostHubTeamsShowPage

const Spacer = styled.div`
  height: 24px;
  width: 70px;
  flex-shrink: 0;
`
const Container = styled.div`
  display: none;
  &.active {
    display: flex;
  }
  flex-direction: column;
  width: 100%;
  .toolbar {
    height: 40px;
    flex-shrink: 0;
    -webkit-app-region: drag;
    display: flex;
    align-items: center;
    ${borderBottom}
    justify-content: center;
    .url {
      width: 100%;
      max-width: 450px;
      ${border}
      height: 24px;
      padding: 0 5px;
      border-radius: 4px;
      ${uiTextColor}
      ${textOverflow}
    }
    & > button {
      width: 24px;
      height: 24px;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;

      background-color: transparent;
      border-radius: 50%;
      border: none;
      cursor: pointer;

      transition: color 200ms ease-in-out;
      color: ${({ theme }) => theme.navButtonColor};
      &:hover {
        color: ${({ theme }) => theme.navButtonHoverColor};
      }

      &:active,
      &.active {
        color: ${({ theme }) => theme.navButtonActiveColor};
      }
    }
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
