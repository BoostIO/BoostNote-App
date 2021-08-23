import {
  mdiAccountCircleOutline,
  mdiCalendarOutline,
  mdiCheckboxMarkedOutline,
  mdiLink,
  mdiText,
} from '@mdi/js'
import React from 'react'
import MetadataContainerRow from '../../../../../../shared/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { DataType } from '../../../../../lib/blocks/table'

interface DataTypeMenuProps {
  onSelect: (type: DataType) => void
}

const DataTypeMenu = ({ onSelect }: DataTypeMenuProps) => {
  return (
    <>
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
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
            label: 'Checkbox',
            onClick: () => onSelect('checkbox'),
            iconPath: mdiCheckboxMarkedOutline,
          },
        }}
      />
    </>
  )
}

export default DataTypeMenu
