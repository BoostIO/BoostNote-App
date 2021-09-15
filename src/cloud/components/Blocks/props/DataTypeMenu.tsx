import {
  mdiAccountCircleOutline,
  mdiCalendarOutline,
  mdiCheckboxMarkedOutline,
  mdiLink,
  mdiNumeric,
  mdiText,
} from '@mdi/js'
import React from 'react'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { PropType } from '../../../lib/blocks/props'

interface DataTypeMenuProps {
  onSelect: (type: PropType) => void
}

const DataTypeMenu = ({ onSelect }: DataTypeMenuProps) => {
  return (
    <>
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
            iconPath: mdiNumeric,
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
            label: 'Person',
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
    </>
  )
}

export default DataTypeMenu

export function getBlockPropertyIconByType(type: string) {
  switch (type) {
    case 'number':
      return mdiNumeric
    case 'date':
      return mdiCalendarOutline
    case 'user':
      return mdiAccountCircleOutline
    case 'url':
      return mdiLink
    case 'checkbox':
      return mdiCheckboxMarkedOutline
    default:
      return mdiText
  }
}
