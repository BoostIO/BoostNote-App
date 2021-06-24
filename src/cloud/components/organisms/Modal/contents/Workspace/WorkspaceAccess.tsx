import React, { useCallback, useState, useMemo } from 'react'
import { SerializedUser } from '../../../../../interfaces/db/user'
import { SerializedUserTeamPermissions } from '../../../../../interfaces/db/userTeamPermissions'
import styled from '../../../../../lib/styled'
import Flexbox from '../../../../atoms/Flexbox'
import Checkbox from '../../../../atoms/Checkbox'
import IconMdi from '../../../../atoms/IconMdi'
import { mdiClose } from '@mdi/js'
import { useSet } from 'react-use'
import UserIcon from '../../../../atoms/UserIcon'
import cc from 'classcat'
import { linkText } from '../../../../../lib/styled/styleFunctions'
import FormRow from '../../../../../../shared/components/molecules/Form/templates/FormRow'
import Button from '../../../../../../shared/components/atoms/Button'
import { useI18n } from '../../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../../lib/i18n/types'

interface WorkspaceAccessProps {
  selectedPermissions: SerializedUserTeamPermissions[]
  setSelectedPermissions: React.Dispatch<
    React.SetStateAction<SerializedUserTeamPermissions[]>
  >
  ownerPermissions?: SerializedUserTeamPermissions
  permissions?: SerializedUserTeamPermissions[]
  currentUserIsOwner?: boolean
  currentUser: SerializedUser
}

