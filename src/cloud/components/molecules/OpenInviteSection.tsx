import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { SectionRow } from '../organisms/settings/styled'
import { useDialog, DialogIconTypes } from '../../../shared/lib/stores/dialog'
import { usePage } from '../../lib/stores/pageStore'
import { useEffectOnce } from 'react-use'
import {
  getOpenInvite,
  createOpenInvite,
  cancelOpenInvite,
  resetOpenInvite,
} from '../../api/teams/open-invites'
import { Spinner } from '../atoms/Spinner'
import { SerializedUserTeamPermissions } from '../../interfaces/db/userTeamPermissions'
import { SerializedOpenInvite } from '../../interfaces/db/openInvite'
import styled from '../../lib/styled'
import { getTeamURL, getOpenInviteURL } from '../../lib/utils/patterns'
import { boostHubBaseUrl } from '../../lib/consts'
import { useToast } from '../../../shared/lib/stores/toast'
import Switch from '../../../shared/components/atoms/Switch'
import Button from '../../../shared/components/atoms/Button'
import FormCopyInput from '../../../shared/components/molecules/Form/atoms/FormCopyInput'

interface OpenInvitesSectionProps {
  userPermissions: SerializedUserTeamPermissions
}

const OpenInvitesSection = ({ userPermissions }: OpenInvitesSectionProps) => {
  const { team } = usePage()
  const [fetching, setFetching] = useState<boolean>(true)
  const [sending, setSending] = useState<boolean>(false)
  const [openInvite, setOpenInvite] = useState<
    SerializedOpenInvite | undefined
  >(undefined)
  const { messageBox } = useDialog()
  const { pushApiErrorMessage } = useToast()
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffectOnce(() => {
    fetchOpenInvite()
  })

  const fetchOpenInvite = useCallback(async () => {
    if (team == null) {
      return
    }
    setFetching(true)
    getOpenInvite(team)
      .then(({ invite }) => {
        if (!mountedRef.current) {
          return
        }
        setOpenInvite(invite)
      })
      .catch((error) => {
        pushApiErrorMessage(error)
      })
      .then(() => {
        if (!mountedRef.current) {
          return
        }
        setFetching(false)
      })
  }, [team, pushApiErrorMessage])

  const createInvite = useCallback(async () => {
    if (team == null) {
      return
    }

    setSending(true)
    try {
      const { invite } = await createOpenInvite(team)
      setOpenInvite(invite)
    } catch (error) {
      pushApiErrorMessage(error)
    }
    setSending(false)
  }, [team, pushApiErrorMessage])

  const cancelInvite = useCallback(
    async (invite: SerializedOpenInvite) => {
      if (team == null) {
        return
      }

      messageBox({
        title: `Cancel invite?`,
        message: `Are you sure to cancel this invite? The link won't allow users to join anymore.`,
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Delete',
            onClick: async () => {
              //remove
              setSending(true)
              try {
                await cancelOpenInvite(team, invite)
                setOpenInvite(undefined)
              } catch (error) {
                pushApiErrorMessage(error)
              }
              setSending(false)
              return
            },
          },
        ],
      })
    },
    [messageBox, team, pushApiErrorMessage]
  )

  const resetInvite = useCallback(async () => {
    if (team == null || openInvite == null) {
      return
    }

    messageBox({
      title: `Regenerate Link`,
      message: `Are you sure to reset the current link and generate a new one? The previous link will be depreciated.`,
      iconType: DialogIconTypes.Warning,
      buttons: [
        {
          variant: 'secondary',
          label: 'Cancel',
          cancelButton: true,
          defaultButton: true,
        },
        {
          variant: 'danger',
          label: 'Reset',
          onClick: async () => {
            //remove
            setSending(true)
            try {
              const { invite: newInvite } = await resetOpenInvite(
                team,
                openInvite
              )
              setOpenInvite(newInvite)
            } catch (error) {
              pushApiErrorMessage(error)
            }
            setSending(false)
            return
          },
        },
      ],
    })
  }, [messageBox, team, pushApiErrorMessage, openInvite])

  const toggleOpenInvite = useCallback(() => {
    if (openInvite != null) {
      cancelInvite(openInvite)
      return
    }

    createInvite()
  }, [openInvite, cancelInvite, createInvite])

  const openInviteLink = useMemo(() => {
    if (openInvite == null || team == null) {
      return undefined
    }

    return `${boostHubBaseUrl}${getTeamURL(team)}${getOpenInviteURL(
      openInvite
    )}`
  }, [team, openInvite])

  if (userPermissions.role !== 'admin') {
    return null
  }

  return (
    <section>
      <StyledFlex>
        <h2 style={{ margin: 0 }}>Invite with an open Link</h2>
        <Switch
          disabled={fetching || sending}
          id='shared-custom-switch'
          onChange={toggleOpenInvite}
          checked={openInvite != null}
        />
      </StyledFlex>
      {openInviteLink != null && (
        <StyledOpenLinkSection>
          <p>
            You can share this secret link to invite people to this workspace.
            Only admins can see it. You can{' '}
            <Button className='link-reset' variant='link' onClick={resetInvite}>
              reset the link
            </Button>{' '}
            to generate a new one.
          </p>
          <FormCopyInput text={openInviteLink} />
        </StyledOpenLinkSection>
      )}
      {sending && (
        <SectionRow>
          <Spinner style={{ position: 'relative' }} />
        </SectionRow>
      )}
    </section>
  )
}

const StyledFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: ${({ theme }) => theme.space.medium}px 0
    ${({ theme }) => theme.space.default}px;
`

const StyledOpenLinkSection = styled.div`
  .link-reset {
    padding: 0;
    margin: 0;
  }

  p {
    margin-bottom: ${({ theme }) => theme.space.default}px;
  }
`

export default OpenInvitesSection
