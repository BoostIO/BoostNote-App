import React, { useCallback, useMemo } from 'react'
import styled from '../../../lib/styled'
import ServiceConnect, { Integration } from '../../atoms/ServiceConnect'
import Spinner from '../../atoms/CustomSpinner'
import {
  useServiceConnections,
  withServiceConnections,
} from '../../../lib/stores/serviceConnections'
import { githubOauthId, boostHubBaseUrl } from '../../../lib/consts'
import { usingElectron } from '../../../lib/stores/electron'
import { openNew } from '../../../lib/utils/platform'
import { usePage } from '../../../lib/stores/pageStore'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'
import Button from '../../../../shared/components/atoms/Button'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'

const GithubIntegrations = () => {
  const connectionState = useServiceConnections()
  const { team } = usePage()
  const { translate } = useI18n()

  const githubConnection = useMemo(() => {
    return connectionState.type !== 'initialising'
      ? connectionState.connections.find((conn) => conn.service === 'github')
      : null
  }, [connectionState])

  const removeGithubConnection = useCallback(() => {
    if (connectionState.type !== 'initialising' && githubConnection != null) {
      connectionState.actions.removeConnection(githubConnection)
    }
  }, [githubConnection, connectionState])

  const addConnection = useCallback(
    (integration: Integration) => {
      if (
        connectionState.type !== 'initialising' &&
        integration.type === 'user'
      ) {
        connectionState.actions.addConnection(integration.integration)
      }
    },
    [connectionState]
  )

  return (
    <SettingTabContent
      title='GitHub'
      body={
        <StyledGithubIntegration>
          <div className='integration__description'>
            <h3>How does it work?</h3>
            <p>
              Embed the issues and pull requests in GitHub private repository
              into Boost Note documents
            </p>
          </div>
          <div className='integration__connect'>
            <div className='integration__connect__info'>
              <img src='/app/static/logos/github.png' alt='GitHub' />
              <p>Connect Boost Note with GitHub private repository</p>
            </div>
            {(connectionState.type === 'initialising' ||
              connectionState.type === 'working') && (
              <Button variant='secondary' className='item-btn'>
                <Spinner />
              </Button>
            )}
            {connectionState.type === 'initialised' && (
              <>
                {githubConnection == null ? (
                  usingElectron ? (
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
                      service='github'
                      onConnect={addConnection}
                    >
                      {translate(lngKeys.GeneralEnableVerb)}
                    </ServiceConnect>
                  )
                ) : (
                  <Button
                    variant='danger'
                    className='item-btn'
                    onClick={removeGithubConnection}
                  >
                    {translate(lngKeys.GeneralDisableVerb)}
                  </Button>
                )}
              </>
            )}
          </div>
          <div className='integration__connect__meta'>
            <div>
              Manage access via GitHub{' '}
              <a
                target='_blank'
                rel='noreferrer noopener'
                href={`https://github.com/settings/connections/applications/${githubOauthId}`}
              >
                here
              </a>
            </div>
          </div>
        </StyledGithubIntegration>
      }
    />
  )
}

const StyledGithubIntegration = styled.div`
  & .integration__connect {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => theme.space.small}px;
    background-color: ${({ theme }) => theme.baseBackgroundColor};
    border: 1px solid ${({ theme }) => theme.baseBorderColor};

    & .integration__connect__info {
      display: flex;
      align-items: center;
    }
    img {
      height: 30px;
      margin-right: ${({ theme }) => theme.space.small}px;
    }

    p {
      margin: 0;
    }
  }

  & .integration__connect__meta {
    display: flex;
    justify-content: flex-end;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    margin-top: ${({ theme }) => theme.space.xsmall}px;
    color: ${({ theme }) => theme.subtleTextColor};
    a {
      color: ${({ theme }) => theme.primaryTextColor};
      text-decoration: underline;

      &:hover,
      &:focus {
        text-decoration: none;
      }
    }
  }

  .integration__description {
    padding: ${({ theme }) => theme.space.default}px 0;

    p {
      color: ${({ theme }) => theme.subtleTextColor};
    }
  }
`

export default withServiceConnections(GithubIntegrations)
