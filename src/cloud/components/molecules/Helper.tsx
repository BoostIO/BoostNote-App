import React, { useState, useRef, useEffect, useCallback } from 'react'
import styled from '../../lib/styled'
import Icon from '../atoms/Icon'
import {
  mdiHelp,
  mdiBookOpenOutline,
  mdiChatProcessingOutline,
  mdiHeartOutline,
  mdiChevronDown,
  mdiKeyboardOutline,
} from '@mdi/js'
import { useContextMenuKeydownHandler } from '../../lib/keyboard'
import { baseShadowColor } from '../../lib/styled/styleFunctions'
import { useModal } from '../../lib/stores/modal'
import FeedbackModal from '../organisms/Modal/contents/FeedbackModal'
import cc from 'classcat'
import { useGlobalData } from '../../lib/stores/globalData'
import { focusFirstChildFromElement, isChildNode } from '../../lib/dom'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import { trackEvent } from '../../api/track'
import { intercomAppId } from '../../lib/consts'
import { useRouter } from '../../lib/router'

const forbiddenRoutes = [
  '\\/cooperate',
  '\\/settings',
  '\\/settings\\/use',
  '\\/[A-z0-9]+\\/invites',
]

const Helper = () => {
  const [showHelp, setShowHelp] = useState(false)
  const helperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { openModal } = useModal()
  const { pathname } = useRouter()
  const {
    globalData: { currentUser },
  } = useGlobalData()

  useEffect(() => {
    if (showHelp && listRef.current != null) {
      focusFirstChildFromElement(listRef.current)
    }
  }, [showHelp])

  const closeIfBlurred = (event: React.FocusEvent<HTMLDivElement>) => {
    if (
      !isChildNode(helperRef.current, event.relatedTarget as HTMLElement | null)
    ) {
      setShowHelp(false)
    }
  }

  const toggleHelper = useCallback(() => {
    if (!showHelp) {
      trackEvent(MixpanelActionTrackTypes.HelpOpen)
    }

    setShowHelp((prev) => !prev)
  }, [showHelp])

  useContextMenuKeydownHandler(helperRef)

  if (
    currentUser == null ||
    new RegExp(forbiddenRoutes.join('|'), 'i').test(pathname)
  ) {
    return null
  }

  return (
    <Container ref={helperRef}>
      {showHelp && (
        <div className='help__list' ref={listRef} onBlur={closeIfBlurred}>
          <a
            className='help__list__item'
            href='https://intercom.help/boostnote-for-teams/en/'
            target='_blank'
            rel='noreferrer noopener'
            id='helper-guide'
          >
            <Icon path={mdiBookOpenOutline} className='icon' />
            <span>Help &amp; support guide</span>
          </a>
          {intercomAppId != null && (
            <button className='help__list__item' id='helper-message'>
              <Icon path={mdiChatProcessingOutline} className='icon' />
              <span>Send us a message</span>
            </button>
          )}
          <a
            className='help__list__item'
            id='helper-feedback'
            href='#'
            onClick={(event) => {
              event.preventDefault()
              openModal(<FeedbackModal />, {
                classNames: 'largeW fixed-height-large',
              })
            }}
          >
            <Icon path={mdiHeartOutline} className='icon' />
            <span>Feedback</span>
          </a>
          <a
            className='help__list__item'
            href='https://intercom.help/boostnote-for-teams/en/articles/4347206-keyboard-shortcuts'
            target='_blank'
            rel='noopener noreferrer'
            id='helper-shortcuts'
          >
            <Icon path={mdiKeyboardOutline} className='icon' />
            <span>Keyboard Shortcuts</span>
          </a>
        </div>
      )}
      <div
        className={cc(['pastille', showHelp && 'active'])}
        tabIndex={-1}
        onClick={toggleHelper}
      >
        <Icon size={18} path={showHelp ? mdiChevronDown : mdiHelp} />
      </div>
    </Container>
  )
}

const Container = styled.div`
  .help__list {
    position: fixed;
    bottom: 90px;
    right: 20px;
    padding: ${({ theme }) => theme.space.xsmall}px;
    background: ${({ theme }) => theme.baseBackgroundColor};
    ${baseShadowColor};
  }

  .help__list__item {
    display: flex;
    font-size: 14px;
    height: 28px;
    width: 100%;
    background: none;
    border: none;
    text-decoration: none;
    align-items: center;
    color: ${({ theme }) => theme.baseTextColor};
    padding: 0 ${({ theme }) => theme.space.xxsmall}px;
    border-radius: 3px;

    &:hover {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
    }

    &:focus,
    &:hover {
      color: ${({ theme }) => theme.emphasizedTextColor};
    }

    .icon {
      flex: 0 0 auto;
      margin-right: ${({ theme }) => theme.space.xxsmall}px;
    }
  }

  .pastille {
    position: fixed;
    border-radius: 50%;
    right: 20px;
    bottom: 30px;
    width: 40px;
    height: 40px;
    cursor: pointer;
    transition: 0.1s;
    background-color: ${({ theme }) => theme.helperBackgroundColor};

    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      background-color: ${({ theme }) => theme.secondaryBackgroundColor};
    }

    svg {
      color: ${({ theme }) => theme.baseTextColor};
    }
  }
`

export default Helper
