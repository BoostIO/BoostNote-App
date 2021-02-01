import React, { useState, useCallback, useMemo } from 'react'
import {
  Section,
  SectionHeader2,
  SectionRow,
} from '../organisms/settings/styled'
import { useDialog, DialogIconTypes } from '../../lib/stores/dialog'
import { usePage } from '../../lib/stores/pageStore'
import { useEffectOnce } from 'react-use'
import {
  getOpenInvite,
  createOpenInvite,
  cancelOpenInvite,
  resetOpenInvite,
} from '../../api/teams/open-invites'
import { useTranslation } from 'react-i18next'
import { Spinner } from '../atoms/Spinner'
import { SerializedUserTeamPermissions } from '../../interfaces/db/userTeamPermissions'
import { SerializedOpenInvite } from '../../interfaces/db/openInvite'
import { useToast } from '../../lib/stores/toast'
import Switch from 'react-switch'
import styled from '../../lib/styled'
import CopyReadInput from '../atoms/CopyReadInput'
import { getTeamURL, getOpenInviteURL } from '../../lib/utils/patterns'
import { boostHubBaseUrl } from '../../lib/consts'

interface OpenInvitesSectionProps {
  userPermissions: SerializedUserTeamPermissions
}

const OpenInvitesSection = ({ userPermissions }: OpenInvitesSectionProps) => {
  const { t } = useTranslation()
  const { team } = usePage()
  const [fetching, setFetching] = useState<boolean>(true)
  const [sending, setSending] = useState<boolean>(false)
  const [openInvite, setOpenInvite] = useState<
    SerializedOpenInvite | undefined
  >(undefined)
  const { messageBox } = useDialog()
  const { pushAxiosErrorMessage } = useToast()

  useEffectOnce(() => {
    fetchOpenInvite()
  })

  const fetchOpenInvite = useCallback(async () => {
    if (team == null) {
      return
    }
    setFetching(true)
    try {
      const { invite } = await getOpenInvite(team)
      setOpenInvite(invite)
      setFetching(false)
    } catch (error) {
      pushAxiosErrorMessage(error)
    }
  }, [team, pushAxiosErrorMessage])

  const createInvite = useCallback(async () => {
    if (team == null) {
      return
    }

    setSending(true)
    try {
      const { invite } = await createOpenInvite(team)
      setOpenInvite(invite)
    } catch (error) {
      pushAxiosErrorMessage(error)
    }
    setSending(false)
  }, [team, pushAxiosErrorMessage])

  const cancelInvite = useCallback(
    async (invite: SerializedOpenInvite) => {
      if (team == null) {
        return
      }

      messageBox({
        title: `Cancel invite?`,
        message: `Are you sure to cancel this invite? The link won't allow users to join anymore.`,
        iconType: DialogIconTypes.Warning,
        buttons: ['Delete', t('general.cancel')],
        defaultButtonIndex: 0,
        cancelButtonIndex: 1,
        onClose: async (value: number | null) => {
          switch (value) {
            case 0:
              //remove
              setSending(true)
              try {
                await cancelOpenInvite(team, invite)
                setOpenInvite(undefined)
              } catch (error) {
                pushAxiosErrorMessage(error)
              }
              setSending(false)
              return
            default:
              return
          }
        },
      })
    },
    [messageBox, t, team, pushAxiosErrorMessage]
  )

  const resetInvite = useCallback(async () => {
    if (team == null || openInvite == null) {
      return
    }

    messageBox({
      title: `Regenerate Link`,
      message: `Are you sure to reset the current link and generate a new one? The previous link will be depreciated.`,
      iconType: DialogIconTypes.Warning,
      buttons: ['Reset', t('general.cancel')],
      defaultButtonIndex: 0,
      cancelButtonIndex: 1,
      onClose: async (value: number | null) => {
        switch (value) {
          case 0:
            //remove
            setSending(true)
            try {
              const { invite: newInvite } = await resetOpenInvite(
                team,
                openInvite
              )
              setOpenInvite(newInvite)
            } catch (error) {
              pushAxiosErrorMessage(error)
            }
            setSending(false)
            return
          default:
            return
        }
      },
    })
  }, [messageBox, t, team, pushAxiosErrorMessage, openInvite])

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
    <Section>
      <StyledFlex>
        <SectionHeader2 style={{ margin: 0 }}>
          Invite with an open Link
        </SectionHeader2>
        <Switch
          disabled={fetching || sending}
          type='switch'
          id='shared-custom-switch'
          onChange={toggleOpenInvite}
          checked={openInvite != null}
          uncheckedIcon={false}
          checkedIcon={false}
          height={20}
          width={45}
          onColor='#5580DC'
        />
      </StyledFlex>
      {openInviteLink != null && (
        <StyledOpenLinkSection>
          <p>
            You can share this secret link to invite people to this workspace.
            Only admins can see it. You can{' '}
            <StyledResetLinkButton onClick={resetInvite}>
              reset the link
            </StyledResetLinkButton>{' '}
            to generate a new one.
          </p>
          <CopyReadInput text={openInviteLink} />
        </StyledOpenLinkSection>
      )}
      {sending && (
        <SectionRow>
          <Spinner style={{ position: 'relative' }} />
        </SectionRow>
      )}
    </Section>
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
  p {
    margin-bottom: ${({ theme }) => theme.space.default}px;
  }
`

const StyledResetLinkButton = styled.button`
  background-color: transparent;
  padding: 0;
  color: ${({ theme }) => theme.primaryTextColor};

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`

export default OpenInvitesSection
