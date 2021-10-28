import React from 'react'
import { mdiAutorenew, mdiCheck, mdiCloudOffOutline } from '@mdi/js'
import Icon from '../../../design/components/atoms/Icon'
import styled from '../../../design/lib/styled'
import { ConnectionState } from '../../lib/editor/hooks/useRealtime'
import { getDocStatusDateString } from '../../lib/date'

interface DocSyncStatusProps {
  connState: ConnectionState
  syncDate: Date
}

const DocSyncStatus = ({ connState, syncDate }: DocSyncStatusProps) => {
  return (
    <SyncStatus>
      {connState == 'synced' && (
        <>
          <Icon className={'sync--status--success-color'} path={mdiCheck} />
          <span>Saved: {getDocStatusDateString(syncDate)}</span>
        </>
      )}
      {(connState == 'disconnected' || connState == 'reconnecting') && (
        <>
          <Icon
            className={'sync--status--offline-color'}
            path={mdiCloudOffOutline}
          />
          <span className={'sync--status--sync-text'}>Offline</span>
        </>
      )}
      {(connState == 'initialising' ||
        connState == 'loaded' ||
        connState == 'connected') && (
        <>
          <Icon
            className={'sync--status--success-color'}
            spin={true}
            path={mdiAutorenew}
          />
          <span className={'sync--status--sync-text'}>Saving now...</span>
        </>
      )}
    </SyncStatus>
  )
}

const SyncStatus = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;

  & > :first-child {
    display: flex;
    margin-right: 2px;
  }

  .sync--status--offline-color {
    color: ${({ theme }) => theme.colors.variants.warning.base};
  }

  .sync--status--success-color {
    color: ${({ theme }) => theme.colors.variants.success.base};
  }

  .sync--status--sync-text {
    padding: 3px;
  }
`
export default DocSyncStatus
