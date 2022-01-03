import { capitalize } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import BorderSeparator from '../../../../../design/components/atoms/BorderSeparator'
import Button, {
  LoadingButton,
} from '../../../../../design/components/atoms/Button'
import ButtonGroup from '../../../../../design/components/atoms/ButtonGroup'
import Icon from '../../../../../design/components/atoms/Icon'
import Form from '../../../../../design/components/molecules/Form'
import { FormSelectOption } from '../../../../../design/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import styled from '../../../../../design/lib/styled'
import { SerializedQuery } from '../../../../interfaces/db/smartView'
import { SupportedViewTypes } from '../../../../interfaces/db/view'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import { getIconPathOfViewType } from '../../../../lib/views'
import { EditableQuery } from './interfaces'
import SmartViewConditionRows from './SmartViewConditionRows'

interface SmartViewFormProps {
  teamId: string
  action: 'Create' | 'Update'
  defaultName?: string
  defaultPrivate?: boolean
  defaultConditions: EditableQuery
  defaultViewType?: SupportedViewTypes
  onSubmit: (body: {
    name: string
    condition: SerializedQuery
    view?: SupportedViewTypes
  }) => void
  onCancel?: () => void
  buttonsAreDisabled?: boolean
  showOnlyConditions?: boolean
}

const SmartViewForm = ({
  action,
  defaultName = '',
  defaultConditions,
  buttonsAreDisabled,
  showOnlyConditions,
  defaultViewType,
  teamId,
  onCancel,
  onSubmit,
}: SmartViewFormProps) => {
  const [name, setName] = useState(defaultName)
  const { translate } = useI18n()

  const [conditions, setConditions] = useState<EditableQuery>(defaultConditions)
  const [viewType, setViewType] = useState<FormSelectOption | undefined>(
    defaultViewType != null
      ? getFormOptionFromViewType(defaultViewType)
      : undefined
  )

  const viewTypeOptions: FormSelectOption[] = useMemo(() => {
    return ([
      'list',
      'table',
      'kanban',
      'calendar',
    ] as SupportedViewTypes[]).map((type) => getFormOptionFromViewType(type))
  }, [])

  const updateName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value)
    },
    []
  )

  const submitForm: React.FormEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      const body: any = {
        name,
        condition: removeNullConditions(conditions),
      }
      if (viewType != null) {
        body.view = viewType.value
      }
      onSubmit(body)
    },
    [onSubmit, name, conditions, viewType]
  )

  return (
    <Container>
      <Form className='smart__folder__form' onSubmit={submitForm}>
        {!showOnlyConditions && (
          <FormRow
            fullWidth={true}
            row={{
              title: translate(lngKeys.GeneralName),
              items: [
                { type: 'input', props: { value: name, onChange: updateName } },
              ],
            }}
          />
        )}

        {!showOnlyConditions && viewType != null && (
          <FormRow
            fullWidth={true}
            row={{
              title: 'View',
              items: [
                {
                  type: 'select',
                  props: {
                    value: viewType,
                    onChange: (val) => setViewType(val),
                    options: viewTypeOptions,
                  },
                },
              ],
            }}
          />
        )}

        {showOnlyConditions && <FormRow row={{ title: 'Filters' }} />}
        <SmartViewConditionRows
          teamId={teamId}
          conditions={conditions}
          setConditions={setConditions}
        />

        <FormRow
          fullWidth={true}
          row={{
            items: [{ type: 'node', element: <BorderSeparator /> }],
          }}
        />
        <FormRow>
          <ButtonGroup layout='spread'>
            {onCancel != null && (
              <Button
                variant='secondary'
                onClick={onCancel}
                disabled={buttonsAreDisabled}
              >
                {translate(lngKeys.GeneralCancel)}
              </Button>
            )}
            <LoadingButton
              spinning={buttonsAreDisabled}
              type='submit'
              variant='primary'
              disabled={buttonsAreDisabled}
            >
              {action === 'Create'
                ? translate(lngKeys.GeneralCreate)
                : translate(lngKeys.GeneralUpdateVerb)}
            </LoadingButton>
          </ButtonGroup>
        </FormRow>
      </Form>
    </Container>
  )
}

const Container = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  .modal__heading,
  .form__row__item {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

export default SmartViewForm

function removeNullConditions(editable: EditableQuery): SerializedQuery {
  return JSON.parse(
    JSON.stringify(editable.filter((condition) => condition.type !== 'null'))
  )
}

function getFormOptionFromViewType(type: SupportedViewTypes) {
  const icon = getIconPathOfViewType(type)
  return {
    label: (
      <FormOptionContainer>
        {icon != null && <Icon path={icon} className='option__icon' />}
        <span className='option__label'>{capitalize(type)}</span>
      </FormOptionContainer>
    ),
    value: type,
  }
}

const FormOptionContainer = styled.div`
  display: flex;
  align-items: center;
  .option__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`
