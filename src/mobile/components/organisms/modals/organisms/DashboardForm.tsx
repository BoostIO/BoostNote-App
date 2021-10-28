import { mdiPlus } from '@mdi/js'
import React, { useCallback, useState } from 'react'
import { LoadingButton } from '../../../../../design/components/atoms/Button'
import Switch from '../../../../../design/components/atoms/Switch'
import Form from '../../../../../design/components/molecules/Form'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import styled from '../../../../../design/lib/styled'
import {
  UpdateDashboardRequestBody,
  CreateDashboardRequestBody,
} from '../../../../../cloud/api/teams/dashboard'
import { useI18n } from '../../../../../cloud/lib/hooks/useI18n'
import { lngKeys } from '../../../../../cloud/lib/i18n/types'
import MobileFormControl from '../../../atoms/MobileFormControl'
import BorderSeparator from '../../../../../design/components/atoms/BorderSeparator'
import {
  EditableCondition,
  EditableQuery,
} from '../../../../../cloud/components/Modal/contents/Dashboard/interfaces'
import { SerializedQuery } from '../../../../../cloud/interfaces/db/dashboard'
import ConditionItem from '../../../../../cloud/components/Modal/contents/Dashboard/ConditionItem'

interface DashboardFormProps {
  action: 'Create' | 'Update'
  defaultName?: string
  defaultPrivate?: boolean
  defaultConditions: EditableQuery
  onSubmit: (
    body: CreateDashboardRequestBody | UpdateDashboardRequestBody
  ) => void
  buttonsAreDisabled?: boolean
}

const DashboardForm = ({
  action,
  defaultName = '',
  defaultPrivate = true,
  defaultConditions,
  buttonsAreDisabled,
  onSubmit,
}: DashboardFormProps) => {
  const [name, setName] = useState(defaultName)
  const [makingPrivate, setMakingPrivate] = useState(defaultPrivate)
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
        private: makingPrivate,
      })
    },
    [onSubmit, makingPrivate, name, secondaryConditions]
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
                  variant: 'secondary',
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
                condition={condition}
                update={updateSecondaryCondition}
                remove={removeCondition}
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
