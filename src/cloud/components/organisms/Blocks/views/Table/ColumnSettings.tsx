import {
  mdiAccountCircleOutline,
  mdiArrowLeftBold,
  mdiArrowRightBold,
  mdiTrashCanOutline,
} from '@mdi/js'
import React, { useCallback, useState } from 'react'
import FormInput from '../../../../../../shared/components/molecules/Form/atoms/FormInput'
import MetadataContainerBreak from '../../../../../../shared/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../../../../shared/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useModal } from '../../../../../../shared/lib/stores/modal'
import styled from '../../../../../../shared/lib/styled'
import { Column, DataType } from '../../../../../lib/blocks/table'
import { capitalize } from '../../../../../lib/utils/string'
import DataTypeMenu from './DataTypeMenu'

interface ColumnSettingsProps {
  col: Column
  setColName: (name: string, col: Column) => void
  setColDataType: (type: DataType, col: Column) => void
  deleteCol: (col: Column) => void
  moveColumn: (col: Column, direction: 'left' | 'right') => void
}

const ColumnSettings = ({
  col,
  setColName,
  setColDataType,
  deleteCol,
  moveColumn,
}: ColumnSettingsProps) => {
  const [name, setName] = useState(col.name)
  const { openContextModal, closeAllModals } = useModal()

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (ev) => {
      setName(ev.target.value)
      setColName(ev.target.value, col)
    },
    [col]
  )

  const openTypeSelector: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <DataTypeMenu
          onSelect={(type) => {
            setColDataType(type, col)
            closeAllModals()
          }}
        />,
        { width: 300, keepAll: true }
      )
    },
    [col]
  )

  return (
    <Container>
      <MetadataContainerRow row={{ type: 'header', content: 'NAME' }} />
      <FormInput value={name} onChange={onChange} />
      <MetadataContainerRow
        row={{
          type: 'header',
          content:
            col.data_type === 'prop' ? 'GITHUB PARAMETER' : 'PROPERTY TYPE',
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: capitalize(col.data_type),
            iconPath: mdiAccountCircleOutline,
            onClick: openTypeSelector,
          },
        }}
      />
      <MetadataContainerBreak />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Move left',
            iconPath: mdiArrowLeftBold,
            onClick: () => moveColumn(col, 'left'),
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Move right',
            iconPath: mdiArrowRightBold,
            onClick: () => moveColumn(col, 'right'),
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Delete',
            iconPath: mdiTrashCanOutline,
            onClick: () => deleteCol(col),
          },
        }}
      />
    </Container>
  )
}

export default ColumnSettings

const Container = styled.div`
  & .table__column__settings__type {
    position: relative;
    & > .table__column__settings__type__wrapper {
      position: absolute;
      left: 100%;
    }
  }
`
