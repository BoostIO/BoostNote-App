import React, { useMemo, useCallback } from 'react'
import { usePage } from '../../../../../../lib/stores/pageStore'
import { SerializedUser } from '../../../../../../interfaces/db/user'
import FormSelect, {
  FormSelectOption,
} from '../../../../../../../shared/components/molecules/Form/atoms/FormSelect'
import styled from '../../../../../../../shared/lib/styled'
import UserIcon from '../../../../../atoms/UserIcon'

interface DocAssigneeSelectProps {
  disabled?: boolean
  value: string[]
  update: (value: string[]) => void
}

const DocAssigneeSelect = ({
  disabled = false,
  value,
  update,
}: DocAssigneeSelectProps) => {
  const { permissions } = usePage()

  const options = useMemo(() => {
    if (permissions == null) {
      return []
    }
    return permissions.map((permission) => {
      return getOptionByUser(permission.user)
    })
  }, [permissions])

  const selectedOptions = useMemo(() => {
    if (permissions == null) {
      return []
    }
    const userMap = permissions.reduce((map, permission) => {
      const { user } = permission
      map.set(user.id, user)
      return map
    }, new Map())

    return getSelectedOptionsByUserId(value, userMap)
  }, [permissions, value])

  const updateAssignees = useCallback(
    (selectedOptions: FormSelectOption[]) => {
      update(selectedOptions.map((option) => option.value))
    },
    [update]
  )

  return (
    <FormSelect
      isMulti
      isDisabled={disabled}
      options={options}
      value={selectedOptions}
      onChange={updateAssignees}
    />
  )
}

export default DocAssigneeSelect

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
`

function getOptionByUser(user: SerializedUser): FormSelectOption {
  return {
    label: (
      <ItemContainer>
        <UserIcon
          user={user}
          style={{
            width: '20px',
            height: '20px',
            fontSize: '12px',
            lineHeight: '18px',
            marginRight: '4px',
          }}
        />
        {user.uniqueName}
      </ItemContainer>
    ),
    value: user.id,
  }
}

function getSelectedOptionsByUserId(
  value: string[],
  userMap: Map<string, SerializedUser>
): FormSelectOption[] {
  return value.reduce<FormSelectOption[]>((options, userId) => {
    const user = userMap.get(userId)
    if (user == null) {
      console.warn(`User Id ${userId} does not exist in page props`)
      return options
    }
    const option = getOptionByUser(user)
    options.push(option)
    return options
  }, [])
}
