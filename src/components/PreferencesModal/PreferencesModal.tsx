import React, { useMemo, useCallback } from 'react'
import { usePreferences } from '../../lib/preferences'
import { useGlobalKeyDownHandler } from '../../lib/keyboard'
import GeneralTab from './GeneralTab'
import EditorTab from './EditorTab'
import MarkdownTab from './MarkdownTab'
import AboutTab from './AboutTab'
import { useTranslation } from 'react-i18next'
import { mdiClose, mdiHammerWrench } from '@mdi/js'
import { useDb } from '../../lib/db'
import { useRouteParams } from '../../lib/routeParams'
import StorageTab from './StorageTab'
import MigrationPage from './MigrationTab'
import { useMigrations } from '../../lib/migrate/store'
import KeymapTab from './KeymapTab'
import styled from '../../shared/lib/styled'
import {
  border,
  backgroundColor,
  borderBottom,
  borderLeft,
  closeIconColor,
  flexCenter,
} from '../../shared/lib/styled/styleFunctions'
import SettingNavButtonItem from '../../shared/components/organisms/Settings/atoms/SettingNavItem'
import Icon from '../../shared/components/atoms/Icon'
import ExportTab from './ExportTab'
import SponsorTab from './SponsorTab'

const FullScreenContainer = styled.div`
  z-index: 7000;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const BackgroundShadow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  ${border}
`

const ContentContainer = styled.div`
  z-index: 7001;
  position: absolute;
  top: 0;
  left: 0px;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  ${backgroundColor}
  ${border}
`

const ModalHeader = styled.div`
  height: 40px;
  ${borderBottom};
  display: flex;
`

const ModalTitle = styled.h1`
  margin: 0;
  line-height: 40px;
  font-size: 1em;
  font-weight: bold;
  padding: 0 10px;
  flex: 1;
  display: flex;
  align-items: center;
`

const ModalBody = styled.div`
  display: flex;
  overflow: hidden;
  height: 100%;
`

const TabNav = styled.nav`
  width: 200px;
  padding: 10px;
`

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1em;
  ${borderLeft}
`

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: none;
  font-size: 24px;
  ${flexCenter}
  ${closeIconColor}
`

const PreferencesModal = () => {
  const { t } = useTranslation()
  const { closed, togglePreferencesModal, tab, openTab } = usePreferences()
  const { storageMap } = useDb()
  const routeParams = useRouteParams()
  const { get } = useMigrations()

  const currentStorage = useMemo(() => {
    let storageId: string
    switch (routeParams.name) {
      case 'local':
        storageId = routeParams.workspaceId
        break
      default:
        return null
    }
    const storage = storageMap[storageId]
    return storage != null ? storage : null
  }, [storageMap, routeParams])

  const keydownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!closed && event.key === 'Escape') {
        togglePreferencesModal()
      }
    },
    [closed, togglePreferencesModal]
  )
  useGlobalKeyDownHandler(keydownHandler)

  const content = useMemo(() => {
    switch (tab) {
      case 'keymap':
        return <KeymapTab />
      case 'editor':
        return <EditorTab />
      case 'markdown':
        return <MarkdownTab />
      case 'export':
        return <ExportTab />
      case 'about':
        return <AboutTab />
      case 'sponsor':
        return <SponsorTab />
      case 'storage':
        if (currentStorage != null) {
          return <StorageTab storage={currentStorage} />
        }
        break
      case 'migration':
        if (currentStorage != null) {
          return <MigrationPage storage={currentStorage} />
        }
        break
    }
    return <GeneralTab />
  }, [tab, currentStorage])

  if (closed) {
    return null
  }

  return (
    <FullScreenContainer>
      <ContentContainer>
        <ModalHeader>
          <ModalTitle>
            <Icon size={26} path={mdiHammerWrench} />
            {t('preferences.general')}
          </ModalTitle>
          <CloseButton onClick={togglePreferencesModal}>
            <Icon path={mdiClose} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <TabNav>
            <SettingNavButtonItem
              label={t('about.about')}
              active={tab === 'about'}
              onClick={() => openTab('about')}
            />
            <SettingNavButtonItem
              label={t('preferences.keymap')}
              active={tab === 'keymap'}
              onClick={() => openTab('keymap')}
            />
            <SettingNavButtonItem
              label={t('general.general')}
              active={tab === 'general'}
              onClick={() => openTab('general')}
            />
            {currentStorage != null && (
              <SettingNavButtonItem
                label='Space'
                active={tab === 'storage' || tab === 'migration'}
                onClick={() =>
                  openTab(
                    get(currentStorage.id) != null ? 'migration' : 'storage'
                  )
                }
              />
            )}
            <SettingNavButtonItem
              label={t('editor.editor')}
              active={tab === 'editor'}
              onClick={() => openTab('editor')}
            />
            <SettingNavButtonItem
              label='Markdown'
              active={tab === 'markdown'}
              onClick={() => openTab('markdown')}
            />
            <SettingNavButtonItem
              label='Export'
              active={tab === 'export'}
              onClick={() => openTab('export')}
            />
            <SettingNavButtonItem
              label='Sponsor'
              active={tab === 'sponsor'}
              onClick={() => openTab('sponsor')}
            />
          </TabNav>
          <TabContent>{content}</TabContent>
        </ModalBody>
      </ContentContainer>
      <BackgroundShadow onClick={togglePreferencesModal} />
    </FullScreenContainer>
  )
}

export default PreferencesModal
