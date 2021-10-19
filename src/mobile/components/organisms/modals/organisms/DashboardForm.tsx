import { mdiPlus } from '@mdi/js'
import { TFunction } from 'i18next'
import React, { useCallback, useState } from 'react'
import { LoadingButton } from '../../../../../design/components/atoms/Button'
import Switch from '../../../../../design/components/atoms/Switch'
import Form from '../../../../../design/components/molecules/Form'
import { FormSelectOption } from '../../../../../design/components/molecules/Form/atoms/FormSelect'
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
import { EditibleSecondaryCondition } from '../../../../../cloud/components/Modal/contents/Dashboard/interfaces'
import SecondaryConditionItem from '../../../../../cloud/components/Modal/contents/Dashboard/SecondaryConditionItem'

interface DashboardFormProps {
  action: 'Create' | 'Update'
  defaultName?: string
  defaultPrivate?: boolean
  defaultConditionType: 'and' | 'or'
  defaultSecondaryConditions: EditibleSecondaryCondition[]
  onSubmit: (
    body: CreateDashboardRequestBody | UpdateDashboardRequestBody
  ) => void
  buttonsAreDisabled?: boolean
}

const DashboardForm = ({
  action,
  defaultName = '',
  defaultPrivate = true,
  defaultConditionType,
  defaultSecondaryConditions,
  buttonsAreDisabled,
  onSubmit,
}: DashboardFormProps) => {
  const [name, setName] = useState(defaultName)
  const [makingPrivate, setMakingPrivate] = useState(defaultPrivate)
  const [primaryConditionType, setPrimaryConditionType] = useState<
    'and' | 'or'
  >(defaultConditionType)
  const { translate } = useI18n()

  const [secondaryConditions, setSecondaryConditions] = useState<
    EditibleSecondaryCondition[]
  >(defaultSecondaryConditions)

  const updateName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value)
    },
    []
  )

  const updatePrimaryConditionType = useCallback((option: FormSelectOption) => {
    setPrimaryConditionType(option.value as any)
  }, [])

  const insertSecondaryConditionByIndex = useCallback(
    (condition: EditibleSecondaryCondition, index: number) => {
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
        condition: {
          type: primaryConditionType,
          conditions: JSON.parse(JSON.stringify(secondaryConditions)),
        },
        private: makingPrivate,
      })
    },
    [onSubmit, makingPrivate, primaryConditionType, name, secondaryConditions]
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
                type: 'select',
                props: {
                  options: [
                    { label: translate(lngKeys.GeneralAll), value: 'and' },
                    { label: translate(lngKeys.GeneralAny), value: 'or' },
                  ],
                  value: getPrimaryConditionOptionByType(
                    translate,
                    primaryConditionType
                  ),
                  onChange: updatePrimaryConditionType,
                },
              }}
            />
            <FormRowItem
              className='form__row__item--shrink'
              item={{
                type: 'button',
                props: {
                  iconPath: mdiPlus,
                  variant: 'secondary',
                  label: '',
                  onClick: () =>
                    insertSecondaryConditionByIndex({ type: 'null' }, 0),
                },
              }}
            />
          </FormRow>

          {secondaryConditions.map((condition, index) => {
            const updateSecondaryCondition = (
              updatedSecondaryCondition: EditibleSecondaryCondition
            ) => {
              setSecondaryConditions((previousConditions) => {
                const newSecondaryConditions = [...previousConditions]
                newSecondaryConditions.splice(
                  index,
                  1,
                  updatedSecondaryCondition
                )
                return newSecondaryConditions
              })
            }

            const insertConditionNext = () => {
              insertSecondaryConditionByIndex({ type: 'null' }, index)
            }

            const removeCondition = () => {
              removeSecondaryConditionByIndex(index)
            }

            return (
              <SecondaryConditionItem
                key={index}
                condition={condition}
                update={updateSecondaryCondition}
                addNext={insertConditionNext}
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

function getPrimaryConditionOptionByType(t: TFunction, value: 'and' | 'or') {
  switch (value) {
    case 'and':
      return { label: t(lngKeys.GeneralAll), value: 'and' }
    case 'or':
      return { label: t(lngKeys.GeneralAny), value: 'or' }
  }
}

export default DashboardForm
