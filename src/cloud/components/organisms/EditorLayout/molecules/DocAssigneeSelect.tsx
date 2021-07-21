import React, { useCallback, useState, useMemo } from 'react'
import { usePage } from '../../../../lib/stores/pageStore'
import styled from '../../../../../shared/lib/styled'
import UserIcon from '../../../atoms/UserIcon'
import { textOverflow } from '../../../../../shared/lib/styled/styleFunctions'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import DocPropertyValueButton from './DocPropertyValueButton'
import { mdiAccountCircleOutline } from '@mdi/js'
import { useModal } from '../../../../../shared/lib/stores/modal'
import Checkbox from '../../../../../shared/components/molecules/Form/atoms/FormCheckbox'
import Form from '../../../../../shared/components/molecules/Form'
import FormRow from '../../../../../shared/components/molecules/Form/templates/FormRow'

interface DocAssigneeSelectProps {
  disabled?: boolean
  defaultValue: string[]
  update: (value: string[]) => void
  isLoading: boolean
  readOnly: boolean
}

const DocAssigneeSelect = ({
  disabled = false,
  defaultValue,
  isLoading,
  readOnly,
  update,
}: DocAssigneeSelectProps) => {
  const { translate } = useI18n()
  const { openContextModal, closeAllModals } = useModal()
  const { permissions = [] } = usePage()

  const updateAssignees = useCallback(
    (selectedUserIds: string[]) => {
      update(selectedUserIds)
      closeAllModals()
    },
    [update, closeAllModals]
  )

  const selectedUsers = useMemo(() => {
    if (defaultValue.length === 0) {
      return null
    }

    return (
      <div className='doc__assignees__wrapper'>
        {permissions
          .filter((p) => defaultValue.includes(p.userId) && p.user != null)
          .map((p) => (
            <UserIcon user={p.user} className='doc__assignee' key={p.id} />
          ))}
      </div>
    )
  }, [defaultValue, permissions])

  return (
    <Container className='prop__margin'>
      <DocPropertyValueButton
        disabled={disabled}
        sending={isLoading}
        empty={defaultValue.length === 0}
        isReadOnly={readOnly}
        iconPath={
          defaultValue.length === 0 ? mdiAccountCircleOutline : undefined
        }
        onClick={(e) =>
          openContextModal(
            e,
            <DocAssigneeModal
              selectedUsers={defaultValue}
              submitUpdate={updateAssignees}
              closeModal={closeAllModals}
            />,
            {
              alignment: 'bottom-left',
              width: 300,
            }
          )
        }
      >
        {defaultValue.length !== 0
          ? selectedUsers
          : translate(lngKeys.Unassigned)}
      </DocPropertyValueButton>
    </Container>
  )
}

const Container = styled.div`
  .doc__assignees__wrapper {
    display: flex;
    width: auto;
    align-items: center;
  }

  .doc__assignee {
    display: inline-flex;
    width: 22px;
    height: 22px;
    line-height: 19px;
    margin-right: 0;
  }
`

const DocAssigneeModal = ({
  selectedUsers,
  submitUpdate,
  closeModal,
}: {
  selectedUsers: string[]
  submitUpdate: (val: string[]) => void
  closeModal: () => void
}) => {
  const { permissions = [] } = usePage()
  const [value, setValue] = useState<string[]>(selectedUsers)
  const { translate } = useI18n()

  const toggleUser = useCallback((userId: string) => {
    setValue((prev) => {
      const newValue = prev.slice()
      if (newValue.includes(userId)) {
        return newValue.filter((id) => id !== userId)
      } else {
        newValue.push(userId)
        return newValue
      }
    })
  }, [])

  return (
    <ModalContainer>
      <Form
        onSubmit={() => submitUpdate(value)}
        onCancel={closeModal}
        className='assignee__form'
        submitButton={{
          label: translate(lngKeys.GeneralSaveVerb),
          variant: 'primary',
          id: 'assignee-submit-button',
          tabIndex: 0,
        }}
      >
        {permissions.map((p) => {
          return (
            <FormRow row={{}} className='assignee__item' key={p.userId}>
              <button
                className='assignee__item__wrapper'
                onClick={() => toggleUser(p.userId)}
                id={`assignee__item__${p.userId}`}
                tabIndex={0}
                type='button'
              >
                <UserIcon user={p.user} className='assignee__item__icon' />
                <span className='assignee__item__label'>
                  {p.user.displayName}
                </span>
                <Checkbox
                  checked={value.includes(p.userId)}
                  className='assignee__checkbox'
                />
              </button>
            </FormRow>
          )
        })}
      </Form>
    </ModalContainer>
  )
}

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;

  .assignee__form,
  .assignee__item,
  .assignee__item__wrapper {
    width: 100%;
    flex: 1 1 auto;
  }

  .assignee__checkbox {
    flex: 0 0 auto;
  }

  .assignee__item__wrapper {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    height: 30px;
    cursor: pointer;
    background: none;
    transition: background 200ms;
    color: ${({ theme }) => theme.colors.text.primary};
    justify-content: flex-start;
    text-align: left;
    border-radius: ${({ theme }) => theme.borders.radius}px;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;

    &:focus {
      background: ${({ theme }) => theme.colors.background.tertiary};
    }

    &:hover {
      background: ${({ theme }) => theme.colors.background.secondary};
    }

    .assignee__item__label {
      flex: 1 1 auto;
      ${textOverflow}
    }

    .assignee__item__icon {
      margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
      width: 22px;
      height: 22px;
      line-height: 19px;
    }

    .assignee__checkbox {
      margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
      pointer-events: none;
    }

    .assignee__item__icon,
    .assignee__checkbox {
      flex: 0 0 auto;
      flex-shrink: 0;
    }
  }
`

export default DocAssigneeSelect
