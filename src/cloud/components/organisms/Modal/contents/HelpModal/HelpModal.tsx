import React, { useMemo, useEffect, useState } from 'react'
import { useModal } from '../../../../../lib/stores/modal'
import {
  preventKeyboardEventPropagation,
  useCapturingGlobalKeyDownHandler,
  useUpDownNavigationListener,
} from '../../../../../lib/keyboard'
import {
  isFocusRightSideShortcut,
  isFocusLeftSideShortcut,
} from '../../../../../lib/shortcuts'
import { focusFirstChildFromElement } from '../../../../../lib/dom'
import { StyledSideNavModal } from '../../styled'
import CheatSheetModal from './CheatsheetModal'
import CustomBlocksModal from './CustomBlocksModal'
import HelpModalNavButton from './HelpModalNavButton'
import styled from '../../../../../lib/styled'
import ScheduleSessionModal from './ScheduleSessionModal'
import AppFeedbackTab from '../../../settings/AppFeedbackTab'

export type HelpModalType = 'shortcut' | 'customblock' | 'calendly' | 'request'

interface HelpModalsLayout {
  currentTab: HelpModalType
}

const HelpModal = ({ currentTab }: HelpModalsLayout) => {
  const { modalContent } = useModal()
  const contentSideRef = React.createRef<HTMLDivElement>()
  const menuRef = React.createRef<HTMLDivElement>()
  const [tab, setTab] = useState<HelpModalType>(currentTab)

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (modalContent == null) {
        return
      }
      if (isFocusLeftSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(menuRef.current)
        return
      }

      if (isFocusRightSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(contentSideRef.current)
        return
      }
    }
  }, [modalContent, menuRef, contentSideRef])
  useCapturingGlobalKeyDownHandler(keydownHandler)
  useUpDownNavigationListener(menuRef, { inactive: closed })

  const content = useMemo(() => {
    switch (tab) {
      case 'calendly':
        return <ScheduleSessionModal />
      case 'customblock':
        return <CustomBlocksModal />
      case 'request':
        return <AppFeedbackTab />
      case 'shortcut':
        return <CheatSheetModal />
      default:
        return
    }
  }, [tab])

  useEffect(() => {
    if (modalContent == null) {
      return
    }
    focusFirstChildFromElement(contentSideRef.current)
  }, [modalContent, contentSideRef])

  if (closed) {
    return null
  }

  return (
    <>
      <StyledSideNavModal>
        <TabNav ref={menuRef}>
          <HelpModalNavButton
            label='Schedule a video session'
            active={tab === 'calendly'}
            tab='calendly'
            id='help-modal-schedule-btn'
            onClickHandler={setTab}
          />
          <HelpModalNavButton
            label='How to use Custom Blocks'
            active={tab === 'customblock'}
            tab='customblock'
            id='help-modal-customblock-btn'
            onClickHandler={setTab}
          />
          <HelpModalNavButton
            label='Shortcut Key'
            active={tab === 'shortcut'}
            tab='shortcut'
            id='help-modal-shortcut-btn'
            onClickHandler={setTab}
          />
          <HelpModalNavButton
            label='Send feedback'
            active={tab === 'request'}
            tab='request'
            id='help-modal-feedback-btn'
            onClickHandler={setTab}
          />
          <hr />
        </TabNav>
      </StyledSideNavModal>
      <DividerBorder />
      <TabContent ref={contentSideRef}>{content}</TabContent>
    </>
  )
}

const TabNav = styled.nav`
  width: 250px;
  padding: 0;
  overflow: hidden auto;
  margin-right: 0;
  margin-bottom: 0;
  padding: ${({ theme }) => theme.space.xsmall}px 0;

  hr {
    height: 1px;
    background-color: ${({ theme }) => theme.baseBorderColor};
    border: none;
    margin: ${({ theme }) => theme.space.small}px 0;
  }
`
const TabContent = styled.div`
  flex: 1;
  overflow: hidden auto;
  position: relative;
`

const DividerBorder = styled.div`
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) => theme.baseBorderColor};
`

export default HelpModal
