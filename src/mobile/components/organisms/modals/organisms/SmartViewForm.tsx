import { mdiPlus } from '@mdi/js'
import React, { useCallback, useState } from 'react'
import { LoadingButton } from '../../../../../design/components/atoms/Button'
import Form from '../../../../../design/components/molecules/Form'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import styled from '../../../../../design/lib/styled'
import {
  UpdateSmartViewRequestBody,
  CreateSmartViewRequestBody,
} from '../../../../../cloud/api/teams/smartViews'
import { useI18n } from '../../../../../cloud/lib/hooks/useI18n'
import { lngKeys } from '../../../../../cloud/lib/i18n/types'
import MobileFormControl from '../../../atoms/MobileFormControl'
import BorderSeparator from '../../../../../design/components/atoms/BorderSeparator'
import {
  EditableCondition,
  EditableQuery,
} from '../../../../../cloud/components/Modal/contents/SmartView/interfaces'
import { SerializedQuery } from '../../../../../cloud/interfaces/db/smartView'
import ConditionItem from '../../../../../cloud/components/Modal/contents/SmartView/ConditionItem'

interface SmartViewFormProps {
  teamId: string
  action: 'Create' | 'Update'
  defaultName?: string
  defaultPrivate?: boolean
  defaultConditions: EditableQuery
  onSubmit: (
    body: CreateSmartViewRequestBody | UpdateSmartViewRequestBody
  ) => void
  buttonsAreDisabled?: boolean
}

const SmartViewForm = ({
  action,
  defaultName = '',
  defaultConditions,
  buttonsAreDisabled,
  teamId,
  onSubmit,
}: SmartViewFormProps) => {
  const [name, setName] = useState(defaultName)
  const { translate } = useI18n()

  const [secondaryConditions, setSecondaryConditions] = useState<EditableQuery>(
    defaultConditions
  )

  const updateName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value)
    },
    []
  )

  const insertSecondaryConditionByIndex = useCallback(
    (condition: EditableCondition, index: number) => {
      setSecondaryConditions((previousConditions) => {
        const newConditions = [...previousConditions]
        newConditions.splice(index + 1, 0, condition)
        return newConditions
      })
    },
    []
  )

  const removeSecondaryConditionByIndex = useCallback((index: number) => {
    setSecondaryConditions((previousConditions) => {
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
        condition: secondaryConditions as SerializedQuery,
      })
    },
    [onSubmit, name, secondaryConditions]
  )

  return (
    <Container>
      <h2 className='modal__heading'>
        {action === 'Create'
          ? translate(lngKeys.ModalsSmartViewCreateTitle)
          : translate(lngKeys.ModalsSmartViewEditTitle)}
      </h2>
      <Form className='smart__folder__form' onSubmit={submitForm}>
        <FormRow
          fullWidth={true}
          row={{
            title: translate(lngKeys.GeneralTitle),
            items: [
              { type: 'input', props: { value: name, onChange: updateName } },
            ],
          }}
        />
        <FormRow
          fullWidth={true}
          row={{
            items: [{ type: 'node', element: <BorderSeparator /> }],
          }}
        />

        <div className='smart__folder__form__scrollable'>
          <FormRow fullWidth={true}>
            <FormRowItem
              className='form__row__item--shrink'
              item={{
                type: 'button',
                props: {
                  iconPath: mdiPlus,
                  variant: 'link',
                  label: '',
                  onClick: () =>
                    insertSecondaryConditionByIndex(
                      { type: 'null', rule: 'and' },
                      0
                    ),
                },
              }}
            />
          </FormRow>

          {secondaryConditions.map((condition, index) => {
            const updateSecondaryCondition = (
              updatedCondition: EditableCondition
            ) => {
              setSecondaryConditions((previousConditions) => {
                const newSecondaryConditions = [...previousConditions]
                newSecondaryConditions.splice(index, 1, updatedCondition)
                return newSecondaryConditions
              })
            }

            const removeCondition = () => {
              removeSecondaryConditionByIndex(index)
            }

            return (
              <ConditionItem
                key={index}
                teamId={teamId}
                condition={condition}
                update={updateSecondaryCondition}
                remove={removeCondition}
                hideConditionRuleType={index === 0}
              />
            )
          })}
        </div>

        <FormRow
          fullWidth={true}
          row={{
            items: [{ type: 'node', element: <BorderSeparator /> }],
          }}
        />

        <MobileFormControl>
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
        </MobileFormControl>
      </Form>
    </Container>
  )
}

const Container = styled.div`
  margin: ${({ theme }) => theme.sizes.spaces.df}px;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow-x: hidden;
  overflow-y: auto;
  .modal__heading,
  .form__row__item {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .smart__folder__form__scrollable {
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 12px;
  }

  .form__row__item.form__row__item--shrink {
    flex: 0 1 0% !important;
  }

  .modal__heading {
  }

  .form__select__control {
    min-width: 150px !important;
  }
`

export default SmartViewForm
