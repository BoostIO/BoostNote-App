import React, { useState, ChangeEvent, useCallback } from 'react'
import { StyledModalSeparator } from '../Forms/styled'
import FormSelect, {
  FormSelectOption,
} from '../../../../../../shared/components/molecules/Form/atoms/FormSelect'
import Button from '../../../../../../shared/components/atoms/Button'
import { mdiPlus } from '@mdi/js'
import styled from '../../../../../../shared/lib/styled'
import { EditibleSecondaryCondition } from './interfaces'
import Form from '../../../../../../shared/components/molecules/Form'
import FormInput from '../../../../../../shared/components/molecules/Form/atoms/FormInput'
import Switch from 'react-switch'
import SecondaryConditionItem from './SecondaryConditionItem'
import { useModal } from '../../../../../../shared/lib/stores/modal'
import { createSmartFolder } from '../../../../../api/teams/smart-folder'
import { usePage } from '../../../../../lib/stores/pageStore'
import { useNav } from '../../../../../lib/stores/nav'
import { useToast } from '../../../../../../shared/lib/stores/toast'
import { getSmartFolderHref } from '../../../../../lib/href'
import { useRouter } from '../../../../../lib/router'

const CreateSmartFolderModal = () => {
  const [name, setName] = useState('')

  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()

  const [makingPrivate, setMakingPrivate] = useState(false)
  const { updateSmartFoldersMap } = useNav()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()

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

  const { pushApiErrorMessage } = useToast()
  const submit = useCallback(async () => {
    if (team == null) {
      return
    }
    setSending(true)
    try {
      const { smartFolder } = await createSmartFolder(team, {
        name,
        condition: {
          type: primaryConditionType,
          conditions: JSON.parse(JSON.stringify(secondaryConditions)),
        },
        private: makingPrivate,
      })
      updateSmartFoldersMap([smartFolder.id, smartFolder])
      closeModal()
      push(getSmartFolderHref(smartFolder, team, 'index'))
    } catch (error) {
      console.error(error)
      pushApiErrorMessage(error)
      setSending(false)
    }
  }, [
    team,
    name,
    push,
    primaryConditionType,
    secondaryConditions,
    makingPrivate,
    updateSmartFoldersMap,
    closeModal,
    pushApiErrorMessage,
  ])

  if (team == null) {
    return null
  }

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
              personalOnly={team?.personal}
            />
          )
        })}

        <StyledModalSeparator />
        {!team.personal && (
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
        )}

        <div className='form__row'>
          <div>
            <Button variant='primary' onClick={submit} disabled={sending}>
              Create
            </Button>
            <Button variant='secondary' onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </div>
      </Form>
    </Container>
  )
}

export default CreateSmartFolderModal

const Container = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  .modal__heading,
  .form__row__item {
    color: ${({ theme }) => theme.colors.text.primary};
  }
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
