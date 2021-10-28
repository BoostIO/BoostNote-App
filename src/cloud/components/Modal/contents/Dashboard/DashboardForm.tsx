import { mdiPlus } from '@mdi/js'
import React, { useCallback, useState } from 'react'
import BorderSeparator from '../../../../../design/components/atoms/BorderSeparator'
import Button, {
  LoadingButton,
} from '../../../../../design/components/atoms/Button'
import ButtonGroup from '../../../../../design/components/atoms/ButtonGroup'
import Switch from '../../../../../design/components/atoms/Switch'
import Form from '../../../../../design/components/molecules/Form'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import styled from '../../../../../design/lib/styled'
import {
  UpdateDashboardRequestBody,
  CreateDashboardRequestBody,
} from '../../../../api/teams/dashboard'
import { SerializedQuery } from '../../../../interfaces/db/dashboard'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import { EditableCondition, EditableQuery } from './interfaces'
import ConditionItem from './SecondaryConditionItem'

interface DashboardFormProps {
  action: 'Create' | 'Update'
  defaultName?: string
  defaultPrivate?: boolean
  defaultConditions: EditableQuery
  onSubmit: (
    body: CreateDashboardRequestBody | UpdateDashboardRequestBody
  ) => void
  onCancel?: () => void
  buttonsAreDisabled?: boolean
}

const DashboardForm = ({
  action,
  defaultName = '',
  defaultPrivate = true,
  defaultConditions,
  buttonsAreDisabled,
  onCancel,
  onSubmit,
}: DashboardFormProps) => {
  const [name, setName] = useState(defaultName)
  const [makingPrivate, setMakingPrivate] = useState(defaultPrivate)
  const { translate } = useI18n()

  const [conditions, setConditions] = useState<EditableQuery>(defaultConditions)

  const updateName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value)
    },
    []
  )

  const insertConditionByIndex = useCallback(
    (condition: EditableCondition, index: number) => {
      setConditions((previousConditions) => {
        const newConditions = [...previousConditions]
        newConditions.splice(index + 1, 0, condition)
        return newConditions
      })
    },
    []
  )

  const removeConditionByIndex = useCallback((index: number) => {
    setConditions((previousConditions) => {
      const newConditions = [...previousConditions]
      newConditions.splice(index, 1)
      return newConditions
    })
  }, [])

  const submitForm: React.FormEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      onSubmit({
        name,
        condition: removeNullConditions(conditions),
        private: makingPrivate,
      })
    },
    [onSubmit, makingPrivate, name, conditions]
  )

  return (
    <Container>
      <h2 className='modal__heading'>
        {action === 'Create'
          ? translate(lngKeys.ModalsDashboardCreateTitle)
          : translate(lngKeys.ModalsDashboardEditTitle)}
      </h2>
      <Form className='smart__folder__form' onSubmit={submitForm}>
        <FormRow
          fullWidth={true}
          row={{
            title: translate(lngKeys.GeneralName),
            items: [
              { type: 'input', props: { value: name, onChange: updateName } },
            ],
          }}
        />
        {conditions.map((condition, index) => {
          const updateCondition = (
            updatedSecondaryCondition: EditableCondition
          ) => {
            setConditions((previousConditions) => {
              const newSecondaryConditions = [...previousConditions]
              newSecondaryConditions.splice(index, 1, updatedSecondaryCondition)
              return newSecondaryConditions
            })
          }

          const insertConditionNext = () => {
            insertConditionByIndex({ type: 'null', rule: 'and' }, index)
          }

          const removeCondition = () => {
            removeConditionByIndex(index)
          }

          return (
            <ConditionItem
              key={index}
              condition={condition}
              update={updateCondition}
              addNext={insertConditionNext}
              remove={removeCondition}
            />
          )
        })}

        <FormRow>
          <FormRowItem
            item={{
              type: 'button',
              props: {
                iconPath: mdiPlus,
                variant: 'transparent',
                label: 'Add a filter',
                onClick: () =>
                  insertConditionByIndex({ type: 'null', rule: 'and' }, 0),
              },
            }}
          />
        </FormRow>

        <FormRow
          fullWidth={true}
          row={{
            items: [{ type: 'node', element: <BorderSeparator /> }],
          }}
        />

        <FormRow fullWidth={true} className='privacy-row'>
          <FormRowItem>
            <div>
              <h3 className='privacy-row__label'>
                {translate(lngKeys.ModalsWorkspaceMakePrivate)}
              </h3>
              <p>
                {makingPrivate ? (
                  <>{translate(lngKeys.ModalsDashboardPrivateDisclaimer)}</>
                ) : (
                  <>{translate(lngKeys.ModalsDashboardPublicDisclaimer)}</>
                )}
              </p>
            </div>
          </FormRowItem>
          <FormRowItem className='form__row__item--shrink'>
            <Switch
              id='shared-custom-switch'
              checked={makingPrivate}
              onChange={(checked) => {
                setMakingPrivate(checked)
              }}
              height={20}
              width={30}
              handleSize={14}
            />
          </FormRowItem>
        </FormRow>
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

export default DashboardForm

function removeNullConditions(editable: EditableQuery): SerializedQuery {
  return JSON.parse(
    JSON.stringify(editable.filter((condition) => condition.type !== 'null'))
  )
}
