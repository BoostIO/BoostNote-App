import React, { useCallback, useMemo } from 'react'
import styled from '../../../lib/styled'
import Tooltip from '../../atoms/Tooltip'
import Spinner from '../../atoms/CustomSpinner'
import { WebsocketProvider } from 'y-websocket'
import { ConnectionState } from '../../../lib/editor/hooks/useRealtime'
import { warningButtonStyle } from '../../../lib/styled/styleFunctions'

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
          <Tooltip tooltip={RECONNECTING_TOOLTIP}>
            <span>
              Connecting.. <Spinner />
            </span>
          </Tooltip>
        )
      case 'disconnected':
        return (
          <Tooltip tooltip={DISCONNECTED_TOOTIP}>
            <StyledButton variant='warning' onClick={reconnect}>
              Reconnect
            </StyledButton>
          </Tooltip>
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
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    color: ${({ theme }) => theme.dangerTextColor};
    > div {
      margin-left: ${({ theme }) => theme.space.xsmall}px;
    }
  }
`

const StyledButton = styled.button`
  ${warningButtonStyle}
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  padding: ${({ theme }) => theme.space.xxsmall}px
    ${({ theme }) => theme.space.small}px;
  border: 1px solid ${({ theme }) => theme.subtleBorderColor};
  border-radius: 3px;
`
export default SyncStatus
