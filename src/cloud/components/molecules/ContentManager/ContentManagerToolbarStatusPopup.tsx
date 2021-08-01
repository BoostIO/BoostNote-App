import {
  mdiArchiveOutline,
  mdiCheckCircleOutline,
  mdiClose,
  mdiPauseCircleOutline,
  mdiPlayCircleOutline,
} from '@mdi/js'
import React from 'react'
import Button from '../../../../shared/components/atoms/Button'
import Icon from '../../../../shared/components/atoms/Icon'
import UpDownList from '../../../../shared/components/atoms/UpDownList'
import styled from '../../../../shared/lib/styled'
import { DocStatus } from '../../../interfaces/db/doc'

interface ContentManagerToolbarStatusPopupProps {
  onStatusChange: (status: DocStatus | null) => void
}

const ContentManagerToolbarStatusPopup = ({
  onStatusChange,
}: ContentManagerToolbarStatusPopupProps) => {
  return (
    <Container>
      <UpDownList ignoreFocus={true}>
        <Button
          variant='transparent'
          onClick={() => onStatusChange('in_progress')}
          id='status-inprogress'
          icon={
            <Icon
              className='status_icon--in-progress'
              path={mdiPlayCircleOutline}
            />
          }
        >
          In Progress
        </Button>

        <Button
          variant='transparent'
          onClick={() => onStatusChange('paused')}
          id='status-paused'
          icon={
            <Icon
              className='status_icon--paused'
              path={mdiPauseCircleOutline}
            />
          }
        >
          Paused
        </Button>

        <Button
          variant='transparent'
          onClick={() => onStatusChange('completed')}
          id='status-completed'
          icon={
            <Icon
              className='status_icon--completed'
              path={mdiCheckCircleOutline}
            />
          }
        >
          Completed
        </Button>

        <Button
          variant='transparent'
          onClick={() => onStatusChange('archived')}
          id='status-archived'
          icon={
            <Icon className='status_icon--archived' path={mdiArchiveOutline} />
          }
        >
          Archived
        </Button>

        <Button
          variant='transparent'
          onClick={() => onStatusChange(null)}
          id='status-clear'
          iconPath={mdiClose}
        >
          Clear
        </Button>
      </UpDownList>
    </Container>
  )
}

const Container = styled.div`
  button {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    margin: 0 !important;
  }

  .status_icon--in-progress,
  .status_icon--paused,
  .status_icon--completed,
  .status_icon--archived {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
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

export default ContentManagerToolbarStatusPopup
