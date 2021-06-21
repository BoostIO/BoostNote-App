import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { SectionRow } from '../organisms/settings/styled'
import { useDialog, DialogIconTypes } from '../../../shared/lib/stores/dialog'
import { usePage } from '../../lib/stores/pageStore'
import { useEffectOnce } from 'react-use'
import {
  getOpenInvites,
  createOpenInvites,
  cancelOpenInvites,
} from '../../api/teams/open-invites'
import { Spinner } from '../atoms/Spinner'
import {
  SerializedUserTeamPermissions,
  TeamPermissionType,
} from '../../interfaces/db/userTeamPermissions'
import { SerializedOpenInvite } from '../../interfaces/db/openInvite'
import styled from '../../lib/styled'
import { getTeamURL, getOpenInviteURL } from '../../lib/utils/patterns'
import { boostHubBaseUrl } from '../../lib/consts'
import { useToast } from '../../../shared/lib/stores/toast'
import Switch from '../../../shared/components/atoms/Switch'
import copy from 'copy-to-clipboard'
import Form from '../../../shared/components/molecules/Form'
import FormRow from '../../../shared/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../shared/components/molecules/Form/templates/FormRowItem'
import { lngKeys } from '../../lib/i18n/types'
import { FormSelectOption } from '../../../shared/components/molecules/Form/atoms/FormSelect'
import { useI18n } from '../../lib/hooks/useI18n'

interface OpenInvitesSectionProps {
  userPermissions: SerializedUserTeamPermissions
}

const OpenInvitesSection = ({ userPermissions }: OpenInvitesSectionProps) => {
  const { t, getRoleLabel } = useI18n()
  const { team } = usePage()
  const [fetching, setFetching] = useState<boolean>(true)
  const [sending, setSending] = useState<boolean>(false)
  const [openInvites, setOpenInvites] = useState<SerializedOpenInvite[]>([])
  const { messageBox } = useDialog()
  const { pushApiErrorMessage } = useToast()
  const mountedRef = useRef(false)
  const [copyButtonLabel, setCopyButtonLabel] = useState<string>(
    t(lngKeys.Copy)
  )
  const [selectedInviteRole, setSelectedInviteRole] = useState<
    TeamPermissionType
  >('member')

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffectOnce(() => {
    fetchOpenInvites()
  })

  const fetchOpenInvites = useCallback(async () => {
    if (team == null) {
      return
    }
    setFetching(true)
    getOpenInvites(team)
      .then(({ invites }) => {
        if (!mountedRef.current) {
          return
        }
        setOpenInvites(invites)
        if (invites.length > 0) {
          setSelectedInviteRole(invites[0].role)
        }
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

  const createInvites = useCallback(async () => {
    if (team == null) {
      return
    }

    setSending(true)
    try {
      const { invites } = await createOpenInvites(team)
      setOpenInvites(invites)
    } catch (error) {
      pushApiErrorMessage(error)
    }
    setSending(false)
  }, [team, pushApiErrorMessage])

  const cancelInvites = useCallback(async () => {
    if (team == null) {
      return
    }

    messageBox({
      title: t(lngKeys.CancelInvite),
      message: t(lngKeys.CancelInviteOpenLinkMessage),
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
          label: t(lngKeys.GeneralDelete),
          onClick: async () => {
            //remove
            setSending(true)
            try {
              await cancelOpenInvites(team)
              setOpenInvites([])
            } catch (error) {
              pushApiErrorMessage(error)
            }
            setSending(false)
            return
          },
        },
      ],
    })
  }, [messageBox, team, pushApiErrorMessage, t])

  const toggleOpenInvite = useCallback(() => {
    if (openInvites.length !== 0) {
      cancelInvites()
      return
    }

    createInvites()
  }, [openInvites, cancelInvites, createInvites])

  const selectedInvite = useMemo(() => {
    if (openInvites.length === 0 || team == null) {
      return undefined
    }

    const selectedInvite = openInvites.find(
      (invite) => invite.role === selectedInviteRole
    )
    if (selectedInvite == null) {
      return undefined
    }

    return {
      role: selectedInvite.role,
      link: `${boostHubBaseUrl}${getTeamURL(team)}${getOpenInviteURL(
        selectedInvite
      )}`,
    }
  }, [team, openInvites, selectedInviteRole])

  const onFormSubmit = useCallback(() => {
    if (selectedInvite == null) {
      return
    }

    copy(selectedInvite.link)
    setCopyButtonLabel(`✓ ${t(lngKeys.Copied)}`)
    setTimeout(() => {
      setCopyButtonLabel(t(lngKeys.Copy))
    }, 600)
  }, [selectedInvite, t])

  if (openInvites.length === 0 && userPermissions.role === 'viewer') {
    return null
  }

  return (
    <section>
      <StyledFlex>
        <h2 style={{ margin: 0 }}>{t(lngKeys.InviteWithOpenLink)}</h2>
        {userPermissions.role !== 'viewer' && (
          <Switch
            disabled={fetching || sending}
            id='shared-custom-switch'
            onChange={toggleOpenInvite}
            checked={openInvites.length !== 0}
          />
        )}
      </StyledFlex>
      {selectedInvite != null && (
        <StyledOpenLinkSection>
          <Form onSubmit={onFormSubmit}>
            <FormRow fullWidth={true}>
              <FormRowItem
                item={{
                  type: 'input',
                  props: {
                    value: selectedInvite.link,
                    readOnly: true,
                  },
                }}
              />
              <FormRowItem
                flex='0 0 150px'
                item={{
                  type: 'select',
                  props: {
                    value: {
                      label: getRoleLabel(selectedInvite.role),
                      value: selectedInvite.role,
                    },
                    onChange: (val: FormSelectOption) =>
                      setSelectedInviteRole(val.value as TeamPermissionType),
                    options: openInvites.map((invite) => {
                      return {
                        label: getRoleLabel(invite.role),
                        value: invite.role,
                      }
                    }),
                  },
                }}
              />
              <FormRowItem
                flex='0 0 100px !important'
                item={{
                  type: 'button',
                  props: {
                    type: 'submit',
                    label: copyButtonLabel,
                  },
                }}
              />
            </FormRow>
          </Form>
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
