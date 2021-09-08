import {
  mdiAccountCircleOutline,
  mdiArrowLeftBold,
  mdiArrowRightBold,
  mdiTrashCanOutline,
} from '@mdi/js'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import FormInput from '../../../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainer from '../../../../../design/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useModal } from '../../../../../design/lib/stores/modal'
import styled from '../../../../../design/lib/styled'
import { PropType } from '../../../../lib/blocks/props'
import {
  Column,
  getColType,
  isPropCol,
  PropCol,
} from '../../../../lib/blocks/table'
import { capitalize } from '../../../../lib/utils/string'
import DataTypeMenu from '../../props/DataTypeMenu'

interface ColumnSettingsProps {
  col: Column
  setColName: (col: Column, name: string) => void
  setColDataType: (col: PropCol, type: PropType) => void
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
  const [colInternal, setColInternal] = useState(col)
  const { openContextModal, closeAllModals } = useModal()

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (ev) => {
      const newName = ev.target.value
      setColName(colInternal, newName)
      setColInternal((col) => {
        return { ...col, name: newName }
      })
    },
    [colInternal, setColName]
  )

  useEffect(() => {
    setColInternal(col)
  }, [col])

  const openTypeSelector: React.MouseEventHandler = useCallback(
    (ev) => {
      if (isPropCol(colInternal)) {
        openContextModal(
          ev,
          <MetadataContainer>
            <DataTypeMenu
              onSelect={(type) => {
                setColDataType(colInternal, type)
                setColInternal({ ...colInternal, type })
                closeAllModals()
              }}
            />
          </MetadataContainer>,
          { width: 300, keepAll: true }
        )
      }
    },
    [colInternal, closeAllModals, openContextModal, setColDataType]
  )

  const dataType = useMemo(() => {
    return getColType(colInternal)
  }, [colInternal])

  return (
    <MetadataContainer>
      <Container>
        <MetadataContainerRow row={{ type: 'header', content: 'NAME' }} />
        <FormInput
          value={colInternal.name}
          onChange={onChange}
          id='column-input-setting'
          onKeyDown={(ev) => {
            if (ev.key === 'Enter' && !(ev.ctrlKey || ev.metaKey)) {
              ev.preventDefault()
              ev.stopPropagation()
              closeAllModals()
            }
          }}
        />
        {dataType !== 'prop' && (
          <>
            <MetadataContainerRow
              row={{
                type: 'header',
                content: 'PROPERTY TYPE',
              }}
            />
            <MetadataContainerRow
              row={{
                type: 'button',
                props: {
                  label: capitalize(dataType),
                  iconPath: mdiAccountCircleOutline,
                  onClick: openTypeSelector,
                  id: 'column-setting-type',
                },
              }}
            />
          </>
        )}
        <MetadataContainerBreak />
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: 'Move left',
              iconPath: mdiArrowLeftBold,
              onClick: () => moveColumn(col, 'left'),
              id: 'column-setting-moveleft',
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
              id: 'column-setting-moveright',
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
              id: 'column-setting-delete',
            },
          }}
        />
      </Container>
    </MetadataContainer>
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
