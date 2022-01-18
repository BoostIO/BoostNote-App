import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DocLabelSelect from './DocLabelSelect'
import DocAssigneeSelect from './DocAssigneeSelect'
import DocDateSelect from './DocDateSelect'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import { EditableCondition, Kind } from './interfaces'
import FormInput from '../../../../../design/components/molecules/Form/atoms/FormInput'
import {
  DateCondition,
  PropCondition,
} from '../../../../interfaces/db/smartView'
import TimePeriodForm from './TimePeriodForm'
import { usePrevious } from '../../../../../lib/hooks'
import { useCloudApi } from '../../../../lib/hooks/useCloudApi'
import {
  ListPropertySuggestionsRequestBody,
  ListPropertySuggestionsResponseBody,
} from '../../../../api/teams/props'
import FormSelect, {
  FormSelectGroupOption,
  FormSelectOption,
} from '../../../../../design/components/molecules/Form/atoms/FormSelect'
import { ConditionNameSuggestionsPerTypeOrSubType } from '../../../../lib/props'
import StatusSelect from './StatusSelect'
import { useEffectOnce } from 'react-use'

interface ConditionValueControlProps {
  teamId: string
  condition: EditableCondition
  update: (newCondition: EditableCondition) => void
}

const ConditionValueControl = ({
  teamId,
  condition,
  update,
}: ConditionValueControlProps) => {
  switch (condition.type) {
    case 'creation_date':
    case 'update_date':
      const updateDateValue = (dateConditionValue: DateCondition | null) => {
        update({
          ...condition,
          value: dateConditionValue || { type: 'relative', period: 0 },
        })
      }
      return (
        <FormRowItem>
          <DocDateSelect value={condition.value} update={updateDateValue} />
        </FormRowItem>
      )
    case 'label':
      const updateLabels = (newLabel: string[]) => {
        update({
          ...condition,
          value: newLabel,
        })
      }
      return (
        <FormRowItem>
          <DocLabelSelect value={condition.value} update={updateLabels} />
        </FormRowItem>
      )
    case 'prop':
      const updateValue = (
        value: Partial<Kind<EditableCondition, 'prop'>['value']>
      ) => {
        update({
          ...condition,
          value: Object.assign(condition.value, value) as PropCondition,
        })
      }

      return (
        <PropConditionValueControl
          condition={condition.value}
          updateValue={updateValue}
          teamId={teamId}
        />
      )
    case 'null':
    default:
      return null
  }
}

const PropConditionValueControl = ({
  condition,
  teamId,
  updateValue,
}: {
  condition: PropCondition
  teamId: string
  updateValue: (
    value: Partial<Kind<EditableCondition, 'prop'>['value']>
  ) => void
}) => {
  const previousPropType = usePrevious(condition.type)
  const { sendingMap, fetchPropertySuggestionsApi } = useCloudApi()
  const [suggestions, setSuggestions] = useState<string[]>([])

  const fetchProperties = useCallback(
    async (body: ListPropertySuggestionsRequestBody) => {
      const res = await fetchPropertySuggestionsApi(body)
      if (!res.err) {
        setSuggestions(
          (res.data as ListPropertySuggestionsResponseBody).data
            .filter((property) => property.type === body.propertyType)
            .map((property) => property.name)
        )
      } else {
        setSuggestions([])
      }
    },
    [fetchPropertySuggestionsApi]
  )

  useEffectOnce(() => {
    fetchProperties(
      Object.assign(
        {
          team: teamId,
          propertyType: condition.type,
        },
        condition.type === 'json'
          ? {
              jsonPropertyType: condition.value.type,
            }
          : {}
      )
    )
  })

  useEffect(() => {
    if (previousPropType !== condition.type) {
      fetchProperties(
        Object.assign(
          {
            team: teamId,
            propertyType: condition.type,
          },
          condition.type === 'json'
            ? {
                jsonPropertyType: condition.value.type,
              }
            : {}
        )
      )
    }
  }, [condition, previousPropType, teamId, fetchProperties])

  const suggestionOptions = useMemo(() => {
    const options: (FormSelectGroupOption | FormSelectOption)[] = []
    const defaultSuggestions = (
      ConditionNameSuggestionsPerTypeOrSubType[
        condition.type === 'json' && condition.value.type === 'timeperiod'
          ? 'timeperiod'
          : condition.type
      ] || []
    ).filter((option) => {
      return !suggestions.includes(option)
    })

    if (suggestions.length > 0) {
      options.push({
        label: 'From Props',
        options: suggestions.map((suggestion) => {
          return { label: suggestion, value: suggestion }
        }),
      })
    }

    if (defaultSuggestions.length > 0) {
      options.push({
        label: 'Suggestions',
        options: defaultSuggestions.map((suggestion) => {
          return { label: suggestion, value: suggestion }
        }),
      })
    }

    return options
  }, [condition, suggestions])

  return (
    <>
      <FormRowItem flex='0 0 160px'>
        <FormSelect
          options={suggestionOptions}
          value={{ label: condition.name, value: condition.name }}
          onChange={(val) => updateValue({ name: val.value })}
          isLoading={sendingMap.get('properties') === 'suggestions'}
          placeholder='Property name..'
        />
      </FormRowItem>
      <FormRowItem flex='1 1 auto'>
        {condition.type === 'user' && (
          <DocAssigneeSelect
            value={condition.value}
            update={(value) => updateValue({ value })}
            isDisabled={
              condition.name.trim() === '' ||
              sendingMap.get('properties') === 'suggestions'
            }
          />
        )}
        {condition.type === 'status' && (
          <StatusSelect
            value={condition.value}
            update={(value) => updateValue({ value })}
            placeholder='Property value..'
            isDisabled={
              condition.name.trim() === '' ||
              sendingMap.get('properties') === 'suggestions'
            }
          />
        )}
        {condition.type === 'number' && (
          <FormInput
            type='number'
            value={condition.value.toString()}
            onChange={(ev) => updateValue({ value: parseInt(ev.target.value) })}
            placeholder='Property value..'
            disabled={
              condition.name.trim() === '' ||
              sendingMap.get('properties') === 'suggestions'
            }
          />
        )}
        {condition.type === 'json' && condition.value.type === 'timeperiod' && (
          <TimePeriodForm
            disabled={
              condition.name.trim() === '' ||
              sendingMap.get('properties') === 'suggestions'
            }
            period={condition.value.value}
            updatePeriod={(period) => {
              updateValue({
                value: { type: 'timeperiod', value: period },
              })
            }}
          />
        )}
        {condition.type === 'date' && (
          <DocDateSelect
            value={condition.value}
            usePortal={false}
            update={(value) => {
              updateValue({
                value: value == null ? { type: 'relative', period: 0 } : value,
              })
            }}
            disabled={
              condition.name.trim() === '' ||
              sendingMap.get('properties') === 'suggestions'
            }
          />
        )}
      </FormRowItem>
    </>
  )
}

export default ConditionValueControl
