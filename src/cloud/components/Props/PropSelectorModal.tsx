import React, { useCallback, useMemo, useState } from 'react'
import { ListPropertySuggestionsResponseBody } from '../../api/teams/props'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import {
  PropSubType,
  PropType,
  SerializedPropData,
} from '../../interfaces/db/props'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import { getInitialPropDataOfPropType } from '../../lib/props'
import PropsAddForm, { getPropsAddFormUniqueName } from './PropsAddForm'

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
  const [propName, setPropName] = useState('')
  const disallowedNamesSet = useMemo(() => new Set(disallowedNames), [
    disallowedNames,
  ])
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
    (name: string, type: PropType, subType?: PropSubType) => {
      if (sending != null) {
        return
      }

      setSending(getPropsAddFormUniqueName(name, type, subType))
      addProp(name, getInitialPropDataOfPropType(subType || type))
    },
    [addProp, sending]
  )

  const isColumnNameInvalid = useMemo(() => {
    const value = propName.trim()

    if (value === '') {
      return false
    }

    return disallowedNames.reduce((acc, val) => {
      if (value === val) {
        acc = true
      }
      return acc
    }, false)
  }, [disallowedNames, propName])

  return (
    <PropsAddForm
      allocatedNames={Array.from(disallowedNamesSet)}
      columnName={propName}
      setColumnName={setPropName}
      showDocPageForm={true}
      sending={sending}
      fetchPropertySuggestions={fetchSuggestions}
      addNewPropCol={addNewProp}
      isColumnNameInvalid={isColumnNameInvalid}
      addNewStaticCol={undefined}
    />
  )
}

export default PropSelectorModal
