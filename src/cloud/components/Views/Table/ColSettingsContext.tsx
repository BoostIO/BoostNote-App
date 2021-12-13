import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiEyeOffOutline,
  mdiSortAlphabeticalAscending,
  mdiSortAlphabeticalDescending,
  mdiSortCalendarAscending,
  mdiSortCalendarDescending,
  mdiSortNumericAscending,
  mdiSortNumericDescending,
} from '@mdi/js'
import React, { useCallback, useMemo, useState } from 'react'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import {
  Column,
  ColumnMoveType,
  ViewTableSortingOptions,
} from '../../../lib/views/table'

interface ColumnSettingsContextProps {
  column: Column
  moveColumn: (move: ColumnMoveType) => void
  removeColumn: (col: Column) => void
  close: () => void
  updateTableSort: (sort: ViewTableSortingOptions) => Promise<BulkApiActionRes>
}

const ColumnSettingsContext = ({
  column,
  removeColumn,
  moveColumn,
  close,
  updateTableSort,
}: ColumnSettingsContextProps) => {
  const [sending, setSending] = useState<string>()

  const [columnName, columnType] = useMemo(() => {
    const [, columnName, columnType] = column.id.split(':')
    return [columnName, columnType]
  }, [column.id])

  const action = useCallback(
    async (
      type: 'sort-asc' | 'sort-desc' | 'move-left' | 'move-right' | 'delete'
    ) => {
      if (sending != null) {
        return
      }

      setSending(type)

      switch (type) {
        case 'sort-asc':
          switch ((column as any).prop) {
            case 'creation_date':
            case 'update_date':
            case 'label':
              await updateTableSort({
                type: 'static-prop',
                propertyName: (column as any).prop,
                direction: 'asc',
              })
              break
            default:
              await updateTableSort({
                type: 'column',
                columnType,
                columnName,
                direction: 'asc',
              })
              break
          }
          break

        case 'sort-desc':
          switch ((column as any).prop) {
            case 'creation_date':
            case 'update_date':
            case 'label':
              await updateTableSort({
                type: 'static-prop',
                propertyName: (column as any).prop,
                direction: 'desc',
              })
              break
            default:
              await updateTableSort({
                type: 'column',
                columnType,
                columnName,
                direction: 'desc',
              })
              break
          }
          break

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
    [
      sending,
      close,
      column,
      moveColumn,
      removeColumn,
      updateTableSort,
      columnType,
      columnName,
    ]
  )

  return (
    <MetadataContainer>
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            iconPath:
              columnType === 'number'
                ? mdiSortNumericAscending
                : columnType === 'date' ||
                  columnType === 'creation_date' ||
                  columnType === 'update_date'
                ? mdiSortCalendarAscending
                : mdiSortAlphabeticalAscending,
            label: 'Sort Ascending',
            spinning: sending === 'sort-asc',
            onClick: () => action('sort-asc'),
            disabled: sending != null,
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            iconPath:
              columnType === 'number'
                ? mdiSortNumericDescending
                : columnType === 'date' ||
                  columnType === 'creation_date' ||
                  columnType === 'update_date'
                ? mdiSortCalendarDescending
                : mdiSortAlphabeticalDescending,
            label: 'Sort Decending',
            spinning: sending === 'sort-desc',
            onClick: () => action('sort-desc'),
            disabled: sending != null,
          },
        }}
      />
      <MetadataContainerBreak />
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
      <MetadataContainerBreak />
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
