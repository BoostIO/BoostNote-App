import { mdiCheck } from '@mdi/js'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Icon from '../../../../design/components/atoms/Icon'
import Spinner from '../../../../design/components/atoms/Spinner'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import styled from '../../../../design/lib/styled'
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
import { sortByAttributeAsc } from '../../../lib/utils/array'
import { filterIter } from '../../../lib/utils/iterator'

interface CalendarWatchedPropContextProps {
  view: SerializedView
  teamId: string
  watchedProp: {
    type: PropType
    name: string
  }
  updateWatchedProp: (prop: {
    type: PropType
    name: string
  }) => Promise<BulkApiActionRes | undefined>
}

interface PropertySuggestions {
  name: string
  type: PropType
  subType?: PropSubType
}

const CalendarWatchedPropContext = ({
  view,
  watchedProp,
  teamId,
  updateWatchedProp,
}: CalendarWatchedPropContextProps) => {
  const [fetching, setFetching] = useState(true)
  const [sending, setSending] = useState<string>()
  const [selected, setSelected] = useState(watchedProp)
  const { fetchPropertySuggestionsApi } = useCloudApi()
  const menuRef = useRef<HTMLDivElement>(null)
  const [suggestions, setSuggestions] = useState<PropertySuggestions[]>([])

  useEffectOnce(() => {
    fetchSuggestions()
  })

  const fetchSuggestions = useCallback(async () => {
    const body: ListPropertySuggestionsRequestBody = {
      team: teamId,
      propertyType: 'date',
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
  }, [
    teamId,
    fetchPropertySuggestionsApi,
    view.folderId,
    view.workspaceId,
    view.smartViewId,
  ])

  const orderedSuggestions = useMemo(() => {
    const fromChildren: PropertySuggestions[] = sortByAttributeAsc(
      'name',
      suggestions
    )

    const childrenSuggestionNames = fromChildren.map(
      (suggestion) => suggestion.name
    )
    const fromApp: PropertySuggestions[] = filterIter(
      (suggestion) =>
        suggestion.type === 'date' &&
        !childrenSuggestionNames.includes(suggestion.name),
      getDefaultColumnSuggestionsPerType()
    )
    return {
      fromChildren,
      fromApp,
    }
  }, [suggestions])

  const setNewWatchedProp = useCallback(
    async (prop: PropertySuggestions) => {
      if (sending != null) {
        return
      }

      setSending(prop.name)
      const res = await updateWatchedProp(prop)
      if (res != null && !res.err) {
        setSelected(prop)
      }
      setSending(undefined)
    },
    [sending, updateWatchedProp]
  )

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
            const isSelected = selected.name === propSuggestion.name
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
                    disabled: sending != null || isSelected,
                    spinning: sending === propSuggestion.name,
                    id: id,
                    onClick: () => setNewWatchedProp(propSuggestion),
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
            const isSelected = selected.name === propSuggestion.name
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
                    disabled: sending != null || isSelected,
                    spinning: sending === propSuggestion.name,
                    id: id,
                    onClick: () => setNewWatchedProp(propSuggestion),
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

export default CalendarWatchedPropContext
