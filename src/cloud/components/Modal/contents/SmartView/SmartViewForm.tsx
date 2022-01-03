import React, { useCallback, useState } from 'react'
import BorderSeparator from '../../../../../design/components/atoms/BorderSeparator'
import Button, {
  LoadingButton,
} from '../../../../../design/components/atoms/Button'
import ButtonGroup from '../../../../../design/components/atoms/ButtonGroup'
import Form from '../../../../../design/components/molecules/Form'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import styled from '../../../../../design/lib/styled'
import { SerializedQuery } from '../../../../interfaces/db/smartView'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import { EditableQuery } from './interfaces'
import SmartViewConditionRows from './SmartViewConditionRows'

interface SmmartViewFormProps {
  teamId: string
  action: 'Create' | 'Update'
  defaultName?: string
  defaultPrivate?: boolean
  defaultConditions: EditableQuery
  onSubmit: (body: { name: string; condition: SerializedQuery }) => void
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
  teamId,
  onCancel,
  onSubmit,
}: SmmartViewFormProps) => {
  const [name, setName] = useState(defaultName)
  const { translate } = useI18n()

  const [conditions, setConditions] = useState<EditableQuery>(defaultConditions)

  const updateName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value)
    },
    []
  )

  const submitForm: React.FormEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      onSubmit({
        name,
        condition: removeNullConditions(conditions),
      })
    },
    [onSubmit, name, conditions]
  )

  return (
    <Container>
      <h2 className='modal__heading'>
        {action === 'Create'
          ? translate(lngKeys.ModalsSmartViewCreateTitle)
          : translate(lngKeys.ModalsSmartViewEditTitle)}
      </h2>
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

  .modal__heading {
  }

  .privacy-row {
    margin-top: 0 !important;
    .form__row__items {
      align-items: center !important;
    }
  }

  .privacy-row__label {
    margin-top: 0;
  }
`

export default SmartViewForm

export function removeNullConditions(editable: EditableQuery): SerializedQuery {
  return JSON.parse(
    JSON.stringify(editable.filter((condition) => condition.type !== 'null'))
  )
}
