import React, { useCallback, useMemo } from 'react'
import Button from '../../../design/components/atoms/Button'
import Spinner from '../../../design/components/atoms/Spinner'
import { useTeamIntegrations } from '../../../design/lib/stores/integrations'
import styled from '../../../design/lib/styled'
import { boostHubBaseUrl } from '../../lib/consts'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { usingElectron } from '../../lib/stores/electron'
import { usePage } from '../../lib/stores/pageStore'
import { openNew } from '../../lib/utils/platform'
import ServiceConnect, { Integration } from '../ServiceConnect'

interface IntegrationManagerProps {
  service: string
  icon: string
  name: string
}

const IntegrationManager = ({
  service,
  icon,
  name,
  children,
}: React.PropsWithChildren<IntegrationManagerProps>) => {
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

  const integrations = useMemo(() => {
    if (integrationState.type === 'initialising') {
      return []
    }

    return integrationState.integrations.filter(
      (integration) => integration.service === service
    )
  }, [integrationState, service])

  return (
    <StyledIntegrationManager>
      <div className='integration__description'>{children}</div>
      <div className='integration__content'>
        <div className='integration__connect'>
          <div className='integration__connect__info'>
            <img src={icon} alt={name} />
            <p>Connect Boost Note with {name}</p>
          </div>
          {(integrationState.type === 'initialising' ||
            integrationState.type === 'working') && (
            <Button variant='secondary' className='item-btn'>
              <Spinner />
            </Button>
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
                service={service}
                team={team}
                onConnect={addIntegration}
              >
                {translate(lngKeys.GeneralAddVerb)}
              </ServiceConnect>
            ))}
        </div>
        {integrationState.type !== 'initialising' && (
          <>
            {integrations.length > 0 && <h3>Connected Teams:</h3>}
            {integrations.map((integration) => (
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
    </StyledIntegrationManager>
  )
}

const StyledIntegrationManager = styled.div`
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
      color: ${({ theme }) => theme.colors.text.primary};
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

export default IntegrationManager
