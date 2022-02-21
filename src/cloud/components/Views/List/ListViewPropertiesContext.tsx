import { mdiEyeOffOutline, mdiPlus } from '@mdi/js'
import React, { useMemo, useState } from 'react'
import { useCallback } from 'react'
import { LoadingButton } from '../../../../design/components/atoms/Button'
import EllipsisText from '../../../../design/components/atoms/EllipsisText'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import styled from '../../../../design/lib/styled'
import {
  ListPropertySuggestionsRequestBody,
  ListPropertySuggestionsResponseBody,
} from '../../../api/teams/props'
import { UpdateViewResponseBody } from '../../../api/teams/views'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { getIconPathOfPropType } from '../../../lib/props'
import {
  ListViewProp,
  getGeneratedIdFromListViewPropId,
  getInsertionOrderForListViewProp,
  isListViewProp,
  isListViewProperty,
  makeListViewPropId,
  ViewListData,
  sortListViewProps,
} from '../../../lib/views/list'
import PropRegisterModal from '../../Props/PropRegisterModal'

interface ListViewPropertiesContextProps {
  view: SerializedView<ViewListData>
  teamId: string
  properties?: Record<string, ListViewProp>
  isViewEditable?: boolean
  setProperties: (
    view: SerializedView,
    props: Record<string, ListViewProp>
  ) => Promise<BulkApiActionRes | undefined>
}

const ListViewPropertiesContext = ({
  view: currentView,
  teamId,
  properties = {},
  isViewEditable,
  setProperties,
}: ListViewPropertiesContextProps) => {
  const [view, setView] = useState(currentView)
  const [formState, setFormState] = useState<'list' | 'add'>('list')
  const [props, setProps] = useState<Record<string, ListViewProp>>(properties)
  const [sending, setSending] = useState<string>()
  const { fetchPropertySuggestionsApi } = useCloudApi()

  const addPropertyCallback = useCallback(
    async (prop: Omit<ListViewProp, 'id' | 'order'>) => {
      if (!isListViewProperty(prop)) {
        return
      }

      const listGeneratedProps = {
        id: isListViewProp(prop)
          ? makeListViewPropId(prop.name, prop.type, prop.subType)
          : makeListViewPropId(prop.name, prop.prop),
        order: getInsertionOrderForListViewProp(props),
      }

      const newProp = Object.assign({}, prop, listGeneratedProps)
      setSending(`${newProp.id}-add`)
      const newProps = Object.assign({}, props, { [newProp.id]: newProp })
      const res = await setProperties(view, newProps)
      if (res != null && !res.err) {
        setProps(newProps)
        setFormState('list')
        setView((res.data as UpdateViewResponseBody).data)
      }
      setSending(undefined)
    },
    [setProperties, props, view]
  )

  const removePropertyCallback = useCallback(
    async (id: string) => {
      setSending(`${id}-delete`)
      const newProps = Object.assign({}, props)
      delete newProps[id]
      const res = await setProperties(view, newProps)
      if (res != null) {
        setProps(newProps)
      }
      setSending(undefined)
    },
    [setProperties, props, view]
  )

  const orderedProps = useMemo(() => {
    return sortListViewProps(props)
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
          {orderedProps.map((prop, i) => (
            <MetadataContainerRow
              key={`prop-${prop.name}-${i}`}
              row={{
                type: 'content',
                icon: getIconPathOfPropType(prop.id.split(':').pop() as any),
                label: <EllipsisText>{prop.name}</EllipsisText>,
                content: isViewEditable ? (
                  <Flexbox justifyContent='flex-end'>
                    <LoadingButton
                      variant='icon'
                      disabled={sending != null}
                      spinning={sending === `${prop.id}-delete`}
                      iconPath={mdiEyeOffOutline}
                      onClick={() => removePropertyCallback(prop.id)}
                      id={`prop-active-${getGeneratedIdFromListViewPropId(
                        prop.id
                      )}`}
                      size='sm'
                    />
                  </Flexbox>
                ) : null,
              }}
            />
          ))}
        </>
      )}
      {isViewEditable && (
        <>
          {orderedProps.length > 0 && <MetadataContainerBreak />}
          <MetadataContainerRow
            row={{
              type: 'button',
              props: {
                id: 'list-props-add',
                variant: 'transparent',
                iconPath: mdiPlus,
                label: 'New property',
                onClick: () => setFormState('add'),
              },
            }}
          />
        </>
      )}
    </Container>
  )
}

const Container = styled(MetadataContainer)`
  .metadata__label {
    flex: 1 1 auto;
  }
  .metadata__content {
    flex: 0 0 auto;
  }
`

export default ListViewPropertiesContext
