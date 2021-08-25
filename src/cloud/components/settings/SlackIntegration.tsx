import React, { useCallback, useMemo } from 'react'
import ServiceConnect, { Integration } from '../ServiceConnect'
import { boostHubBaseUrl } from '../../lib/consts'
import { usingElectron } from '../../lib/stores/electron'
import { openNew } from '../../lib/utils/platform'
import { usePage } from '../../lib/stores/pageStore'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { useTeamIntegrations } from '../../../design/lib/stores/integrations'
import styled from '../../../design/lib/styled'

const SlackIntegration = () => {
  const integrationState = useTeamIntegrations()
  const { team } = usePage()
  const { translate } = useI18n()

  const addIntegration = useCallback(
    (integration: Integration) => {
      if (
        integrationState.type !== 'initialising' &&
        integration.type === 'team'
      ) {
        integrationState.actions.addIntegration(integration.integration)
      }
    },
    [integrationState]
  )

  const slackIntegrations = useMemo(() => {
    if (integrationState.type === 'initialising') {
      return []
    }

    return integrationState.integrations.filter(
      (integration) => integration.service === 'slack:team'
    )
  }, [integrationState])

  return (
    <SettingTabContent
      title='Slack'
      body={
        <StyledGithubIntegration>
          <div className='integration__description'>
            <h3>How does it work?</h3>
            <p>Show Boost Note document preview in Slack</p>
          </div>
          <div className='integration__content'>
            <div className='integration__connect'>
              <div className='integration__connect__info'>
                <img src='/app/static/logos/slack.png' alt='GitHub' />
                <p>Connect Boost Note with Slack</p>
              </div>
              {(integrationState.type === 'initialising' ||
                integrationState.type === 'working') && (
                <LoadingButton
                  spinning={true}
                  variant='secondary'
                  className='item-btn'
                />
              )}
              {integrationState.type === 'initialised' &&
                (usingElectron ? (
                  <Button
                    variant='secondary'
                    onClick={() => {
                      openNew(`${boostHubBaseUrl}/${team?.domain}`)
                    }}
                  >
                    {translate(lngKeys.ExternalEntityOpenInBrowser)}
                  </Button>
                ) : (
                  <ServiceConnect
                    variant='secondary'
                    className='item-btn'
                    service='slack:team'
                    team={team}
                    onConnect={addIntegration}
                  >
                    {translate(lngKeys.GeneralAddVerb)}
                  </ServiceConnect>
                ))}
            </div>
            {integrationState.type !== 'initialising' && (
              <>
                {slackIntegrations.length > 0 && <h3>Connected Teams:</h3>}
                {slackIntegrations.map((integration) => (
                  <div className='integration__list__item' key={integration.id}>
                    <h3>{integration.name}</h3>

                    <Button
                      variant='danger'
                      onClick={() => {
                        integrationState.actions.removeIntegration(integration)
                      }}
                    >
                      {translate(lngKeys.GeneralRemoveVerb)}
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>
        </StyledGithubIntegration>
      }
    />
  )
}

const StyledGithubIntegration = styled.div`
  & .integration__content {
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  & .integration__list__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  & .integration__connect {
    display: flex;
    align-items: center;
    justify-content: space-between;

    & .integration__connect__info {
      display: flex;
      align-items: center;
    }
    img {
      height: 30px;
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    p {
      margin: 0;
    }
  }

  & .integration__connect__meta {
    display: flex;
    justify-content: flex-end;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
    a {
      color: ${({ theme }) => theme.colors.text.link};
      text-decoration: underline;

      &:hover,
      &:focus {
        text-decoration: none;
      }
    }
  }

  .integration__description {
    padding: ${({ theme }) => theme.sizes.spaces.df}px 0;

    h3 {
      margin-top: 0;
    }

    p {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }
`

export default SlackIntegration
