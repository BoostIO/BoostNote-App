import React, { useState, useMemo } from 'react'
import styled from '../../lib/styled'
import { usePreferences } from '../../lib/preferences'
import TabButton from './TabButton'
import { useGlobalKeyDownHandler } from '../../lib/keyboard'
import GeneralTab from './GeneralTab'
import EditorTab from './EditorTab'
import MarkdownTab from './MarkdownTab'
import AboutTab from './AboutTab'
import BillingTab from './BillingTab'
import ImportTab from './ImportTab'
import {
  backgroundColor,
  closeIconColor,
  borderLeft,
  border,
  flexCenter,
  borderBottom,
} from '../../lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import Icon from '../atoms/Icon'
import { mdiClose, mdiHammerWrench } from '@mdi/js'

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
  background-color: rgba(0, 0, 0, 0.2);
`

const ContentContainer = styled.div`
  z-index: 7001;
  position: relative;
  height: calc(100% - 2em);
  width: calc(100%-2em);
  display: flex;
  flex-direction: column;
  max-width: 1080px;
  margin: 1em auto;
  ${backgroundColor}
  ${border}
`

const ModalHeader = styled.div`
  height: 40px;
  ${borderBottom}
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
`

const TabNav = styled.nav`
  width: 200px;
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
  const { closed, toggleClosed } = usePreferences()
  const [tab, setTab] = useState('general')

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (!closed && event.key === 'Escape') {
        toggleClosed()
      }
    }
  }, [closed, toggleClosed])
  useGlobalKeyDownHandler(keydownHandler)

  const content = useMemo(() => {
    switch (tab) {
      case 'editor':
        return <EditorTab />
      case 'markdown':
        return <MarkdownTab />
      case 'about':
        return <AboutTab />
      case 'billing':
        return <BillingTab />
      case 'import':
        return <ImportTab />
      case 'general':
      default:
        return <GeneralTab />
    }
  }, [tab])

  if (closed) {
    return null
  }

  return (
    <FullScreenContainer>
      <ContentContainer>
        <ModalHeader>
          <ModalTitle>
            <Icon size={24} path={mdiHammerWrench} />
            {t('preferences.general')}
          </ModalTitle>
          <CloseButton onClick={toggleClosed}>
            <Icon path={mdiClose} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <TabNav>
            <TabButton
              label='General'
              tab='general'
              active={tab === 'general'}
              setTab={setTab}
            />
            <TabButton
              label='Editor'
              tab='editor'
              active={tab === 'editor'}
              setTab={setTab}
            />
            <TabButton
              label='Markdown'
              tab='markdown'
              active={tab === 'markdown'}
              setTab={setTab}
            />
            {/* <TabButton
          label='Hotkeys'
          tab='hotkeys'
          active={tab === 'hotkeys'}
          setTab={setTab}
        /> */}
            <TabButton
              label='About'
              tab='about'
              active={tab === 'about'}
              setTab={setTab}
            />
            <TabButton
              label='Billing'
              tab='billing'
              active={tab === 'billing'}
              setTab={setTab}
            />
            <TabButton
              label='Import'
              tab='import'
              active={tab === 'import'}
              setTab={setTab}
            />
          </TabNav>
          <TabContent>{content}</TabContent>
        </ModalBody>
      </ContentContainer>
      <BackgroundShadow onClick={toggleClosed} />
    </FullScreenContainer>
  )
}

export default PreferencesModal
