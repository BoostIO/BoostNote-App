import React, { useMemo, useState } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import styled from '../../../shared/lib/styled'
import { useOnboarding } from '../../lib/stores/onboarding'
import IconMdi from './IconMdi'
import {
  mdiAlertOutline,
  mdiClose,
  mdiInformationOutline,
  mdiOpenInNew,
} from '@mdi/js'
import { useGlobalData } from '../../lib/stores/globalData'
import { PageStoreWithTeam } from '../../interfaces/pageStore'
import {
  getCurrentDesktopAppVersion,
  useElectron,
  usingLegacyElectron,
} from '../../lib/stores/electron'
import { ExternalLink } from '../../../shared/components/atoms/Link'
import Button from '../../../shared/components/atoms/Button'
import { useSettings } from '../../lib/stores/settings'
import { useModal } from '../../../shared/lib/stores/modal'
import ButtonGroup from '../../../shared/components/atoms/ButtonGroup'
import { useTeamStorage } from '../../lib/stores/teamStorage'
import { freePlanMembersLimit } from '../../lib/subscription'

const AnnouncementAlert = () => {
  const { currentSubInfo } = usePage()
  const { currentOnboardingState, setOnboarding } = useOnboarding()
  const { closeAllModals } = useModal()
  const { openSettingsTab } = useSettings()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const { permissions = [] } = usePage<PageStoreWithTeam>()
  const { teamPreferences, setToLocalStorage } = useTeamStorage()
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

  if (currentUserPermissions.role === 'admin') {
    if (
      permissions.filter((p) => p.role !== 'viewer').length >
      freePlanMembersLimit
    ) {
      return (
        <Container>
          <div className='alert alert--danger'>
            <span className='alert__icon'>
              <IconMdi path={mdiAlertOutline} size={21} />
            </span>
            <div className='alert__text'>
              <p>
                {currentSubInfo.info.trialIsOver
                  ? `Your subscription has expired and your current team exceeds the
                free plan's capacity. Please upgrade your plan.`
                  : `Your current team permissions exceed the free plan's capacity. Please consider upgrading your plan.`}
              </p>
              <p>
                If you wish to continue for free, you can also demote your other
                members to a{' '}
                <ExternalLink
                  href='https://intercom.help/boostnote-for-teams/en/articles/4354888-roles'
                  className='alert__link'
                >
                  <span>Viewer</span> <IconMdi path={mdiOpenInNew} />
                </ExternalLink>{' '}
                role.
              </p>
              <ButtonGroup className='alert__footer' layout='spread'>
                <Button
                  variant='bordered'
                  onClick={() => {
                    closeAllModals()
                    openSettingsTab('teamUpgrade')
                  }}
                >
                  Upgrade now
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    closeAllModals()
                    openSettingsTab('teamMembers')
                  }}
                >
                  Demote to Viewer
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </Container>
      )
    } else if (
      currentSubInfo.info.trialIsOver &&
      teamPreferences.showTrialAlert
    ) {
      return (
        <Container>
          <div className='alert alert--danger'>
            <span className='alert__icon'>
              <IconMdi path={mdiAlertOutline} size={21} />
            </span>
            <div className='alert__text'>
              <p>
                You are not eligible for a free trial anymore. Please upgrade
                your plan.
              </p>

              {permissions.filter((p) => p.role !== 'viewer').length >= 1 && (
                <p>
                  You can continue for free if you demote your other members to
                  a{' '}
                  <ExternalLink
                    href='https://intercom.help/boostnote-for-teams/en/articles/4354888-roles'
                    className='alert__link'
                  >
                    <span>Viewer</span> <IconMdi path={mdiOpenInNew} />
                  </ExternalLink>{' '}
                  role.
                </p>
              )}
              <ButtonGroup className='alert__footer' layout='spread'>
                <Button
                  variant='bordered'
                  onClick={() => {
                    closeAllModals()
                    openSettingsTab('teamUpgrade')
                  }}
                >
                  Upgrade now
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    const newPreferences = Object.assign({}, teamPreferences)
                    delete newPreferences.showTrialAlert
                    setToLocalStorage(
                      currentUserPermissions.teamId,
                      newPreferences
                    )
                  }}
                >
                  Continue with the free plan
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </Container>
      )
    }
  }

  if (
    currentUserPermissions.role === 'admin' &&
    permissions.filter((p) => p.role === 'viewer').length > 0 &&
    teamPreferences.showRoleUpgradeAlert
  ) {
    return (
      <Container>
        <div className='alert alert--info'>
          <span className='alert__icon'>
            <IconMdi path={mdiInformationOutline} size={21} />
          </span>
          <div className='alert__text'>
            <p>
              Some
              <ExternalLink
                href='https://intercom.help/boostnote-for-teams/en/articles/4354888-roles'
                className='alert__link'
              >
                <span>Viewers</span> <IconMdi path={mdiOpenInNew} />
              </ExternalLink>{' '}
              have joined your space.
            </p>

            <p>
              You will have to upgrade your plan if you wish to let them
              participate actively.
            </p>
            <ButtonGroup className='alert__footer' layout='spread'>
              <Button
                variant='bordered'
                onClick={() => {
                  closeAllModals()
                  openSettingsTab('teamUpgrade')
                }}
              >
                Upgrade now
              </Button>
              <Button
                variant='secondary'
                onClick={() => {
                  const newPreferences = Object.assign({}, teamPreferences)
                  delete newPreferences.showRoleUpgradeAlert
                  setToLocalStorage(
                    currentUserPermissions.teamId,
                    newPreferences
                  )
                }}
              >
                Continue with the free plan
              </Button>
            </ButtonGroup>
          </div>
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

  .alert__link {
    font-weight: bold;
  }

  .alert.alert--danger {
    background-color: ${({ theme }) => theme.colors.variants.danger.base};
    color: ${({ theme }) => theme.colors.variants.danger.text};
    border-left: 3px solid #ff425e;

    .alert__icon {
      color: #ff425e;
    }

    .alert__text__link a,
    .alert__btn--close,
    .button__label {
      color: ${({ theme }) => theme.colors.variants.danger.text};
    }

    .button__variant--bordered {
      border-color: ${({ theme }) => theme.colors.variants.danger.text};
      &:hover {
        background-color: ${({ theme }) => theme.colors.variants.danger.text};
        .button__label {
          color: #333;
        }
      }
    }

    .button__variant--secondary {
      background-color: rgba(255, 255, 255, 0.2);
      &:hover {
        background-color: ${({ theme }) => theme.colors.variants.danger.text};
        .button__label {
          color: #333;
        }
      }
    }
  }

  .alert.alert--info {
    background-color: ${({ theme }) => theme.colors.variants.primary.base};
    color: ${({ theme }) => theme.colors.variants.primary.text};
    border-left: 3px solid #0089df;

    .alert__icon {
      color: #0089df;
    }

    .alert__text__link a,
    .alert__btn--close,
    .button__label {
      color: ${({ theme }) => theme.colors.variants.primary.text};
    }

    .button__variant--bordered {
      border-color: ${({ theme }) => theme.colors.variants.primary.text};
      &:hover {
        background-color: ${({ theme }) => theme.colors.variants.primary.text};
        .button__label {
          color: #333;
        }
      }
    }

    .button__variant--secondary {
      background-color: rgba(255, 255, 255, 0.2);
      &:hover {
        background-color: ${({ theme }) => theme.colors.variants.primary.text};
        .button__label {
          color: #333;
        }
      }
    }
  }

  .alert {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 400px;
    max-width: 90vw;
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
    border-radius: 3px;
  }

  .alert__footer {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    button .button__label {
      text-decoration: none;
    }
  }

  .alert__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .alert__text {
    margin: 0;
    line-height: 1.6;

    .alert__link {
      display: inline-flex;
      align-items: center;
    }
    p {
      margin: 0;
    }

    p + p {
      margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    a {
      color: inherit;
    }
  }

  .alert__text__link {
    display: inline-block;

    a {
      margin-left: 3px;
      margin-right: 3px;
      text-decoration: underline;
    }
  }

  .alert__btn--close {
    display: flex;
    align-items: center;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px;
    background: 0;
    opacity: 0.7;
    outline: 0;
    transition: opacity 0.3s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }

  .button__label {
    text-decoration: underline;
  }
`
