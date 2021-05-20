import React, { useState, ChangeEvent, useCallback } from 'react'
import { StyledModalSeparator } from '../Forms/styled'
import FormSelect from '../../../../../../shared/components/molecules/Form/atoms/FormSelect'
import Button from '../../../../../../shared/components/atoms/Button'
import { mdiPlus } from '@mdi/js'
import styled from '../../../../../../shared/lib/styled'
import { EditibleSecondaryCondition } from './interfaces'
import Form from '../../../../../../shared/components/molecules/Form'
import FormInput from '../../../../../../shared/components/molecules/Form/atoms/FormInput'
import Switch from 'react-switch'
import SecondaryConditionItem from './SecondaryConditionItem'

const CreateSmartFolderModal = () => {
  const [name, setName] = useState('')

  const [makingPrivate, setMakingPrivate] = useState(false)

  const [primaryConditionType, setPrimaryConditionType] = useState<
    'and' | 'or'
  >('and')

  const [secondaryConditions, setSecondaryConditions] = useState<
    EditibleSecondaryCondition[]
  >([
    {
      type: 'status',
      value: 'in_progress',
    },
  ])

  const updateName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }, [])

  const updatePrimaryConditionType = useCallback(
    (newConditionType: 'and' | 'or') => {
      setPrimaryConditionType(newConditionType)
    },
    []
  )

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

  return (
    <Container>
      <h2 className='modal__heading'>Create a Smart Folder</h2>
      <Form>
        <div className='form__row'>
          <div className='form__row__title'>Name</div>
          <div className='form__row__items'>
            <div className='form__row__item form__row__item--select'>
              <FormInput value={name} onChange={updateName} />
            </div>
          </div>
        </div>
        <StyledModalSeparator />
        <div className='form__row'>
          <div className='form__row__items'>
            <div className='form__row__item form__row__item--shrink'>
              <FormSelect
                options={[
                  { label: 'All', value: 'and' },
                  { label: 'Any', value: 'or' },
                ]}
                value={getPrimaryConditionOptionByType(primaryConditionType)}
                onChange={updatePrimaryConditionType}
              />
            </div>

            <div className='form__row__item form__row__item--shrink'>
              <Button
                iconPath={mdiPlus}
                variant='secondary'
                onClick={() => {
                  insertSecondaryConditionByIndex({ type: 'null' }, 0)
                }}
              />
            </div>
          </div>
        </div>
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
            />
          )
        })}

        <StyledModalSeparator />
        <div className='form__row'>
          <div className='form__row__items'>
            <div className='form__row__item'>
              <div>
                <h3>Make Private</h3>
                <p>
                  {makingPrivate ? (
                    <>
                      This smart folder will become private. Only you can see
                      it.
                    </>
                  ) : (
                    <>
                      The smart folder will become public. Every member on
                      workspace can see it.
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className='form__row__item form__row__item--shrink form__row__item--align-items-center'>
              <Switch
                type='switch'
                id='shared-custom-switch'
                checked={makingPrivate}
                onChange={(checked) => {
                  setMakingPrivate(checked)
                }}
                uncheckedIcon={false}
                checkedIcon={false}
                height={20}
                width={30}
                onColor='#004774'
                offColor='#3D3F44'
                offHandleColor='#1E2024'
                handleDiameter={14}
              />
            </div>
          </div>
        </div>

        <div className='form__row'>
          <div>
            <Button variant='primary'>Create</Button>
            <Button variant='secondary'>Cancel</Button>
          </div>
        </div>
      </Form>
    </Container>
  )
}

export default CreateSmartFolderModal

const Container = styled.div`
  .form__row__item.form__row__item--shrink {
    flex: 0;
  }
  .form__row__item.form__row__item--align-items-center {
    align-items: center;
  }
  .modal__heading {
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
