import React, { useCallback, useState, useMemo, useRef } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import styled from '../../../../shared/lib/styled'
import UserIcon from '../../atoms/UserIcon'
import { overflowEllipsis } from '../../../../shared/lib/styled/styleFunctions'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import DocPropertyValueButton from './DocPropertyValueButton'
import { mdiAccountCircleOutline } from '@mdi/js'
import { useModal } from '../../../../shared/lib/stores/modal'
import Checkbox from '../../../../shared/components/molecules/Form/atoms/FormCheckbox'
import Form from '../../../../shared/components/molecules/Form'
import UpDownList from '../../../../shared/components/atoms/UpDownList'
import FormInput from '../../../../shared/components/molecules/Form/atoms/FormInput'
import { useEffectOnce } from 'react-use'
import VerticalScroller from '../../../../shared/components/atoms/VerticalScroller'
import Button from '../../../../shared/components/atoms/Button'
import FormRowItem from '../../../../shared/components/molecules/Form/templates/FormRowItem'

interface DocAssigneeSelectProps {
  disabled?: boolean
  defaultValue: string[]
  update: (value: string[]) => void
  isLoading: boolean
  readOnly: boolean
  popupAlignment?: 'bottom-left' | 'top-left'
}

const DocAssigneeSelect = ({
  disabled = false,
  defaultValue,
  isLoading,
  readOnly,
  update,
  popupAlignment = 'bottom-left',
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
    <Container className='doc__assignee__select prop__margin'>
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
              alignment: popupAlignment,
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
  const [query, setQuery] = useState<string>('')

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

  const matchedUsers = useMemo(() => {
    const trimmed = query.trim().toLocaleLowerCase()
    if (trimmed === '') {
      return permissions.map((p) => p.user)
    }

    return permissions
      .filter((p) => p.user.displayName.toLocaleLowerCase().includes(trimmed))
      .map((p) => p.user)
  }, [permissions, query])

  const inputRef = useRef<HTMLInputElement>(null)
  useEffectOnce(() => {
    inputRef.current!.focus()
  })

  return (
    <ModalContainer>
      <Form
        onSubmit={() => submitUpdate(value)}
        onCancel={closeModal}
        className='assignee__form'
      >
        <UpDownList ignoreFocus={true}>
          <FormRowItem>
            <FormInput
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={translate(lngKeys.GeneralSearchVerb)}
              id='selection__input'
            />
          </FormRowItem>
          <VerticalScroller className='selection__wrapper'>
            {matchedUsers.map((user) => {
              return (
                <div className='selection__item' key={user.id}>
                  <button
                    className='selection__item__wrapper'
                    onClick={() => toggleUser(user.id)}
                    id={`selection__item__${user.id}`}
                    tabIndex={0}
                    type='button'
                  >
                    <UserIcon user={user} className='assignee__item__icon' />
                    <span className='selection__label'>{user.displayName}</span>
                    <Checkbox
                      checked={value.includes(user.id)}
                      className='selection__checkbox'
                    />
                  </button>
                </div>
              )
            })}
          </VerticalScroller>
          <div className='selection__break' />
          <Button
            type='submit'
            variant='transparent'
            className='selection__submit'
            id='selection__submit'
            size='sm'
          >
            {translate(lngKeys.GeneralSaveVerb)}
          </Button>
        </UpDownList>
      </Form>
    </ModalContainer>
  )
}

const ModalContainer = styled.div`
  .assignee__item__icon {
    width: 24px;
    height: 24px;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .selection__item {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  #selection__input {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .selection__break {
    display: block;
    height: 1px;
    width: 100%;
    background: ${({ theme }) => theme.colors.border.second};
    flex: 0 0 auto;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
  .selection__submit {
    display: flex;
    width: 100%;
  }

  .selection__wrapper {
    min-height: 30px;
    max-height: 250px;
  }

  .selection__checkbox {
    flex: 0 0 auto;
  }

  .selection__item__wrapper {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    width: 100%;
    height: 30px;
    cursor: pointer;
    background: none;
    transition: background 200ms;
    color: ${({ theme }) => theme.colors.text.primary};
    justify-content: space-between;
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

    .selection__label {
      flex: 1 1 auto;
      ${overflowEllipsis}
    }

    .selection__item__icon {
      margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
      width: 22px;
      height: 22px;
      line-height: 19px;
    }

    .selection__checkbox {
      margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
      pointer-events: none;
    }

    .selection__item__icon,
    .selection__checkbox {
      flex: 0 0 auto;
      flex-shrink: 0;
    }
  }
`

export default DocAssigneeSelect
