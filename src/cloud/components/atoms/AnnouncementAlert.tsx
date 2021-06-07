import React, { useMemo, useState } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import styled from '../../../shared/lib/styled'
import { useOnboarding } from '../../lib/stores/onboarding'
import IconMdi from './IconMdi'
import { mdiAlertOutline, mdiClose } from '@mdi/js'
import { useGlobalData } from '../../lib/stores/globalData'
import { PageStoreWithTeam } from '../../interfaces/pageStore'
import UpgradeButton from '../UpgradeButton'
import ltSemver from 'semver/functions/lt'
import {
  usingElectron,
  getCurrentDesktopAppVersion,
} from '../../lib/stores/electron'
import UpgradeIntroButton from '../UpgradeIntroButton'

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

  const currentUserPermissions = useMemo(() => {
    try {
      return permissions.filter(
        (permission) => permission.user.id === currentUser!.id
      )[0]
    } catch (error) {
      return undefined
    }
  }, [currentUser, permissions])
  const currentDesktopAppVersion = getCurrentDesktopAppVersion()

  if (
    usingElectron &&
    currentDesktopAppVersion != null &&
    ltSemver(currentDesktopAppVersion, '0.16.0') &&
    !hidingOutdatedDesktopClientAlert
  ) {
    return (
      <StyledAnnouncementAlertWrapper className='centered'>
        <StyledAnnouncementAlert className='banner'>
          <p>
            Please update the desktop app. This version is outdated (current
            version: {currentDesktopAppVersion}, required version: &gt;=0.16.0).
          </p>
          <StyledAnnouncementAlertButton
            onClick={() => setHidingOutdatedDesktopClientAlert(true)}
          >
            <IconMdi path={mdiClose} />
          </StyledAnnouncementAlertButton>
        </StyledAnnouncementAlert>
      </StyledAnnouncementAlertWrapper>
    )
  }

  if (
    currentOnboardingState != null &&
    currentOnboardingState.trialAnnouncement
  ) {
    return (
      <StyledAnnouncementAlertWrapper className='centered'>
        <StyledAnnouncementAlert className='banner'>
          <p>
            We&apos;ve changed the free plan. Please see
            <div onClick={() => setOnboarding({ trialAnnouncement: false })}>
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
          <StyledAnnouncementAlertButton
            onClick={() => setOnboarding({ trialAnnouncement: false })}
          >
            <IconMdi path={mdiClose} />
          </StyledAnnouncementAlertButton>
        </StyledAnnouncementAlert>
      </StyledAnnouncementAlertWrapper>
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
      <StyledAnnouncementAlertWrapper className='left'>
        <StyledAnnouncementAlert className='box'>
          <span>
            <IconMdi path={mdiAlertOutline} size={21} />
          </span>
          <p>
            You are not eligible for a free trial anymore. Please
            <UpgradeButton origin='limit' variant='link' label='Upgrade' />
            now.
          </p>
        </StyledAnnouncementAlert>
      </StyledAnnouncementAlertWrapper>
    )
  }

  if (!currentSubInfo.info.overLimit) {
    return null
  }

  return (
    <StyledAnnouncementAlertWrapper className='left'>
      <StyledAnnouncementAlert className='box'>
        <span>
          <IconMdi path={mdiAlertOutline} size={21} />
        </span>
        <p>
          Your number of documents exceeds the capacity of the free plan.
          <UpgradeIntroButton
            origin='limit'
            variant='link'
            label='Start your free trial'
            popupVariant='doc-limit'
          />
          now.
        </p>
      </StyledAnnouncementAlert>
    </StyledAnnouncementAlertWrapper>
  )
}

export default AnnouncementAlert

const StyledAnnouncementAlertWrapper = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.sizes.spaces.xl}px;
  width: fit-content;
  z-index: 100;

  &.centered {
    left: 50%;
    transform: translateX(-50%);
  }

  &.left {
    left: 52px;
  }
`

const StyledAnnouncementAlert = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center
  background-color: ${({ theme }) => theme.colors.variants.danger.base};
  border-radius: 3px;
  color: ${({ theme }) => theme.colors.variants.danger.text};

  div {
    display: inline-block;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }

  a {
    margin-left: 3px;
    margin-right: 3px;
    color: ${({ theme }) => theme.colors.variants.danger.text};
    text-decoration: underline;
  }

  &.banner {
    padding-left: 0 !important;
    padding-right: 0 !important;

    p {
      padding-left: ${({ theme }) => theme.sizes.spaces.df}px;
      padding-right: ${({ theme }) => theme.sizes.spaces.df}px;
    }
  }

  &.box {
    width: 330px;
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
    border-left: 3px solid #FF425E;

    span {
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
      color: #FF425E;
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

const StyledAnnouncementAlertButton = styled.button`
  width: 50px;
  height: 100%;
  background: 0;
  color: ${({ theme }) => theme.colors.variants.danger.text};
  outline: 0;

  &:hover {
    opacity: 0.8;
  }
`
