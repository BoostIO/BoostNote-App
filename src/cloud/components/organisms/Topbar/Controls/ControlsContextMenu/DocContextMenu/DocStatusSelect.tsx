import React from 'react'
import {
  useContextMenu,
  MenuTypes,
  MenuItem,
} from '../../../../../../../shared/lib/stores/contextMenu'
import Icon from '../../../../../../../shared/components/atoms/Icon'
import {
  mdiPlayCircleOutline,
  mdiPauseCircleOutline,
  mdiClose,
  mdiArchiveOutline,
  mdiCheckCircleOutline,
} from '@mdi/js'
import styled from '../../../../../../lib/styled'
import { DocStatus } from '../../../../../../interfaces/db/doc'
import DocPropertyValueButton from './DocPropertyValueButton'

interface DocStatusSelectProps {
  sending?: boolean
  status?: DocStatus | null
  onStatusChange: (status: DocStatus | null) => void
}

const DocStatusSelect = ({
  status,
  sending,
  onStatusChange,
}: DocStatusSelectProps) => {
  const { popup } = useContextMenu()
  return (
    <Container>
      <DocPropertyValueButton
        sending={sending}
        empty={status == null}
        onClick={(event) => {
          popup(event, [
            {
              type: MenuTypes.Normal,
              label: (
                <ContextMenuItemContainer>
                  <Icon
                    className='status_icon--in-progress'
                    path={mdiPlayCircleOutline}
                  />
                  In Progress
                </ContextMenuItemContainer>
              ),
              onClick: () => {
                onStatusChange('in_progress')
              },
            },
            {
              type: MenuTypes.Normal,
              label: (
                <ContextMenuItemContainer>
                  <Icon
                    className='status_icon--paused'
                    path={mdiPauseCircleOutline}
                  />
                  Paused
                </ContextMenuItemContainer>
              ),
              onClick: () => {
                onStatusChange('paused')
              },
            },
            {
              type: MenuTypes.Normal,
              label: (
                <ContextMenuItemContainer>
                  <Icon
                    className='status_icon--completed'
                    path={mdiCheckCircleOutline}
                  />{' '}
                  Completed
                </ContextMenuItemContainer>
              ),
              onClick: () => {
                onStatusChange('completed')
              },
            },
            {
              type: MenuTypes.Normal,
              label: (
                <ContextMenuItemContainer>
                  <Icon
                    className='status_icon--archived'
                    path={mdiArchiveOutline}
                  />
                  Archived
                </ContextMenuItemContainer>
              ),
              onClick: () => {
                onStatusChange('archived')
              },
            },
            {
              type: MenuTypes.Normal,
              label: (
                <ContextMenuItemContainer>
                  <Icon path={mdiClose} />
                  Clear
                </ContextMenuItemContainer>
              ),
              onClick: () => {
                onStatusChange(null)
              },
            },
          ] as MenuItem[])
        }}
      >
        <StatusView status={status} />
      </DocPropertyValueButton>
    </Container>
  )
}

export default DocStatusSelect

const Container = styled.div`
  height: 30px;
  .status {
    display: flex;
    align-items: center;
  }
  .status_icon {
    margin-right: 5px;
  }
  .status_icon--in-progress {
    color: ${({ theme }) => theme.infoTextColor};
  }
  .status_icon--paused {
    color: ${({ theme }) => theme.secondaryTextColor};
  }
  .status_icon--completed {
    color: ${({ theme }) => theme.successTextColor};
  }
  .status_icon--archived {
    color: ${({ theme }) => theme.warningTextColor};
  }
`

const ContextMenuItemContainer = styled.div`
  display: flex;
  align-items: center;
  .status_icon--in-progress {
    color: ${({ theme }) => theme.infoTextColor};
  }
  .status_icon--paused {
    color: ${({ theme }) => theme.secondaryTextColor};
  }
  .status_icon--completed {
    color: ${({ theme }) => theme.successTextColor};
  }
  .status_icon--archived {
    color: ${({ theme }) => theme.warningTextColor};
  }
`

const StatusView = ({ status }: { status?: DocStatus | null }) => {
  switch (status) {
    case 'in_progress':
      return (
        <div className='status'>
          <Icon
            className='status_icon status_icon--in-progress'
            path={mdiPlayCircleOutline}
          />
          In Progress
        </div>
      )
    case 'paused':
      return (
        <div className='status'>
          <Icon
            className='status_icon status_icon--paused'
            path={mdiPauseCircleOutline}
          />
          Paused
        </div>
      )
    case 'completed':
      return (
        <div className='status'>
          <Icon
            className='status_icon status_icon--completed'
            path={mdiCheckCircleOutline}
          />{' '}
          Completed
        </div>
      )
    case 'archived':
      return (
        <div className='status'>
          <Icon
            className='status_icon status_icon--archived'
            path={mdiArchiveOutline}
          />
          Archived
        </div>
      )
  }
  return <div className='status status--empty'>No status</div>
}
