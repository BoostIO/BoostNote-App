import { mdiPlus, mdiTrashCanOutline } from '@mdi/js'
import React, { useCallback, useMemo } from 'react'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Pastille from '../../../design/components/atoms/Pastille'
import Spinner from '../../../design/components/atoms/Spinner'
import WithTooltip from '../../../design/components/atoms/WithTooltip'
import { useTeamInputStreams } from '../../../design/lib/stores/inputStreams'
import { useTeamIntegrations } from '../../../design/lib/stores/integrations'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { SerializedTeamIntegration } from '../../interfaces/db/connections'
import { SerializedSource } from '../../interfaces/db/inputStream'
import { boostHubBaseUrl } from '../../lib/consts'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { usingElectron } from '../../lib/stores/electron'
import { usePage } from '../../lib/stores/pageStore'
import { openNew } from '../../lib/utils/platform'
import InputStreamSourcePickerModal from '../Modal/contents/InputStreamSourcePickerModal/index'
import ServiceConnect, { Integration } from '../ServiceConnect'

interface IntegrationManagerProps {
  service: string
  icon: string
  name: string
}

const supportedInputStreams = ['github:team']

const IntegrationManager = ({
  service,
  icon,
  name,
  children,
}: React.PropsWithChildren<IntegrationManagerProps>) => {
  const integrationState = useTeamIntegrations()
  const streamsState = useTeamInputStreams()

  const { team } = usePage()
  const { translate } = useI18n()
  const { openModal } = useModal()

  const removeIntegration = useCallback(
    async (integration: SerializedTeamIntegration) => {
      if (integrationState.type === 'initialising') {
        return
      }
      integrationState.actions.removeIntegration(integration).then(() => {
        if (streamsState.initialized) {
          streamsState.setStreams((prev) =>
            prev.filter((stream) => stream.integrationId !== integration.id)
          )
        }
      })
    },
    [integrationState, streamsState]
  )

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

  const sources = useMemo(() => {
    if (!streamsState.initialized) {
      return []
    }

    return streamsState.streams.reduce((acc, stream) => {
      stream.sources.forEach((source) => acc.push(source))
      return acc
    }, [] as SerializedSource[])
  }, [streamsState])

  return (
    <StyledIntegrationManager>
      <div className='integration__description'>{children}</div>
      <h3>Integrations:</h3>
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
            {integrations.map((integration) => (
              <div className='integration__list__item' key={integration.id}>
                <h3>{integration.name}</h3>

                <Button
                  variant='danger'
                  onClick={() => {
                    removeIntegration(integration)
                  }}
                >
                  {translate(lngKeys.GeneralRemoveVerb)}
                </Button>
              </div>
            ))}
          </>
        )}
      </div>

      {supportedInputStreams.includes(service) && (
        <>
          <Flexbox justifyContent='space-between'>
            <Flexbox>
              <h3>Input Stream Sources:</h3>
              <WithTooltip
                tooltip={`Input stream sources are used for setting up block editor's external data updates via automations`}
              >
                <Pastille
                  className='integration__source__helper'
                  variant='secondary'
                >
                  ?
                </Pastille>
              </WithTooltip>
            </Flexbox>
            <Button
              variant='icon'
              iconPath={mdiPlus}
              disabled={!streamsState.initialized}
              onClick={
                !streamsState.initialized
                  ? undefined
                  : () =>
                      openModal(
                        <InputStreamSourcePickerModal
                          service={service}
                          integrations={integrations}
                          streams={streamsState.streams}
                          actions={streamsState.actions}
                        />,
                        {
                          width: 300,
                          title: 'Add Input Stream Source',
                        }
                      )
              }
              size='sm'
            />
          </Flexbox>
          {streamsState.initialized && (
            <div className='streams__content'>
              {sources.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>Integration</th>
                      <th>Scope</th>
                      <td>Actions</td>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source) => (
                      <tr key={source.id}>
                        <td>
                          {
                            integrations.find(
                              (i) => i.id === source.integrationId
                            )?.name
                          }
                        </td>
                        <td>{source.identifier}</td>
                        <td>
                          <LoadingButton
                            size='sm'
                            variant='danger'
                            disabled={streamsState.sendingMap.has(source.id)}
                            iconPath={mdiTrashCanOutline}
                            onClick={() =>
                              streamsState.actions.removeSource(source)
                            }
                            spinning={
                              streamsState.sendingMap.get(source.id) ===
                              'delete'
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </StyledIntegrationManager>
  )
}

const StyledIntegrationManager = styled.div`
  table {
    width: 100%;
    text-align: left;
    border-collapse: collapse;
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
  }

  & td,
  th {
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  & .block__table__view__import {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  .integration__source__helper {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

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
