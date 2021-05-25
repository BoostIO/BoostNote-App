import { mdiPlus } from '@mdi/js'
import React, { useCallback, useState } from 'react'
import Button, {
  LoadingButton,
} from '../../../../../../shared/components/atoms/Button'
import ButtonGroup from '../../../../../../shared/components/atoms/ButtonGroup'
import Switch from '../../../../../../shared/components/atoms/Switch'
import Form from '../../../../../../shared/components/molecules/Form'
import { FormSelectOption } from '../../../../../../shared/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../../../../shared/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../../shared/components/molecules/Form/templates/FormRowItem'
import styled from '../../../../../../shared/lib/styled'
import {
  UpdateSmartFolderRequestBody,
  CreateSmartFolderRequestBody,
} from '../../../../../api/teams/smart-folder'
import { StyledModalSeparator } from '../Forms/styled'
import { EditibleSecondaryCondition } from './interfaces'
import SecondaryConditionItem from './SecondaryConditionItem'

interface SmartFolderFormProps {
  action: 'Create' | 'Update'
  defaultName?: string
  defaultPrivate?: boolean
  defaultConditionType: 'and' | 'or'
  defaultSecondaryConditions: EditibleSecondaryCondition[]
  isPersonalTeam: boolean
  onSubmit: (
    body: CreateSmartFolderRequestBody | UpdateSmartFolderRequestBody
  ) => void
  onCancel?: () => void
  buttonsAreDisabled?: boolean
}

const SmartFolderForm = ({
  action,
  defaultName = '',
  defaultPrivate = true,
  defaultConditionType,
  defaultSecondaryConditions,
  isPersonalTeam,
  buttonsAreDisabled,
  onCancel,
  onSubmit,
}: SmartFolderFormProps) => {
  const [name, setName] = useState(defaultName)
  const [makingPrivate, setMakingPrivate] = useState(defaultPrivate)
  const [primaryConditionType, setPrimaryConditionType] = useState<
    'and' | 'or'
  >(defaultConditionType)

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
        {action === 'Create' ? 'Create a ' : 'Edit '}Smart Folder
      </h2>
      <Form className='smart__folder__form' onSubmit={submitForm}>
        <FormRow
          fullWidth={true}
          row={{
            title: 'Name',
            items: [
              { type: 'input', props: { value: name, onChange: updateName } },
            ],
          }}
        />
        <FormRow
          fullWidth={true}
          row={{
            items: [{ type: 'node', element: <StyledModalSeparator /> }],
          }}
        />
        <FormRow fullWidth={true}>
          <FormRowItem
            className='form__row__item--shrink'
            item={{
              type: 'select',
              props: {
                options: [
                  { label: 'All', value: 'and' },
                  { label: 'Any', value: 'or' },
                ],
                value: getPrimaryConditionOptionByType(primaryConditionType),
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
              newSecondaryConditions.splice(index, 1, updatedSecondaryCondition)
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
              personalOnly={isPersonalTeam}
            />
          )
        })}

        <FormRow
          fullWidth={true}
          row={{
            items: [{ type: 'node', element: <StyledModalSeparator /> }],
          }}
        />

        <FormRow fullWidth={true} className='privacy-row'>
          <FormRowItem>
            <div>
              <h3>Make Private</h3>
              <p>
                {makingPrivate ? (
                  <>
                    This smart folder will become private. Only you can see it.
                  </>
                ) : (
                  <>
                    The smart folder will become public. Every member on
                    workspace can see it.
                  </>
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
                Cancel
              </Button>
            )}
            <LoadingButton
              spinning={buttonsAreDisabled}
              type='submit'
              variant='primary'
              disabled={buttonsAreDisabled}
            >
              {action}
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
`

function getPrimaryConditionOptionByType(value: 'and' | 'or') {
  switch (value) {
    case 'and':
      return { label: 'All', value: 'and' }
    case 'or':
      return { label: 'Any', value: 'or' }
  }
}

export default SmartFolderForm
