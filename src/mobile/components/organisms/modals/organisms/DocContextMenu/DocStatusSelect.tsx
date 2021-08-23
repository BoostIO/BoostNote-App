import React from 'react'
import {
  useContextMenu,
  MenuTypes,
  MenuItem,
} from '../../../../../../design/lib/stores/contextMenu'
import Icon from '../../../../../../design/components/atoms/Icon'
import {
  mdiPlayCircleOutline,
  mdiPauseCircleOutline,
  mdiClose,
  mdiArchiveOutline,
  mdiCheckCircleOutline,
} from '@mdi/js'
import { DocStatus } from '../../../../../../cloud/interfaces/db/doc'
import DocPropertyValueButton from './DocPropertyValueButton'
import { useI18n } from '../../../../../../cloud/lib/hooks/useI18n'
import { lngKeys } from '../../../../../../cloud/lib/i18n/types'
import styled from '../../../../../../design/lib/styled'

interface DocStatusSelectProps {
  sending?: boolean
  status?: DocStatus | null
  disabled?: boolean
  isReadOnly: boolean
  onStatusChange: (status: DocStatus | null) => void
}

const DocStatusSelect = ({
  status,
  sending,
  disabled,
  isReadOnly,
  onStatusChange,
}: DocStatusSelectProps) => {
  const { popup } = useContextMenu()
  return (
    <Container>
      <DocPropertyValueButton
        sending={sending}
        isReadOnly={isReadOnly}
        empty={status == null}
        disabled={disabled}
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
