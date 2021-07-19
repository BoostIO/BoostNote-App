import React, { useMemo, useState } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import styled from '../../../shared/lib/styled'
import { useOnboarding } from '../../lib/stores/onboarding'
import IconMdi from './IconMdi'
import { mdiAlertOutline, mdiClose } from '@mdi/js'
import { useGlobalData } from '../../lib/stores/globalData'
import { PageStoreWithTeam } from '../../interfaces/pageStore'
import UpgradeButton from '../UpgradeButton'
import {
  getCurrentDesktopAppVersion,
  useElectron,
  usingLegacyElectron,
} from '../../lib/stores/electron'

const AnnouncementAlert = () => {
  const { currentSubInfo } = usePage()
  const { currentOnboardingState, setOnboarding } = useOnboarding()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const { permissions = [] } = usePage<PageStoreWithTeam>()
  const [
    hidingOutdatedDesktopClientAlert,
    setHidingOutdatedDesktopClientAlert,
  ] = useState(false)
  const { usingElectron } = useElectron()

  const currentUserPermissions = useMemo(() => {
    try {
      return permissions.filter(
        (permission) => permission.user.id === currentUser!.id
      )[0]
    } catch (error) {
      return undefined
    }
  }, [currentUser, permissions])

  if (
    usingElectron &&
    usingLegacyElectron &&
    !hidingOutdatedDesktopClientAlert
  ) {
    const currentDesktopAppVersion = getCurrentDesktopAppVersion()
    return (
      <Container>
        <div className='alert'>
          <span className='alert__icon'>
            <IconMdi path={mdiAlertOutline} size={21} />
          </span>
          <p className='alert__text'>
            Please update the desktop app. This version is outdated (current
            version: {currentDesktopAppVersion}, required version: &gt;=0.20.0).
          </p>
          <button
            className='alert__btn--close'
            onClick={() => setHidingOutdatedDesktopClientAlert(true)}
          >
            <IconMdi path={mdiClose} size={18} />
          </button>
        </div>
      </Container>
    )
  }

  if (
    currentOnboardingState != null &&
    currentOnboardingState.trialAnnouncement
  ) {
    return (
      <Container>
        <div className='alert'>
          <span className='alert__icon'>
            <IconMdi path={mdiAlertOutline} size={21} />
          </span>
          <p className='alert__text'>
            We&apos;ve changed the free plan. Please see
            <div
              onClick={() => setOnboarding({ trialAnnouncement: false })}
              className='alert__text__link'
            >
              <a
                href='https://intercom.help/boostnote-for-teams/en/articles/4613950-announcement'
                target='_blank'
                rel='noreferrer noopener'
              >
                the announcement
              </a>
            </div>
            .
          </p>
          <button
            className='alert__btn--close'
            onClick={() => setOnboarding({ trialAnnouncement: false })}
          >
            <IconMdi path={mdiClose} size={18} />
          </button>
        </div>
      </Container>
    )
  }

  if (currentSubInfo == null || currentSubInfo.trialing) {
    return null
  }

  if (currentUserPermissions == null) {
    return null
  }

  if (
    currentSubInfo.info.trialIsOver &&
    currentUserPermissions.role === 'admin'
  ) {
    return (
      <Container>
        <div className='alert'>
          <span className='alert__icon'>
            <IconMdi path={mdiAlertOutline} size={21} />
          </span>
          <p className='alert__text'>
            You are not eligible for a free trial anymore. Please
            <UpgradeButton origin='limit' variant='link' label='Upgrade' />
            now.
          </p>
        </div>
      </Container>
    )
  }

  return null
}

export default AnnouncementAlert

const Container = styled.div`
  position: fixed;
  left: 52px;
  bottom: ${({ theme }) => theme.sizes.spaces.xl}px;
  width: fit-content;
  z-index: 100;

  .alert {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 330px;
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
    background-color: ${({ theme }) => theme.colors.variants.danger.base};
    border-left: 3px solid #ff425e;
    border-radius: 3px;
    color: ${({ theme }) => theme.colors.variants.danger.text};
  }

  .alert__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    color: #ff425e;
  }

  .alert__text {
    margin: 0;
    line-height: 1.6;
  }

  .alert__text__link {
    display: inline-block;

    a {
      margin-left: 3px;
      margin-right: 3px;
      color: ${({ theme }) => theme.colors.variants.danger.text};
      text-decoration: underline;
    }
  }

  .alert__btn--close {
    display: flex;
    align-items: center;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px;
    background: 0;
    color: ${({ theme }) => theme.colors.variants.danger.text};
    opacity: 0.7;
    outline: 0;
    transition: opacity 0.3s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }

  .button__label {
    color: ${({ theme }) => theme.colors.variants.danger.text};
    text-decoration: underline;

    &:hover {
      cursor: pointer;
    }
  }
`
