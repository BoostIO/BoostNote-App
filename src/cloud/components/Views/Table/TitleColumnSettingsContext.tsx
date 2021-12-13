import {
  mdiSortAlphabeticalAscending,
  mdiSortAlphabeticalDescending,
} from '@mdi/js'
import React, { useCallback, useState } from 'react'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import { ViewTableSortingOptions } from '../../../lib/views/table'

interface TitleColumnSettingsContextProps {
  updateTableSort: (sort: ViewTableSortingOptions) => Promise<BulkApiActionRes>
  close: () => void
}

const TitleColumnSettingsContext = ({
  updateTableSort,
  close,
}: TitleColumnSettingsContextProps) => {
  const [sending, setSending] = useState<string>()

  const action = useCallback(
    async (type: 'sort-asc' | 'sort-desc') => {
      if (sending != null) {
        return
      }

      setSending(type)

      switch (type) {
        case 'sort-asc':
          await updateTableSort({
            type: 'static-prop',
            propertyName: 'title',
            direction: 'asc',
          })
          break

        case 'sort-desc':
          await updateTableSort({
            type: 'static-prop',
            propertyName: 'title',
            direction: 'desc',
          })
          break
      }

      setSending(undefined)
      close()
    },
    [sending, updateTableSort, close]
  )

  return (
    <MetadataContainer>
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            iconPath: mdiSortAlphabeticalAscending,
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
            iconPath: mdiSortAlphabeticalDescending,
            label: 'Sort Decending',
            spinning: sending === 'sort-desc',
            onClick: () => action('sort-desc'),
            disabled: sending != null,
          },
        }}
      />
    </MetadataContainer>
  )
}

export default TitleColumnSettingsContext
