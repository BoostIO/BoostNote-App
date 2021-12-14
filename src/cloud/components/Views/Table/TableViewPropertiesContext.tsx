import { mdiEyeOffOutline, mdiPlus } from '@mdi/js'
import React, { useMemo, useState } from 'react'
import { useCallback } from 'react'
import { LoadingButton } from '../../../../design/components/atoms/Button'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import styled from '../../../../design/lib/styled'
import { sortByAttributeAsc } from '../../../../design/lib/utils/array'
import {
  ListPropertySuggestionsRequestBody,
  ListPropertySuggestionsResponseBody,
} from '../../../api/teams/props'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { getIconPathOfPropType } from '../../../lib/props'
import { getArrayFromRecord } from '../../../lib/utils/array'
import {
  Column,
  getGeneratedIdFromColId,
  getInsertedColumnOrder,
  isColumn,
  isPropCol,
  makeTablePropColId,
  ViewTableData,
} from '../../../lib/views/table'
import PropRegisterModal from '../../Props/PropRegisterModal'

interface TableViewPropertiesContextProps {
  view: SerializedView<ViewTableData>
  teamId: string
  columns?: Record<string, Column>
  currentUserIsCoreMember?: boolean
  setColumns: (
    cols: Record<string, Column>
  ) => Promise<BulkApiActionRes | undefined>
}

const TableViewPropertiesContext = ({
  view,
  teamId,
  columns = {},
  currentUserIsCoreMember,
  setColumns,
}: TableViewPropertiesContextProps) => {
  const [formState, setFormState] = useState<'list' | 'add'>('list')
  const [props, setProps] = useState<Record<string, Column>>(columns)
  const [sending, setSending] = useState<string>()
  const { fetchPropertySuggestionsApi } = useCloudApi()

  const addPropertyCallback = useCallback(
    async (prop: Omit<Column, 'id' | 'order'>) => {
      if (!isColumn(prop)) {
        return
      }

      const tableGeneratedProps = {
        id: isPropCol(prop)
          ? makeTablePropColId(prop.name, prop.type, prop.subType)
          : makeTablePropColId(prop.name, prop.prop),
        order: getInsertedColumnOrder(props),
      }

      const newProp = Object.assign({}, prop, tableGeneratedProps)
      setSending(`${newProp.id}-add`)
      const newProps = Object.assign({}, props, { [newProp.id]: newProp })
      const res = await setColumns(newProps)
      if (res != null) {
        setProps(newProps)
        setFormState('list')
      }
      setSending(undefined)
    },
    [setColumns, props]
  )

  const removePropertyCallback = useCallback(
    async (id: string) => {
      setSending(`${id}-delete`)
      const newProps = Object.assign({}, props)
      delete newProps[id]
      const res = await setColumns(newProps)
      if (res != null) {
        setProps(newProps)
      }
      setSending(undefined)
    },
    [setColumns, props]
  )

  const orderedProps = useMemo(() => {
    return sortByAttributeAsc('order', getArrayFromRecord(props))
  }, [props])

  const fetchSuggestions = useCallback(async () => {
    const body: ListPropertySuggestionsRequestBody = { team: teamId }
    if (view.folderId != null) {
      body.folder = view.folderId
    }

    if (view.workspaceId != null) {
      body.workspace = view.workspaceId
    }

    if (view.smartViewId != null) {
      return []
    }

    const res = await fetchPropertySuggestionsApi(body)
    if (!res.err) {
      return (res.data as ListPropertySuggestionsResponseBody).data
    } else {
      return []
    }
  }, [
    teamId,
    fetchPropertySuggestionsApi,
    view.folderId,
    view.workspaceId,
    view.smartViewId,
  ])

  const isNameValid = useCallback(
    (name: string) => {
      const value = name.trim()
      if (value === '') {
        return false
      }
      return !Object.values(props).some((prop) => prop.name === value)
    },
    [props]
  )

  if (formState === 'add') {
    return (
      <PropRegisterModal
        goBack={() => setFormState('list')}
        registerProp={addPropertyCallback}
        registerStaticProp={addPropertyCallback}
        fetchPropertySuggestions={fetchSuggestions}
        isNameValid={isNameValid}
      />
    )
  }

  return (
    <Container>
      {orderedProps.length > 0 && (
        <>
          <MetadataContainerRow
            row={{ type: 'header', content: 'Properties' }}
          />
          {orderedProps.map((col, i) => (
            <MetadataContainerRow
              key={`prop-${col.name}-${i}`}
              row={{
                type: 'content',
                icon: getIconPathOfPropType(col.id.split(':').pop() as any),
                label: col.name,
                content: currentUserIsCoreMember ? (
                  <Flexbox justifyContent='flex-end'>
                    <LoadingButton
                      variant='icon'
                      disabled={sending != null}
                      spinning={sending === `${col.id}-delete`}
                      iconPath={mdiEyeOffOutline}
                      onClick={() => removePropertyCallback(col.id)}
                      id={`prop-active-${getGeneratedIdFromColId(col.id)}`}
                      size='sm'
                    />
                  </Flexbox>
                ) : null,
              }}
            />
          ))}
        </>
      )}
      {currentUserIsCoreMember && (
        <>
          {orderedProps.length > 0 && <MetadataContainerBreak />}
          <MetadataContainerRow
            row={{
              type: 'button',
              props: {
                id: 'table-props-add',
                variant: 'transparent',
                iconPath: mdiPlus,
                label: 'New Column',
                onClick: () => setFormState('add'),
              },
            }}
          />
        </>
      )}
    </Container>
  )
}

const Container = styled(MetadataContainer)``

export default TableViewPropertiesContext
