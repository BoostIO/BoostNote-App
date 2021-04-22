import React, { useState, useMemo, useCallback } from 'react'
import { SerializedServiceConnection } from '../../interfaces/db/connections'
import { useEffectOnce } from 'react-use'
import { getUserServiceConnections } from '../../api/connections'
import Spinner from '../atoms/CustomSpinner'
import ServiceConnect from '../atoms/ServiceConnect'
import styled from '../../lib/styled'
import IconMdi from '../atoms/IconMdi'
import {
  mdiGithub,
  mdiChevronRight,
  mdiPlus,
  mdiChevronLeft,
  mdiSlack,
  mdiCloud,
} from '@mdi/js'
import cc from 'classcat'
import { useToast } from '../../../shared/lib/stores/toast'

interface ServiceSelectorProps {
  onSelect: (connection: SerializedServiceConnection) => void
}

type Services = 'github' | 'slack' | 'vercel'

const ServiceSelector = ({ onSelect }: ServiceSelectorProps) => {
  const { pushApiErrorMessage } = useToast()
  const [connections, setConnections] = useState<SerializedServiceConnection[]>(
    []
  )
  const [service, setService] = useState<Services>('github')
  const [isLoadingConnections, setIsLoadingConnections] = useState(true)
  const [tokenSelect, setTokenSelect] = useState(false)

  useEffectOnce(() => {
    const getServiceConnections = async () => {
      try {
        const { connections } = await getUserServiceConnections()
        setConnections(connections)
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setIsLoadingConnections(false)
      }
    }
    getServiceConnections()
  })

  const onConnect = useCallback((connection: SerializedServiceConnection) => {
    setConnections((old) => [
      connection,
      ...old.filter((conn) => conn.id !== connection.id),
    ])
  }, [])

  const activeServiceConnections = useMemo(() => {
    return service == null || isLoadingConnections
      ? []
      : connections.filter((conn) => conn.service === service)
  }, [service, isLoadingConnections, connections])

  const selectService = (service: Services) => () => {
    setService(service)
    setTokenSelect(true)
  }

  return (
    <StyledServiceList
      className={cc({ serviceSelected: tokenSelect && !isLoadingConnections })}
    >
      <div className='view'>
        <h2>Choose a service</h2>
        <ul>
          <li onClick={selectService('github')}>
            <IconMdi path={mdiGithub} size={40} />
            <h3>GitHub</h3>
            {tokenSelect && isLoadingConnections && service === 'github' ? (
              <Spinner />
            ) : (
              <IconMdi path={mdiChevronRight} size={40} />
            )}
          </li>
          <li onClick={selectService('slack')}>
            <IconMdi path={mdiSlack} size={40} />
            <h3>Slack</h3>
            {tokenSelect && isLoadingConnections && service === 'slack' ? (
              <Spinner />
            ) : (
              <IconMdi path={mdiChevronRight} size={40} />
            )}
          </li>
          <li onClick={selectService('vercel')}>
            <IconMdi path={mdiCloud} size={40} />
            <h3>Vercel</h3>
            {tokenSelect && isLoadingConnections && service === 'vercel' ? (
              <Spinner />
            ) : (
              <IconMdi path={mdiChevronRight} size={40} />
            )}
          </li>
        </ul>
      </div>
      <div className='view'>
        <div className='header'>
          <span onClick={() => setTokenSelect(false)}>
            <IconMdi path={mdiChevronLeft} size={32} />
          </span>
          <h2 className='small'>
            {`Choose a ${service[0].toUpperCase()}${service.slice(1)} token`}
          </h2>
        </div>
        <ul>
          {activeServiceConnections.map((conn) => {
            return (
              <li key={conn.id} onClick={() => onSelect(conn)}>
                <span>{conn.identifier}</span>
              </li>
            )
          })}
          <li>
            <ServiceConnect
              variant='transparent'
              service={service}
              onConnect={onConnect}
            >
              <IconMdi path={mdiPlus} size={24} /> Add a {service} Account
            </ServiceConnect>
          </li>
        </ul>
      </div>
    </StyledServiceList>
  )
}

const StyledServiceList = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 200%;
  transition: transform 0.3s ease-in;

  &.serviceSelected {
    transform: translate3d(-50%, 0, 0);
  }

  .view {
    width: 50%;
  }

  .header {
    display: flex;
    align-items: center;
    margin-right: 32px;

    & > span {
      cursor: pointer;
    }

    & > h2 {
      font-size: ${({ theme }) => theme.fontSizes.large}px;
    }
  }

  h2 {
    text-align: center;
    margin: ${({ theme }) => theme.space.small}px 0;
    position: relative;
    height: 38px;
    line-height: 38px;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    cursor: pointer;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.space.small}px
      ${({ theme }) => theme.space.medium}px;
    border-bottom: 2px solid ${({ theme }) => theme.subtleBorderColor};

    &:first-child {
      border-top: 2px solid ${({ theme }) => theme.subtleBorderColor};
    }

    & > h3 {
      margin: 0;
    }
  }
`

export default ServiceSelector
