import React, { useState, useMemo } from 'react'
import styled from '../../lib/styled'
import Icon from '../atoms/Icon'
import { mdiClose } from '@mdi/js'
import { usePreferences } from '../../lib/preferences'
import TabButton from './TabButton'
import { useGlobalKeyDownHandler } from '../../lib/keyboard'
import GeneralTab from './GeneralTab'
import EditorTab from './EditorTab'
import MarkdownTab from './MarkdownTab'
import AboutTab from './AboutTab'

const StyledContainer = styled.div`
  z-index: 7000;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 30px;
  background-color: white;
  .nav {
    width: 200px;
    margin-right: 10px;
  }
  .navButton {
    display: block;
    width: 100%;
    height: 30px;
    &.active {
      background-color: ${({ theme }) => theme.colors.active};
    }
  }
  .content {
    flex: 1;
  }
  .closeButton {
    position: absolute;
    top: 0;
    right: 0;
    width: 30px;
    height: 30px;
  }
`

const PreferencesModal = () => {
  const { closed, toggleClosed } = usePreferences()
  const [tab, setTab] = useState('general')

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (!closed && event.key === 'Escape') {
        toggleClosed()
      }
    }
  }, [closed])
  useGlobalKeyDownHandler(keydownHandler)

  const content = useMemo(() => {
    switch (tab) {
      case 'editor':
        return <EditorTab />
      case 'markdown':
        return <MarkdownTab />
      case 'about':
        return <AboutTab />
      case 'general':
      default:
        return <GeneralTab />
    }
  }, [tab])

  if (closed) {
    return null
  }

  return (
    <StyledContainer>
      <div className='nav'>
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
      </div>
      <div className='content'>{content}</div>
      <button className='closeButton' onClick={toggleClosed}>
        <Icon path={mdiClose} />
      </button>
    </StyledContainer>
  )
}

export default PreferencesModal
