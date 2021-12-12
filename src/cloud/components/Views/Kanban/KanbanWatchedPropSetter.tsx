import { mdiCheck } from '@mdi/js'
import React, { useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Icon from '../../../../design/components/atoms/Icon'
import Spinner from '../../../../design/components/atoms/Spinner'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import styled from '../../../../design/lib/styled'
import { sortByAttributeAsc } from '../../../../design/lib/utils/array'
import {
  ListPropertySuggestionsRequestBody,
  ListPropertySuggestionsResponseBody,
} from '../../../api/teams/props'
import { PropSubType, PropType } from '../../../interfaces/db/props'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import {
  getDefaultColumnSuggestionsPerType,
  getIconPathOfPropType,
  isPropType,
} from '../../../lib/props'
import { filterIter } from '../../../lib/utils/iterator'

interface KanbanWatchedPropSetterProps {
  view: SerializedView
  teamId: string
  prop: string
  setProp: (prop: string) => void
}

interface PropertySuggestions {
  name: string
  type: PropType
  subType?: PropSubType
}

const KanbanWatchedPropSetter = ({
  prop,
  setProp,
  view,
  teamId,
}: KanbanWatchedPropSetterProps) => {
  const [fetching, setFetching] = useState(true)
  const { fetchPropertySuggestionsApi } = useCloudApi()
  const menuRef = useRef<HTMLDivElement>(null)
  const [suggestions, setSuggestions] = useState<PropertySuggestions[]>([])

  useEffectOnce(() => {
    const fetchSuggestions = async () => {
      const body: ListPropertySuggestionsRequestBody = {
        team: teamId,
        propertyType: 'status',
      }
      if (view.folderId != null) {
        body.folder = view.folderId
      }

      if (view.workspaceId != null) {
        body.workspace = view.workspaceId
      }

      if (view.smartViewId != null) {
        body.smartView = view.smartViewId
      }

      const res = await fetchPropertySuggestionsApi(body)
      if (res != null && !res.err) {
        setSuggestions(
          filterIter(
            (val) => isPropType(val.type),
            (res.data as ListPropertySuggestionsResponseBody).data
          ) as any
        )
      } else {
        setSuggestions([])
      }
      setFetching(false)
    }
    fetchSuggestions()
  })

  const orderedSuggestions = useMemo(() => {
    const fromChildren = sortByAttributeAsc('name', suggestions)

    const childrenSuggestionNames = fromChildren.map(
      (suggestion) => suggestion.name
    )
    const fromApp = filterIter(
      (suggestion) =>
        suggestion.type === 'status' &&
        !childrenSuggestionNames.includes(suggestion.name),
      getDefaultColumnSuggestionsPerType()
    )
    return {
      fromChildren,
      fromApp,
    }
  }, [suggestions])

  return (
    <Container ref={menuRef}>
      {fetching && <Spinner />}
      {orderedSuggestions.fromChildren.length > 0 && (
        <>
          <MetadataContainerRow
            row={{
              type: 'header',
              content: `From Child Docs`,
            }}
          />
          {orderedSuggestions.fromChildren.map((propSuggestion) => {
            const id = `fc-${propSuggestion.name}`
            const isSelected = prop === propSuggestion.name
            return (
              <MetadataContainerRow
                key={id}
                row={{
                  type: 'button',
                  props: {
                    label: (
                      <Flexbox justifyContent='space-between'>
                        <span>{propSuggestion.name}</span>
                        {isSelected && <Icon path={mdiCheck} />}
                      </Flexbox>
                    ),
                    iconPath: getIconPathOfPropType(propSuggestion.type),
                    id: id,
                    onClick: () => setProp(propSuggestion.name),
                    disabled: isSelected,
                  },
                }}
              />
            )
          })}
        </>
      )}
      {orderedSuggestions.fromApp.length > 0 && (
        <>
          <MetadataContainerRow
            row={{
              type: 'header',
              content: `Suggested`,
            }}
          />
          {orderedSuggestions.fromApp.map((propSuggestion) => {
            const id = `suggested-${propSuggestion.name}`
            const isSelected = prop === propSuggestion.name
            return (
              <MetadataContainerRow
                key={id}
                row={{
                  type: 'button',
                  props: {
                    label: (
                      <Flexbox justifyContent='space-between'>
                        <span>{propSuggestion.name}</span>
                        {isSelected && <Icon path={mdiCheck} />}
                      </Flexbox>
                    ),
                    iconPath: getIconPathOfPropType(propSuggestion.type),
                    disabled: isSelected,
                    id: id,
                    onClick: () => setProp(propSuggestion.name),
                  },
                }}
              />
            )
          })}
        </>
      )}
    </Container>
  )
}

const Container = styled(MetadataContainer)`
  .button__label {
    width: 100%;

    .flexbox {
      flex: 1 1 auto;
    }
  }
`

export default KanbanWatchedPropSetter
