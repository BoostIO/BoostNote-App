import { mdiArrowLeft, mdiArrowRight, mdiEyeOffOutline } from '@mdi/js'
import React, { useCallback, useState } from 'react'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { Column, ColumnMoveType } from '../../../lib/views/table'

interface ColumnSettingsContextProps {
  column: Column
  moveColumn: (move: ColumnMoveType) => void
  removeColumn: (col: Column) => void
  close: () => void
}

const ColumnSettingsContext = ({
  column,
  removeColumn,
  moveColumn,
  close,
}: ColumnSettingsContextProps) => {
  const [sending, setSending] = useState<string>()

  const action = useCallback(
    async (type: 'move-left' | 'move-right' | 'delete') => {
      if (sending != null) {
        return
      }

      setSending(type)

      switch (type) {
        case 'move-left':
          await moveColumn('before')
          break
        case 'move-right':
          await moveColumn('after')
          break
        case 'delete':
        default:
          await removeColumn(column)
          break
      }

      setSending(undefined)
      close()
    },
    [sending, close, removeColumn, moveColumn, column]
  )

  return (
    <MetadataContainer>
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            iconPath: mdiArrowLeft,
            label: 'Move Left',
            spinning: sending === 'move-left',
            onClick: () => action('move-left'),
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
            spinning: sending === 'move-right',
            onClick: () => action('move-right'),
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
            onClick: () => action('delete'),
            disabled: sending != null,
          },
        }}
      />
    </MetadataContainer>
  )
}

export default ColumnSettingsContext
