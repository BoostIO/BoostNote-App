import React, { useCallback, useState, useMemo, useRef } from 'react'
import { SerializedUser } from '../../../../../interfaces/db/user'
import { SerializedUserTeamPermissions } from '../../../../../interfaces/db/userTeamPermissions'
import styled from '../../../../../lib/styled'
import { ModalLine } from '../styled'
import Flexbox from '../../../../atoms/Flexbox'
import Checkbox from '../../../../atoms/Checkbox'
import IconMdi from '../../../../atoms/IconMdi'
import { mdiClose } from '@mdi/js'
import { useEffectOnce, useSet } from 'react-use'
import CustomButton from '../../../../atoms/buttons/CustomButton'
import UserIcon from '../../../../atoms/UserIcon'
import cc from 'classcat'
import { linkText } from '../../../../../lib/styled/styleFunctions'

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
  const nodeRef = useRef<HTMLDivElement>(null)
  const [showSelector, setShowSelector] = useState<boolean>(false)
  const [
    newPermissionsIds,
    { toggle, add: addNewPermissionsId, reset: resetNewPermissionsIds },
  ] = useSet<string>(new Set())

  useEffectOnce(() => {
    nodeRef.current!.focus()
  })

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
    <div style={{ width: '100%', marginTop: 30 }} ref={nodeRef}>
      <ModalLine style={{ marginBottom: 10 }}>Who has access</ModalLine>
      <Flexbox justifyContent='space-between' style={{ marginBottom: 5 }}>
        {ownerOrUserNode}
        <StyledRemoveAccessButton disabled={true}>
          Owner
        </StyledRemoveAccessButton>
      </Flexbox>
      {selectedPermissions.map((p) => {
        return (
          <Flexbox
            key={p.id}
            justifyContent='space-between'
            style={{ marginBottom: 5 }}
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

      {leftoverPermissions.length !== 0 && currentUserIsOwner && (
        <>
          <ModalLine style={{ marginTop: 20, marginBottom: 10 }}>
            Set access
          </ModalLine>
          {currentUserIsOwner && (
            <>
              {!showSelector ? (
                <CustomButton
                  style={{ marginTop: 10 }}
                  variant='secondary'
                  onClick={onShowSelector}
                >
                  Add Members
                </CustomButton>
              ) : (
                <StyledSelector>
                  <StyledSelectorRow
                    style={{ marginTop: 10, marginBottom: 20 }}
                  >
                    <Checkbox
                      checked={
                        newPermissionsIds.size === leftoverPermissions.length
                      }
                      className={cc([
                        newPermissionsIds.size !== 0 &&
                          newPermissionsIds.size !==
                            leftoverPermissions.length &&
                          'reducer',
                      ])}
                      label='Select all'
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
                  <CustomButton
                    variant='primary'
                    style={{ lineHeight: '30px', width: '80px' }}
                    onClick={addMembers}
                    disabled={newPermissionsIds.size === 0}
                  >
                    Add
                  </CustomButton>
                </StyledSelector>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

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
