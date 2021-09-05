import {
  mdiAccountCircleOutline,
  mdiCalendarOutline,
  mdiCheckboxMarkedOutline,
  mdiLink,
  mdiText,
} from '@mdi/js'
import React from 'react'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { PropType } from '../../../lib/blocks/props'

interface DataTypeMenuProps {
  onSelect: (type: PropType) => void
}

const DataTypeMenu = ({ onSelect }: DataTypeMenuProps) => {
  return (
    <MetadataContainer>
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'add-data-text',
            label: 'Text',
            onClick: () => onSelect('text'),
            iconPath: mdiText,
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'add-data-number',
            label: 'Number',
            onClick: () => onSelect('number'),
            iconPath: mdiText,
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'add-data-date',
            label: 'Date',
            onClick: () => onSelect('date'),
            iconPath: mdiCalendarOutline,
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'add-data-person]',
            label: 'Person (Assignee)',
            onClick: () => onSelect('user'),
            iconPath: mdiAccountCircleOutline,
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'add-data-url',
            label: 'Url',
            onClick: () => onSelect('url'),
            iconPath: mdiLink,
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'add-data-checkbox',
            label: 'Checkbox',
            onClick: () => onSelect('checkbox'),
            iconPath: mdiCheckboxMarkedOutline,
          },
        }}
      />
    </MetadataContainer>
  )
}

export default DataTypeMenu
