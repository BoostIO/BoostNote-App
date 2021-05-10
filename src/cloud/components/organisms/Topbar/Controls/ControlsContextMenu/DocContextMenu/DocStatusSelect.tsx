import React from 'react'
import { LoadingButton } from '../../../../../../../shared/components/atoms/Button'
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

interface DocStatusSelectProps {
  sending?: boolean
  status?: 'in_progress' | 'completed' | 'archived' | 'pause' | null
  onStatusChange: (
    status: 'in_progress' | 'completed' | 'archived' | 'pause' | null
  ) => void
}

const DocStatusSelect = ({
  status,
  sending,
  onStatusChange,
}: DocStatusSelectProps) => {
  const { popup } = useContextMenu()
  return (
    <LoadingButton
      spinning={sending}
      className='context__status_select'
      variant='transparent'
      onClick={(event) => {
        popup(event, [
          {
            type: MenuTypes.Normal,
            label: (
              <>
                <Icon
                  className='context__status_select__icon--in-progress'
                  path={mdiPlayCircleOutline}
                />
                In Progress
              </>
            ),
            onClick: () => {
              onStatusChange('in_progress')
            },
          },
          {
            type: MenuTypes.Normal,
            label: (
              <>
                <Icon path={mdiPauseCircleOutline} />
                Pause
              </>
            ),
            onClick: () => {
              onStatusChange('pause')
            },
          },
          {
            type: MenuTypes.Normal,
            label: (
              <>
                <Icon path={mdiCheckCircleOutline} /> Completed
              </>
            ),
            onClick: () => {
              onStatusChange('completed')
            },
          },
          {
            type: MenuTypes.Normal,
            label: (
              <>
                <Icon path={mdiArchiveOutline} />
                Archived
              </>
            ),
            onClick: () => {
              onStatusChange('archived')
            },
          },
          {
            type: MenuTypes.Normal,
            label: (
              <>
                <Icon path={mdiClose} />
                Clear
              </>
            ),
            onCLick: () => {
              onStatusChange(null)
            },
          },
        ] as MenuItem[])
      }}
    >
      {status != null ? status : 'Empty'}
    </LoadingButton>
  )
}

export default DocStatusSelect
