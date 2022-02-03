import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { SectionRow } from './settings/styled'
import { useDialog, DialogIconTypes } from '../../design/lib/stores/dialog'
import { usePage } from '../lib/stores/pageStore'
import { useEffectOnce } from 'react-use'
import {
  getOpenInvites,
  createOpenInvites,
  cancelOpenInvites,
} from '../api/teams/open-invites'
import {
  SerializedUserTeamPermissions,
  TeamPermissionType,
} from '../interfaces/db/userTeamPermissions'
import { SerializedOpenInvite } from '../interfaces/db/openInvite'
import { getTeamURL, getOpenInviteURL } from '../lib/utils/patterns'
import { boostHubBaseUrl } from '../lib/consts'
import { useToast } from '../../design/lib/stores/toast'
import Switch from '../../design/components/atoms/Switch'
import copy from 'copy-to-clipboard'
import Form from '../../design/components/molecules/Form'
import FormRow from '../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../design/components/molecules/Form/templates/FormRowItem'
import { lngKeys } from '../lib/i18n/types'
import { FormSelectOption } from '../../design/components/molecules/Form/atoms/FormSelect'
import { useI18n } from '../lib/hooks/useI18n'
import { useMediaQuery } from 'react-responsive'
import commonTheme from '../../design/lib/styled/common'
import Spinner from '../../design/components/atoms/Spinner'
import styled from '../../design/lib/styled'

interface OpenInvitesSectionProps {
  userPermissions: SerializedUserTeamPermissions
}

const OpenInvitesSection = ({ userPermissions }: OpenInvitesSectionProps) => {
  const { translate, getRoleLabel } = useI18n()
  const { team } = usePage()
  const [fetching, setFetching] = useState<boolean>(true)
  const [sending, setSending] = useState<boolean>(false)
  const [openInvites, setOpenInvites] = useState<SerializedOpenInvite[]>([])
  const { messageBox } = useDialog()
  const { pushApiErrorMessage } = useToast()
  const mountedRef = useRef(false)
  const [copyButtonLabel, setCopyButtonLabel] = useState<string>(
    translate(lngKeys.GeneralCopyVerb)
  )
  const [selectedInviteRole, setSelectedInviteRole] =
    useState<TeamPermissionType>('member')

  const isSmallScreen = useMediaQuery({
    maxWidth: commonTheme.breakpoints.mobile,
  })

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
    getOpenInvites(team.id)
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
      const { invites } = await createOpenInvites(team.id)
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
      title: translate(lngKeys.CancelInvite),
      message: translate(lngKeys.CancelInviteOpenLinkMessage),
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
          label: translate(lngKeys.GeneralDelete),
          onClick: async () => {
            //remove
            setSending(true)
            try {
              await cancelOpenInvites(team.id)
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
  }, [messageBox, team, pushApiErrorMessage, translate])

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

  const copyInviteLinkUrlToClipboard = useCallback(() => {
    if (selectedInvite == null) {
      return
    }

    copy(selectedInvite.link)
    setCopyButtonLabel(`✓ ${translate(lngKeys.GeneralCopied)}`)
    setTimeout(() => {
      setCopyButtonLabel(translate(lngKeys.GeneralCopyVerb))
    }, 600)
  }, [selectedInvite, translate])

  if (openInvites.length === 0 && userPermissions.role === 'viewer') {
    return null
  }

  return (
    <section>
      <StyledFlex>
        <h2 style={{ margin: 0 }}>{translate(lngKeys.InviteAddWithLink)}</h2>
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
          <Form>
            {isSmallScreen ? (
              <>
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
                          setSelectedInviteRole(
                            val.value as TeamPermissionType
                          ),
                        options: openInvites.map((invite) => {
                          return {
                            label: getRoleLabel(invite.role),
                            value: invite.role,
                          }
                        }),
                      },
                    }}
                  />
                </FormRow>
                <FormRow fullWidth={true}>
                  <FormRowItem
                    flex='0 0 100px !important'
                    item={{
                      type: 'button',
                      props: {
                        type: 'button',
                        label: copyButtonLabel,
                      },
                    }}
                  />
                </FormRow>
              </>
            ) : (
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
                      type: 'button',
                      label: copyButtonLabel,
                      onClick: copyInviteLinkUrlToClipboard,
                    },
                  }}
                />
              </FormRow>
            )}
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
  margin: ${({ theme }) => theme.sizes.spaces.md}px 0
    ${({ theme }) => theme.sizes.spaces.df}px;
`

const StyledOpenLinkSection = styled.div`
  .link-reset {
    padding: 0;
    margin: 0;
  }

  p {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

export default OpenInvitesSection
