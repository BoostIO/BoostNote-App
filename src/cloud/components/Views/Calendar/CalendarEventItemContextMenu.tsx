import { mdiPencil, mdiTrashCanOutline } from '@mdi/js'
import React from 'react'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'

interface CalendarEventItemContextMenuProps {
  doc: SerializedDocWithSupplemental
  team: SerializedTeam
}

const CalendarEventItemContextMenu = ({
  doc,
}: CalendarEventItemContextMenuProps) => {
  const { deleteDocApi, sendingMap } = useCloudApi()
  const { openRenameDocForm } = useCloudResourceModals()
  return (
    <MetadataContainer>
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Rename',
            iconPath: mdiPencil,
            id: 'event__item__edit',
            disabled: sendingMap.get(doc.id) != null,
            spinning: sendingMap.get(doc.id) === 'update',
            onClick: () => openRenameDocForm(doc),
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Delete',
            iconPath: mdiTrashCanOutline,
            id: 'event__item__delete',
            disabled: sendingMap.get(doc.id) != null,
            spinning: sendingMap.get(doc.id) === 'delete',
            onClick: () => deleteDocApi(doc),
          },
        }}
      />
    </MetadataContainer>
  )
}

export default CalendarEventItemContextMenu
