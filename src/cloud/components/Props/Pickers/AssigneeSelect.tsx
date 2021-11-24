import React, { useCallback, useState, useMemo } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import styled from '../../../../design/lib/styled'
import UserIcon from '../../UserIcon'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import { mdiAccountCircleOutline } from '@mdi/js'
import { useModal } from '../../../../design/lib/stores/modal'
import { SearchableListOption } from '../../../../design/components/molecules/SearchableOptionList'
import SearchableOptionListPopup from '../../SearchableOptionListPopup'
import PropertyValueButton from './PropertyValueButton'

interface AssigneeSelectProps {
  disabled?: boolean
  defaultValue: string[]
  update: (value: string[]) => void
  isLoading: boolean
  readOnly: boolean
  showIconPath?: boolean
  emptyLabel?: string
  popupAlignment?: 'bottom-left' | 'top-left'
}

const AssigneeSelect = ({
  disabled = false,
  defaultValue,
  isLoading,
  showIconPath,
  emptyLabel,
  readOnly,
  update,
  popupAlignment = 'bottom-left',
}: AssigneeSelectProps) => {
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
      <div className='assignees__wrapper'>
        {permissions
          .filter((p) => defaultValue.includes(p.userId) && p.user != null)
          .map((p) => (
            <UserIcon user={p.user} className='assignee' key={p.id} />
          ))}
      </div>
    )
  }, [defaultValue, permissions])

  return (
    <Container className='assignee__select prop__margin'>
      <PropertyValueButton
        disabled={disabled}
        sending={isLoading}
        empty={defaultValue.length === 0 && emptyLabel == null}
        isReadOnly={readOnly}
        iconPath={
          showIconPath || defaultValue.length === 0
            ? mdiAccountCircleOutline
            : undefined
        }
        onClick={(e) =>
          openContextModal(
            e,
            <AssigneeModal
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
          : emptyLabel != null
          ? emptyLabel
          : translate(lngKeys.Unassigned)}
      </PropertyValueButton>
    </Container>
  )
}

const Container = styled.div`
  .assignees__wrapper {
    display: flex;
    width: auto;
    align-items: center;
  }

  .assignee {
    display: inline-flex;
    width: 22px;
    height: 22px;
    line-height: 19px;
    margin-right: 0;
  }
`

const AssigneeModal = ({
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

  const availableOptions: SearchableListOption[] = useMemo(() => {
    return matchedUsers.map((user) => {
      return {
        onClick: () => toggleUser(user.id),
        label: user.displayName,
        checked: value.includes(user.id),
        icon: <UserIcon user={user} className='assignee__item__icon' />,
      }
    })
  }, [matchedUsers, toggleUser, value])

  return (
    <ModalContainer>
      <SearchableOptionListPopup
        query={query}
        setQuery={setQuery}
        options={availableOptions}
        onSubmit={() => submitUpdate(value)}
        onCancel={closeModal}
      />
    </ModalContainer>
  )
}

const ModalContainer = styled.div`
  .assignee__item__icon {
    width: 24px;
    height: 24px;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default AssigneeSelect
