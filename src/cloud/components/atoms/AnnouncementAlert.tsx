import React, { useMemo, useState } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import styled from '../../lib/styled'
import { useOnboarding } from '../../lib/stores/onboarding'
import IconMdi from './IconMdi'
import { mdiClose } from '@mdi/js'
import { useGlobalData } from '../../lib/stores/globalData'
import { PageStoreWithTeam } from '../../interfaces/pageStore'
import UpgradeButton from '../UpgradeButton'
import ltSemver from 'semver/functions/lt'
import {
  usingElectron,
  getCurrentDesktopAppVersion,
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
    ltSemver(currentDesktopAppVersion, '0.16.1') &&
    !hidingOutdatedDesktopClientAlert
  ) {
    return (
      <StyledAnnouncementAlertWrapper>
        <StyledAnnouncementAlert className='pad-0'>
          <p>
            Please update the desktop app. This version is outdated.(Current
            version: {currentDesktopAppVersion}, Required version: &gt;=0.16.0)
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
      <StyledAnnouncementAlertWrapper>
        <StyledAnnouncementAlert className='pad-0'>
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
      <StyledAnnouncementAlertWrapper>
        <StyledAnnouncementAlert>
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
    <StyledAnnouncementAlertWrapper>
      <StyledAnnouncementAlert>
        <p>
          Your number of documents exceeds the capacity of the free plan.
          <UpgradeButton
            origin='limit'
            variant='link'
            label='Start your free trial'
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
  left: 50%;
  transform: translateX(-50%);
  bottom: 40px;
  width: fit-content;
  z-index: 100;
`

const StyledAnnouncementAlert = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.dangerBackgroundColor};
  color: ${({ theme }) => theme.whiteTextColor};
  border-radius: 3px;
  padding: ${({ theme }) => theme.space.small}px
    ${({ theme }) => theme.space.default}px;
  align-items: center;

  div {
    display: inline-block;
  }

  &.pad-0 {
    padding-left: 0 !important;
    padding-right: 0 !important;
    p {
      padding-left: ${({ theme }) => theme.space.default}px;
      padding-right: ${({ theme }) => theme.space.default}px;
    }
  }

  p {
    margin: 0;
  }

  a {
    text-decoration: underline;
    margin-left: 3px;
    margin-right: 3px;
    color: ${({ theme }) => theme.whiteTextColor};
  }
`

const StyledAnnouncementAlertButton = styled.button`
  outline: 0;
  background: 0;
  height: 100%;
  width: 50px;
  color: ${({ theme }) => theme.whiteTextColor};
  &:hover {
    color: #ccc;
  }
`
