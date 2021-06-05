import React, { useState, useRef, useCallback, useEffect } from 'react'
import { getBoostHubTeamPageUrl } from '../../lib/boosthub'
import { DidNavigateInPageEvent, DidNavigateEvent } from 'electron'
import { addIpcListener, removeIpcListener } from '../../lib/electronOnly'
import BoostHubWebview, { WebviewControl } from '../atoms/BoostHubWebview'
import {
  boostHubOpenDiscountModalEventEmitter,
  boostHubOpenImportModalEventEmitter,
  boostHubToggleSettingsEventEmitter,
  boostHubToggleSettingsMembersEventEmitter,
  boostHubToggleSidebarSearchEventEmitter,
  boostHubToggleSidebarTimelineEventEmitter,
  boostHubToggleSidebarTreeEventEmitter,
} from '../../lib/events'
import { DidFailLoadEvent } from 'electron/main'
import styled from '../../shared/lib/styled'
import {
  border,
  borderBottom,
  textOverflow,
} from '../../shared/lib/styled/styleFunctions'
import { uiTextColor } from '../../lib/styled/styleFunctionsLocal'
import Button from '../../shared/components/atoms/Button'

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

  const updateUrl = useCallback(
    (event: DidNavigateInPageEvent | DidNavigateEvent) => {
      setUrl(event.url)
    },
    []
  )

  useEffect(() => {
    if (!active) {
      return
    }

    const toggleOpenImportModalHandler = () => {
      webviewControlRef.current!.sendMessage('modal-import')
    }
    boostHubOpenImportModalEventEmitter.listen(toggleOpenImportModalHandler)

    const toggleOpenDiscountModalHandler = () => {
      webviewControlRef.current!.sendMessage('modal-discount')
    }
    boostHubOpenDiscountModalEventEmitter.listen(toggleOpenDiscountModalHandler)

    const toggleSettingsHandler = () => {
      webviewControlRef.current!.sendMessage('toggle-settings')
    }
    boostHubToggleSettingsEventEmitter.listen(toggleSettingsHandler)

    const toggleSidebarTreeHandler = () => {
      webviewControlRef.current!.sendMessage('toggle-sidebar-tree')
    }
    boostHubToggleSidebarTreeEventEmitter.listen(toggleSidebarTreeHandler)
    const toggleSidebarTimelineHandler = () => {
      webviewControlRef.current!.sendMessage('toggle-sidebar-timeline')
    }
    boostHubToggleSidebarTimelineEventEmitter.listen(
      toggleSidebarTimelineHandler
    )
    const toggleSidebarSearchHandler = () => {
      webviewControlRef.current!.focus()
      webviewControlRef.current!.sendMessage('toggle-sidebar-search')
    }
    boostHubToggleSidebarSearchEventEmitter.listen(toggleSidebarSearchHandler)

    const toggleSettingsMembersHandler = () => {
      webviewControlRef.current!.sendMessage('toggle-settings-members')
    }
    boostHubToggleSettingsMembersEventEmitter.listen(
      toggleSettingsMembersHandler
    )

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
      boostHubOpenDiscountModalEventEmitter.unlisten(
        toggleOpenDiscountModalHandler
      )
      boostHubOpenImportModalEventEmitter.unlisten(toggleOpenImportModalHandler)
      boostHubToggleSettingsEventEmitter.unlisten(toggleSettingsHandler)
      boostHubToggleSettingsMembersEventEmitter.unlisten(
        toggleSettingsMembersHandler
      )
      boostHubToggleSidebarSearchEventEmitter.unlisten(
        toggleSidebarSearchHandler
      )
      boostHubToggleSidebarTimelineEventEmitter.unlisten(
        toggleSidebarTimelineHandler
      )
      boostHubToggleSidebarTreeEventEmitter.unlisten(toggleSidebarTreeHandler)
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

  // Release focus before hiding webview
  useEffect(() => {
    if (active) {
      webviewControlRef.current!.focus()
    }
    return () => {
      window.focus()
    }
  }, [active])

  const [refusedConnection, setRefusedConnection] = useState(false)

  const reloadWebview = useCallback(() => {
    if (webviewControlRef.current == null) {
      return
    }
    webviewControlRef.current.reload()
    setRefusedConnection(false)
  }, [])

  const handleWebviewDidFailLoadEventHandler = useCallback(
    (event: DidFailLoadEvent) => {
      console.warn('did fail load', event)
      if (event.errorDescription !== 'ERR_CONNECTION_REFUSED') {
        return
      }

      setRefusedConnection(true)
    },
    []
  )

  return (
    <Container key={domain} className={active ? 'active' : ''}>
      <div className='webview'>
        <BoostHubWebview
          src={url}
          onDidNavigate={updateUrl}
          onDidNavigateInPage={updateUrl}
          onDidFailLoad={handleWebviewDidFailLoadEventHandler}
          controlRef={webviewControlRef}
        />
      </div>
      {refusedConnection && (
        <ReloadView>
          <div>
            <h1 className='heading'>Cannot Reach Server</h1>
            <p className='description'>
              Please check your internet connection.
            </p>
            <Button variant={'secondary'} onClick={reloadWebview}>
              Reload Page
            </Button>
          </div>
        </ReloadView>
      )}
    </Container>
  )
}

export default BoostHubTeamsShowPage

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
    display: flex;
    align-items: center;
    ${borderBottom};
    justify-content: center;
    .url {
      width: 100%;
      max-width: 450px;
      ${border};
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
      color: ${({ theme }) => theme.colors.text.primary};
      &:hover {
        color: ${({ theme }) => theme.colors.text.secondary};
      }

      &:active,
      &.active {
        color: ${({ theme }) => theme.colors.text.link};
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

const ReloadView = styled.div`
  position: absolute;
  top: 0;
  left: 72px;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: ${({ theme }) => theme.colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  .heading {
    text-align: center;
  }
  .description {
    text-align: center;
  }
`
