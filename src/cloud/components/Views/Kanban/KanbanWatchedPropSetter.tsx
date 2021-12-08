import React, { useState } from 'react'
import { useEffectOnce } from 'react-use'
import SuggestionSelect, {
  Suggestion,
} from '../../../../design/components/molecules/SuggestionSelect'
import {
  ListPropertySuggestionsRequestBody,
  ListPropertySuggestionsResponseBody,
} from '../../../api/teams/props'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { isPropType } from '../../../lib/props'
import { filterIter } from '../../../lib/utils/iterator'

interface KanbanWatchedPropSetterProps {
  view: SerializedView
  teamId: string
  prop: string
  setProp: (prop: string) => void
}

const KanbanWatchedPropSetter = ({
  prop,
  setProp,
  view,
  teamId,
}: KanbanWatchedPropSetterProps) => {
  const { fetchPropertySuggestionsApi } = useCloudApi()
  const [fetching, setFetching] = useState(true)
  const [value, setValue] = useState(prop)
  const [suggestions, setSuggestions] = useState<
    Record<string, Suggestion<string>[]>
  >({})

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
      if (!res.err) {
        setSuggestions({
          Suggestions: filterIter(
            (val) => isPropType(val.type),
            (res.data as ListPropertySuggestionsResponseBody).data
          ).map((data) => ({ name: data.name, value: data.name })),
        })
      } else {
        setSuggestions({})
      }
      setFetching(false)
    }
    fetchSuggestions()
  })

  return (
    <SuggestionSelect
      sending={fetching != null ? 'fetching' : undefined}
      value={value}
      onChange={setValue}
      onCreate={setProp}
      onSelect={setProp}
      suggestions={suggestions}
    />
  )
}

export default KanbanWatchedPropSetter
