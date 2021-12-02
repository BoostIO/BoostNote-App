import { mdiLinkVariant, mdiPen, mdiTrashCanOutline } from '@mdi/js'
import React from 'react'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'
import { useRouter } from '../../../lib/router'
import { getDocLinkHref } from '../../Link/DocLink'

interface CalendarEventItemContextMenuProps {
  doc: SerializedDocWithSupplemental
  team: SerializedTeam
}

const CalendarEventItemContextMenu = ({
  doc,
  team,
}: CalendarEventItemContextMenuProps) => {
  const { push } = useRouter()
  const { deleteDocApi, sendingMap } = useCloudApi()
  const { openRenameDocForm } = useCloudResourceModals()
  return (
    <MetadataContainer>
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Open',
            iconPath: mdiLinkVariant,
            id: 'event__item__open',
            disabled: sendingMap.get(doc.id) != null,
            onClick: () => push(getDocLinkHref(doc, team, 'index')),
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Edit title',
            iconPath: mdiPen,
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
