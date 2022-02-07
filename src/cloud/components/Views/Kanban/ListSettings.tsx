import { mdiArrowLeft, mdiArrowRight, mdiEyeOffOutline } from '@mdi/js'
import React from 'react'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { KanbanViewList } from '../../../lib/hooks/views/kanbanView'

interface ListSettingsProps {
  list: KanbanViewList
  remove: (list: KanbanViewList) => void
  move: (list: KanbanViewList, move: 'left' | 'right') => void
  sending?: 'move' | 'delete'
}

const ListSettings = ({
  children,
  list,
  move,
  remove,
  sending,
}: React.PropsWithChildren<ListSettingsProps>) => {
  return (
    <MetadataContainer className={'list-settings__metadata__status_border'}>
      {children != null && children}
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
