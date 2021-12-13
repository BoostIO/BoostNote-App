import React, { useCallback, useState } from 'react'
import { ListPropertySuggestionsResponseBody } from '../../api/teams/props'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import {
  PropSubType,
  PropType,
  SerializedPropData,
} from '../../interfaces/db/props'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import { getInitialPropDataOfPropType } from '../../lib/props'
import PropRegisterModal from './PropRegisterModal'

interface PropSelectorModalProps {
  doc: SerializedDocWithSupplemental
  disallowedNames?: string[]
  addProp: (propName: string, propData: SerializedPropData) => void
}

const PropSelectorModal = ({
  disallowedNames = [],
  doc,
  addProp,
}: PropSelectorModalProps) => {
  const [sending, setSending] = useState<string>()
  const { fetchPropertySuggestionsApi } = useCloudApi()

  const fetchSuggestions = useCallback(async () => {
    const res = await fetchPropertySuggestionsApi({
      team: doc.teamId,
      doc: doc.id,
    })
    if (!res.err) {
      return (res.data as ListPropertySuggestionsResponseBody).data
    } else {
      return []
    }
  }, [fetchPropertySuggestionsApi, doc.teamId, doc.id])

  const addNewProp = useCallback(
    ({
      name,
      type,
      subType,
    }: {
      name: string
      type: PropType
      subType?: PropSubType
    }) => {
      if (sending != null) {
        return
      }

      setSending(getPropsAddFormUniqueName(name, type, subType))
      addProp(name, getInitialPropDataOfPropType(subType || type))
    },
    [addProp, sending]
  )

  const isNameValid = useCallback(
    (propName: string) => {
      const value = propName.trim()
      if (value === '') {
        return false
      }

      return !disallowedNames.some((prop) => prop === value)
    },
    [disallowedNames]
  )

  return (
    <PropRegisterModal
      suggestionsHeader='From Parent Folder'
      registerProp={addNewProp}
      fetchPropertySuggestions={fetchSuggestions}
      isNameValid={isNameValid}
    />
  )
}

function getPropsAddFormUniqueName(
  name: string,
  type: string,
  subType?: string
) {
  return `${name}-${type}-${subType || ''}`
}

export default PropSelectorModal
