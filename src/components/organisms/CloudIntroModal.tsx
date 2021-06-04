import React, {
  useCallback,
  useState,
  KeyboardEvent,
  useRef,
  useEffect,
} from 'react'
import Image from '../atoms/Image'
import {
  mdiAccountPlus,
  mdiHistory,
  mdiAccount,
  mdiAccountGroup,
  mdiClose,
  mdiTransitConnectionVariant,
  mdiLinkPlus,
  mdiConnection,
} from '@mdi/js'
import { openNew } from '../../lib/platform'
import { boostHubLearnMorePageUrl } from '../../lib/boosthub'
import cc from 'classcat'
import { FormPrimaryButton, FormSecondaryButton } from '../atoms/form'
import { usePreferences } from '../../lib/preferences'
import { useRouter } from '../../lib/router'
import { useCloudIntroModal } from '../../lib/cloudIntroModal'
import { useGeneralStatus } from '../../lib/generalStatus'
import styled from '../../shared/lib/styled'
import {
  closeIconColor,
  border,
  flexCenter,
} from '../../shared/lib/styled/styleFunctions'
import Icon from '../../shared/components/atoms/Icon'
import Button from '../../shared/components/atoms/Button'

const CloudIntroModal = () => {
  const { preferences, openTab } = usePreferences()
  const { generalStatus } = useGeneralStatus()
  const cloudSpaces = generalStatus.boostHubTeams
  const userInfo = preferences['cloud.user']
  const { push } = useRouter()
  const openLearnMorePage = useCallback(() => {
    openNew(boostHubLearnMorePageUrl)
  }, [])
  const { toggleShowingCloudIntroModal } = useCloudIntroModal()

  const [activeTab, setActiveTab] = useState<'team' | 'personal'>('team')

  const navigateToCreateSpacePageOrLogIn = useCallback(() => {
    if (userInfo == null) {
      push('/app/boosthub/login')
    } else {
      push('/app/boosthub/teams')
    }
    toggleShowingCloudIntroModal()
  }, [userInfo, push, toggleShowingCloudIntroModal])

  const [
    showingDisabledMigrationTooltip,
    setShowingDisabledMigrationTooltip,
  ] = useState(false)

  const showDisabledMigrationTooltip = useCallback(() => {
    setShowingDisabledMigrationTooltip(true)
  }, [])
  const hideDisabledMigrationTooltip = useCallback(() => {
    setShowingDisabledMigrationTooltip(false)
  }, [])

  const handleEscKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          toggleShowingCloudIntroModal()
          return
      }
    },
    [toggleShowingCloudIntroModal]
  )

  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (containerRef.current == null) {
      return
    }
    containerRef.current.focus()
  })

  return (
    <FullScreenContainer
      ref={containerRef}
      tabIndex={-1}
      onKeyDown={handleEscKeyDown}
    >
      <BackgroundShadow onClick={toggleShowingCloudIntroModal} />
      <Container>
        <CloseButton onClick={toggleShowingCloudIntroModal}>
          <Icon path={mdiClose} />
        </CloseButton>
        <div className='content'>
          <h1 className='title'>Introducing Cloud Space</h1>
          <h4 className='title'>
            Migrate data to Cloud space and earn a 1 month coupon!
          </h4>
          <div className='switch'>
            <div className='switch__group'>
              <Button
                variant={'icon-secondary'}
                className={cc([
                  'switch__button',
                  activeTab === 'team' && 'active',
                ])}
                onClick={() => {
                  setActiveTab('team')
                }}
                iconPath={mdiAccountGroup}
                iconSize={20}
              >
                {/*<Icon className='switch__button__icon' path={mdiAccountGroup} />*/}
                With My Team
              </Button>
              <button
                className={cc([
                  'switch__button',
                  activeTab === 'personal' && 'active',
                ])}
                onClick={() => {
                  setActiveTab('personal')
                }}
              >
                <Icon className='switch__button__icon' path={mdiAccount} />
                For Myself
              </button>
            </div>
          </div>
          <IntroContainer>
            {activeTab === 'team' ? (
              <ul className='featureList'>
                <li className='featureListItem'>
                  <div className='featureListItemIcon'>
                    <Icon path={mdiAccountPlus} />
                  </div>
                  <div className='featureListItemBody'>
                    <h2>Real-time Coauthoring</h2>
                    <p>
                      You can edit markdown documents with your colleagues
                      synchronously
                    </p>
                  </div>
                </li>
                <li className='featureListItem'>
                  <div className='featureListItemIcon'>
                    <Icon path={mdiTransitConnectionVariant} />
                  </div>
                  <div className='featureListItemBody'>
                    <h2>2000 Tools Integration</h2>
                    <p>
                      Integrate your cloud space with other productivity tools
                      and automate your workflow.
                    </p>
                  </div>
                </li>
                <li className='featureLearnMoreItem'>
                  <a onClick={openLearnMorePage}>Learn more</a>
                </li>
              </ul>
            ) : (
              <ul className='featureList'>
                <li className='featureListItem'>
                  <div className='featureListItemIcon'>
                    <Icon path={mdiHistory} />
                  </div>
                  <div className='featureListItemBody'>
                    <h2>Revision History</h2>
                    <p>
                      Every change of a document will be saved and accessible
                      without time expiry.
                    </p>
                  </div>
                </li>
                <li className='featureListItem'>
                  <div className='featureListItemIcon'>
                    <Icon path={mdiLinkPlus} />
                  </div>
                  <div className='featureListItemBody'>
                    <h2>Public Document Sharing</h2>
                    <p>
                      Share your document via public url. You can also set
                      password and expiration date for the url.
                    </p>
                  </div>
                </li>
                <li className='featureListItem'>
                  <div className='featureListItemIcon'>
                    <Icon path={mdiConnection} />
                  </div>
                  <div className='featureListItemBody'>
                    <h2>Public APIs</h2>
                    <p>
                      Manage documents in a cloud space via HTTP APIs. Most of
                      manipulations are available from the APIs so you can make
                      your own custom app on top of the cloud space.
                    </p>
                  </div>
                </li>
                <li className='featureLearnMoreItem'>
                  <a onClick={openLearnMorePage}>Learn more</a>
                </li>
              </ul>
            )}
            <div className='screenShot'>
              <Image src='/app/static/img_ui_no-annotation.jpg' />
            </div>
          </IntroContainer>
          <div className='form-group'>
            {cloudSpaces.length === 0 && (
              <FormPrimaryButton onClick={navigateToCreateSpacePageOrLogIn}>
                Get Started
              </FormPrimaryButton>
            )}
            <FormSecondaryButton
              className={cc([userInfo == null && 'disabled'])}
              onClick={() => {
                openTab('migration')
                toggleShowingCloudIntroModal()
              }}
              onMouseEnter={showDisabledMigrationTooltip}
              onMouseLeave={hideDisabledMigrationTooltip}
            >
              Migrate this local space to your cloud space
            </FormSecondaryButton>
          </div>
          <div className='disabled-tooltip'>
            {userInfo == null && showingDisabledMigrationTooltip && (
              <p className='disabled-tooltip__content'>
                ⚠️ You need to create a cloud space account.
              </p>
            )}
          </div>
        </div>
      </Container>
    </FullScreenContainer>
  )
}
export default CloudIntroModal

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background.primary};
  height: 100%;
  position: fixed;
  top: 0;
  left: 40px;
  bottom: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  align-items: center;

  .content {
    justify-content: center;
    overflow-y: auto;
    padding: 30px;
    height: 100%;
  }
  .title {
    text-align: center;
    margin-top: 0;
  }

  .switch {
    display: flex;
    justify-content: center;
    margin-bottom: 15px;
    .switch__group {
      border-radius: 4px;
      background-color: ${({ theme }) => theme.colors.background.quaternary};
      padding: 5px 5px;
    }
    .switch__button {
      width: 160px;
      background-color: transparent;
      border: none;
      cursor: pointer;
      color: ${({ theme }) => theme.colors.text.secondary};
      padding: 5px 10px;
      border-radius: 4px;
      &.active {
        background-color: ${({ theme }) => theme.colors.background.tertiary};
      }
    }
    .switch__button__icon {
      margin-right: 4px;
    }
  }

  .form-group {
    display: flex;
    justify-content: center;
    margin-bottom: 5px;
  }

  .disabled-tooltip {
    display: flex;
    justify-content: center;
    height: 30px;
  }
  .disabled-tooltip__content {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.primary};
    padding: 5px;
    border-radius: 4px;
    margin: 0;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: none;
  font-size: 24px;
  ${flexCenter}
  ${closeIconColor}
`
const IntroContainer = styled.div`
  display: flex;
  padding: 0;
  margin-bottom: 15px;

  .featureList {
    list-style: none;
    width: 300px;
    margin: 0 20px 0 0;
    padding: 0;
    & > .featureLearnMoreItem {
      text-align: right;
      color: ${({ theme }) => theme.colors.text.primary};
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .featureList > .featureListItem {
    ${border};
    display: flex;
    margin-bottom: 20px;
    border-radius: 5px;
    padding: 10px 5px 10px 10px;
    background-color: ${({ theme }) => theme.colors.background.secondary};

    & > .featureListItemIcon {
      ${flexCenter};
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    & > .featureListItemBody {
      margin-left: 7px;

      & > h2 {
        font-size: 18px;
        margin-top: 0;
        margin-bottom: 10px;
      }

      & > p {
        font-size: 14px;
        margin: 0;
      }
    }
  }

  .screenShot {
    flex: 1;

    img {
      width: 100%;
      ${border};
      border-radius: 5px;
    }
  }
`

const FullScreenContainer = styled.div`
  z-index: 7000;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const BackgroundShadow = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  ${border}
`
