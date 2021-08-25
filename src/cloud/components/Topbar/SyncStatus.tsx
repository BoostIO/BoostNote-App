import React, { useCallback, useMemo } from 'react'
import { WebsocketProvider } from 'y-websocket'
import { ConnectionState } from '../../lib/editor/hooks/useRealtime'
import Button from '../../../design/components/atoms/Button'
import Spinner from '../../../design/components/atoms/Spinner'
import styled from '../../../design/lib/styled'
import WithTooltip from '../../../design/components/atoms/WithTooltip'

interface SyncStatusProps {
  provider: WebsocketProvider
  connState: ConnectionState
}

const RECONNECTING_TOOLTIP = (
  <>
    Attempting auto-reconnection
    <br />
    Changes will not be synced with the server until reconnection
  </>
)

const DISCONNECTED_TOOTIP = (
  <>
    Please try reconnecting.
    <br />
    Changes will not be synced with the server until reconnection
  </>
)

const SyncStatus = ({ provider, connState }: SyncStatusProps) => {
  const reconnect = useCallback(() => {
    provider.connect()
  }, [provider])

  const content = useMemo(() => {
    switch (connState) {
      case 'reconnecting':
        return (
          <WithTooltip tooltip={RECONNECTING_TOOLTIP}>
            <span>
              Connecting.. <Spinner />
            </span>
          </WithTooltip>
        )
      case 'disconnected':
        return (
          <WithTooltip tooltip={DISCONNECTED_TOOTIP}>
            <Button variant='warning' onClick={reconnect}>
              Reconnect
            </Button>
          </WithTooltip>
        )
      default:
        return undefined
    }
  }, [connState, reconnect])

  return <StyledSyncTextContainer>{content}</StyledSyncTextContainer>
}

const StyledSyncTextContainer = styled.div`
  span {
    display: flex;
    align-items: center;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    color: ${({ theme }) => theme.colors.variants.danger.text};
    > div {
      margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
  }
`

export default SyncStatus
