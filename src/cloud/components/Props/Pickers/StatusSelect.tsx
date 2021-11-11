import React from 'react'
import {
  useContextMenu,
  MenuTypes,
  MenuItem,
} from '../../../../design/lib/stores/contextMenu'
import Icon from '../../../../design/components/atoms/Icon'
import {
  mdiPlayCircleOutline,
  mdiPauseCircleOutline,
  mdiClose,
  mdiArchiveOutline,
  mdiCheckCircleOutline,
  mdiListStatus,
} from '@mdi/js'
import { DocStatus } from '../../../interfaces/db/doc'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import styled from '../../../../design/lib/styled'
import PropertyValueButton from './PropertyValueButton'

interface StatusSelectProps {
  sending?: boolean
  status?: DocStatus | null
  disabled?: boolean
  isErrored?: boolean
  isReadOnly: boolean
  onClick?: (event: React.MouseEvent) => void
  onStatusChange: (status: DocStatus | null) => void
}

const StatusSelect = ({
  status,
  sending,
  disabled,
  isErrored,
  isReadOnly,
  onStatusChange,
  onClick,
}: StatusSelectProps) => {
  const { popup } = useContextMenu()
  return (
    <Container className='item__status__select prop__margin'>
      <PropertyValueButton
        sending={sending}
        isErrored={isErrored}
        isReadOnly={isReadOnly}
        empty={status == null}
        disabled={disabled}
        iconPath={status == null ? mdiListStatus : undefined}
        onClick={(event) => {
          if (onClick != null) {
            return onClick(event)
          }
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
      </PropertyValueButton>
    </Container>
  )
}

export default StatusSelect

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
    color: ${({ theme }) => theme.colors.variants.info.base};
  }
  .status_icon--paused {
    color: ${({ theme }) => theme.colors.variants.secondary.base};
  }
  .status_icon--completed {
    color: ${({ theme }) => theme.colors.variants.success.base};
  }
  .status_icon--archived {
    color: ${({ theme }) => theme.colors.variants.warning.base};
  }
`

const ContextMenuItemContainer = styled.div`
  display: flex;
  align-items: center;
  .status_icon--in-progress {
    color: ${({ theme }) => theme.colors.variants.info.base};
  }
  .status_icon--paused {
    color: ${({ theme }) => theme.colors.variants.secondary.base};
  }
  .status_icon--completed {
    color: ${({ theme }) => theme.colors.variants.success.base};
  }
  .status_icon--archived {
    color: ${({ theme }) => theme.colors.variants.warning.base};
  }
`

const StatusView = ({ status }: { status?: DocStatus | null }) => {
  const { translate } = useI18n()
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
  return (
    <div className='status status--empty'>{translate(lngKeys.NoStatus)}</div>
  )
}
