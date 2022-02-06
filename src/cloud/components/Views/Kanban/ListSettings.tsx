import { mdiArrowLeft, mdiArrowRight, mdiEyeOffOutline } from '@mdi/js'
import React from 'react'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { KanbanViewList } from '../../../lib/hooks/views/kanbanView'
import { SerializedStatus } from '../../../interfaces/db/status'
import { StatusEditor } from '../../../../design/components/molecules/LabelManager'

interface ListSettingsProps {
  status?: SerializedStatus
  list: KanbanViewList
  remove: (list: KanbanViewList) => void
  onStatusUpdate: (status: SerializedStatus) => void
  move: (list: KanbanViewList, move: 'left' | 'right') => void
  sending?: 'move' | 'delete'
}

const ListSettings = ({
  status,
  list,
  move,
  remove,
  sending,
  onStatusUpdate,
}: ListSettingsProps) => {
  return (
    <MetadataContainer className={'list-settings__metadata__status_border'}>
      {status != null && (
        <>
          <StatusEditor label={status} onSave={onStatusUpdate} />
          <hr />
        </>
      )}
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            iconPath: mdiArrowLeft,
            label: 'Move Left',
            spinning: sending === 'move',
            onClick: () => move(list, 'left'),
            disabled: sending != null,
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            iconPath: mdiArrowRight,
            label: 'Move Right',
            spinning: sending === 'move',
            onClick: () => move(list, 'right'),
            disabled: sending != null,
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            iconPath: mdiEyeOffOutline,
            label: 'Hide',
            spinning: sending === 'delete',
            onClick: () => remove(list),
            disabled: sending != null,
          },
        }}
      />
    </MetadataContainer>
  )
}

export default ListSettings