const WorkspaceAccess = ({
  permissions = [],
  ownerPermissions,
  currentUserIsOwner,
  selectedPermissions,
  currentUser,
  setSelectedPermissions,
}: WorkspaceAccessProps) => {
  const [showSelector, setShowSelector] = useState<boolean>(false)
  const [
    newPermissionsIds,
    { toggle, add: addNewPermissionsId, reset: resetNewPermissionsIds },
  ] = useSet<string>(new Set())
  const { t } = useI18n()

  const onShowSelector = useCallback(() => {
    resetNewPermissionsIds()
    setShowSelector(true)
  }, [resetNewPermissionsIds])

  const ownerOrUserNode = useMemo(() => {
    if (ownerPermissions != null) {
      return (
        <Flexbox>
          <UserIcon style={{ marginRight: 4 }} user={ownerPermissions.user} />
          <span>{ownerPermissions.user.displayName}</span>
        </Flexbox>
      )
    }

    return (
      <Flexbox>
        <UserIcon style={{ marginRight: 4 }} user={currentUser} />
        <span>{currentUser.displayName}</span>
      </Flexbox>
    )
  }, [ownerPermissions, currentUser])

  const selectedPermissionsIdSet = useMemo(() => {
    return selectedPermissions.reduce((acc, val) => {
      acc.add(val.id)
      return acc
    }, new Set<string>())
  }, [selectedPermissions])

  const leftoverPermissions = useMemo(() => {
    return permissions.filter(
      (p) => !selectedPermissionsIdSet.has(p.id) && p.user.id !== currentUser.id
    )
  }, [permissions, selectedPermissionsIdSet, currentUser])

  const onSelectAllCheckboxClick = useCallback(() => {
    if (newPermissionsIds.size === 0) {
      leftoverPermissions.forEach((p) => addNewPermissionsId(p.id))
      return
    }

    resetNewPermissionsIds()
    return
  }, [
    resetNewPermissionsIds,
    newPermissionsIds,
    leftoverPermissions,
    addNewPermissionsId,
  ])

  const addMembers = useCallback(() => {
    const newPermissions = permissions.filter(
      (p) =>
        newPermissionsIds.has(p.id) &&
        !selectedPermissionsIdSet.has(p.id) &&
        p.userId !== currentUser.id
    )

    setSelectedPermissions((prev) => [...prev, ...newPermissions])
    setShowSelector(false)
  }, [
    currentUser,
    newPermissionsIds,
    selectedPermissionsIdSet,
    permissions,
    setSelectedPermissions,
  ])

  return (
    <Container>
      <FormRow
        fullWidth={true}
        row={{ title: t(lngKeys.ModalsWorkspacesWhoHasAcess) }}
      >
        <Flexbox direction='column' className='workspace__access__col'>
          <Flexbox
            justifyContent='space-between'
            className='workspace__access__row'
          >
            {ownerOrUserNode}
            <StyledRemoveAccessButton disabled={true}>
              {t(lngKeys.Owner)}
            </StyledRemoveAccessButton>
          </Flexbox>
          {selectedPermissions.map((p) => {
            return (
              <Flexbox
                key={p.id}
                justifyContent='space-between'
                className='workspace__access__row'
              >
                <Flexbox>
                  <UserIcon style={{ marginRight: 4 }} user={p.user} />
                  <span>{p.user.displayName}</span>
                </Flexbox>
                {currentUserIsOwner && (
                  <StyledRemoveAccessButton
                    onClick={() =>
                      setSelectedPermissions((prev) =>
                        prev.filter((permission) => permission.id !== p.id)
                      )
                    }
                  >
                    <IconMdi path={mdiClose} />
                  </StyledRemoveAccessButton>
                )}
              </Flexbox>
            )
          })}
        </Flexbox>
      </FormRow>

      {leftoverPermissions.length !== 0 && currentUserIsOwner && (
        <FormRow
          fullWidth={true}
          row={{ title: t(lngKeys.ModalsWorkspaceSetAccess) }}
        >
          <>
            {!showSelector ? (
              <Button variant='secondary' onClick={onShowSelector}>
                {t(lngKeys.ModalsWorkspacesSetAccessMembers)}
              </Button>
            ) : (
              <StyledSelector>
                <StyledSelectorRow style={{ marginTop: 10, marginBottom: 20 }}>
                  <Checkbox
                    checked={
                      newPermissionsIds.size === leftoverPermissions.length
                    }
                    className={cc([
                      newPermissionsIds.size !== 0 &&
                        newPermissionsIds.size !== leftoverPermissions.length &&
                        'reducer',
                    ])}
                    label={t(lngKeys.SelectAll)}
                    onChange={onSelectAllCheckboxClick}
                  />
                </StyledSelectorRow>
                {leftoverPermissions.length !== 0 &&
                  leftoverPermissions.map((p) => (
                    <StyledSelectorRow key={p.id}>
                      <Checkbox
                        checked={newPermissionsIds.has(p.id)}
                        onChange={() => toggle(p.id)}
                        label={
                          <Flexbox>
                            <UserIcon
                              style={{ marginRight: 4 }}
                              user={p.user}
                            />
                            <span>{p.user.displayName}</span>
                          </Flexbox>
                        }
                      />
                    </StyledSelectorRow>
                  ))}
                <Button
                  variant='primary'
                  onClick={addMembers}
                  disabled={newPermissionsIds.size === 0}
                  className='workspace__access__add'
                >
                  {t(lngKeys.Add)}
                </Button>
              </StyledSelector>
            )}
          </>
        </FormRow>
      )}
    </Container>
  )
}

const Container = styled.div`
  .workspace__access__add {
    width: fit-content;
    flex: 0 0 auto;
  }

  .workspace__access__col {
    width: 100%;
  }

  .workspace__access__row {
    width: 100%;
  }

  .workspace__access__row + .workspace__access__row {
    margin-top: 4px;
  }
`

const StyledSelectorRow = styled.div`
  display: flex;
  width: 100%;
  flex: 1 1 auto;
  flex-wrap: nowrap;
  margin-bottom: ${({ theme }) => theme.space.xsmall}px;
`

const StyledSelector = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.subtleBackgroundColor};
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  border-radius: 2px;
`

const StyledRemoveAccessButton = styled.button`
  background: none;
  border: 0;
  outline: none;
  margin-top: 0 !important;
  color: inherit;
  svg {
    font-size: ${({ theme }) => theme.fontSizes.default}px;
    ${linkText}
  }
`

export default WorkspaceAccess
