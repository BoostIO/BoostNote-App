import React, { useCallback, useMemo } from 'react'
import { WebsocketProvider } from 'y-websocket'
import { ConnectionState } from '../../lib/editor/hooks/useRealtime'
import Button from '../../../design/components/atoms/Button'
import Spinner from '../../../design/components/atoms/Spinner'
import styled from '../../../design/lib/styled'
import { mdiAlertOutline } from '@mdi/js'
import Icon from '../../../design/components/atoms/Icon'

interface SyncStatusProps {
  provider: WebsocketProvider
  connState: ConnectionState
}

const SyncStatus = ({ provider, connState }: SyncStatusProps) => {
  const reconnect = useCallback(() => {
    provider.connect()
  }, [provider])

  const content = useMemo(() => {
    switch (connState) {
      case 'reconnecting':
        return (
          <ConnectIssueContainer className='sync__status'>
            <div className={'sync__status__container_reconnecting'}>
              <div className={'sync__status__header'}>
                <Spinner variant={'warning'} size={20} />
                <div className={'sync__status__header_text'}>Connecting..</div>
              </div>
              <div>
                Changes will not be synced with the server until reconnection
              </div>
            </div>
          </ConnectIssueContainer>
        )
      case 'disconnected':
        return (
          <ConnectIssueContainer className='sync__status'>
            <div className={'sync__status__container_disconnected'}>
              <div className={'sync__status__header'}>
                <Icon
                  className={'sync__status__header_warn_color'}
                  path={mdiAlertOutline}
                  size={20}
                />
                <div className={'sync__status__header_text'}>
                  Please try reconnecting
                </div>
              </div>
              <div>
                Edit session has expired. Changes will not be synced with the
                server until reconnection.
              </div>
              <Button
                className={'sync__status__reconnect_button'}
                variant='warning'
                onClick={reconnect}
                size={'md'}
              >
                Reconnect
              </Button>
            </div>
          </ConnectIssueContainer>
        )
      default:
        return null
    }
  }, [connState, reconnect])

  return content
}

const ConnectIssueContainer = styled.div`
  position: absolute;
  bottom: 24px;
  right: 46px;
  z-index: 1;
  width: 300px;

  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border-left: solid 4px ${({ theme }) => theme.colors.variants.warning.base};
  border-radius: 4px;

  .sync__status__container_reconnecting {
    height: 85px;
  }

  .sync__status__container_disconnected {
    height: 120px;

    .sync__status__reconnect_button {
      height: 27px;
      width: fit-content;
    }
  }

  .sync__status__container_reconnecting,
  .sync__status__container_disconnected {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.sizes.spaces.sm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    color: ${({ theme }) => theme.colors.variants.danger.text};
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .sync__status__header {
    display: flex;
    gap: 8px;
    align-items: center;

    .sync__status__header_warn_color {
      color: ${({ theme }) => theme.colors.variants.warning.base};
    }
  }

  .sync__status__header_text {
    font-weight: bold;
    font-size: 15px;
    line-height: 18px;
  }
`

export default SyncStatus
