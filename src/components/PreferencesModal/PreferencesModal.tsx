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
} from '../../lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import Icon from '../atoms/Icon'
import { mdiClose } from '@mdi/js'

const Container = styled.div`
  z-index: 7000;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  ${backgroundColor}
  overflow: auto;
  padding: 0 calc((100% - 1070px) / 2);
`

const Header = styled.h1`
  margin: 0;
  padding: 1em 0;
  font-weight: bold;
`

const TabNav = styled.nav`
  width: 200px;
  position: fixed;
`

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-left: 4px;
  padding-top: 4em;
  position: relative;
  left: 200px;
  width: 800px;
`

const CloseButton = styled.button`
  position: fixed;
  top: 20px;
  right: calc(15% - 30px);
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: none;
  font-size: 24px;
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
    <Container>
      <TabNav>
        <Header>{t('preferences.general')}</Header>
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
      <CloseButton onClick={toggleClosed}>
        <Icon path={mdiClose} />
      </CloseButton>
    </Container>
  )
}

export default PreferencesModal
