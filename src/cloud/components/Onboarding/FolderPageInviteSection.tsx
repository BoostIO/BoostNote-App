import { mdiClose } from '@mdi/js'
import copy from 'copy-to-clipboard'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../../../design/components/atoms/Button'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Form from '../../../design/components/molecules/Form'
import { FormSelectOption } from '../../../design/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
import styled from '../../../design/lib/styled'
import { SerializedOpenInvite } from '../../interfaces/db/openInvite'
import { SerializedTeam } from '../../interfaces/db/team'
import { boostHubBaseUrl } from '../../lib/consts'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import {
  OpenInvitesProvider,
  useOpenInvites,
} from '../../lib/stores/openInvites'
import { usePage } from '../../lib/stores/pageStore'
import { useTeamPreferences } from '../../lib/stores/teamPreferences'
import { getOpenInviteURL, getTeamURL } from '../../lib/utils/patterns'

const InviteSection = ({ team }: { team: SerializedTeam }) => {
  const { teamPreferences, toggleItem } = useTeamPreferences()
  const { translate, getRoleLabel } = useI18n()
  const store = useOpenInvites()
  const mountedRef = useRef(false)
  const [selectedInvite, setSelectedInvite] = useState<SerializedOpenInvite>()
  const [copyButtonLabel, setCopyButtonLabel] = useState<string>(
    translate(lngKeys.GeneralCopyVerb)
  )

  const onButtonClick = useCallback(() => {
    if (selectedInvite == null) {
      return
    }

    copy(
      `${boostHubBaseUrl}${getTeamURL(team)}${getOpenInviteURL(selectedInvite)}`
    )
    setCopyButtonLabel(`✓ ${translate(lngKeys.GeneralCopied)}`)
    setTimeout(() => {
      setCopyButtonLabel(translate(lngKeys.GeneralCopyVerb))
    }, 600)
  }, [selectedInvite, team, translate])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (
      mountedRef.current &&
      store.state === 'loaded' &&
      store.openInvites.length > 0
    ) {
      setSelectedInvite(store.openInvites[0])
    }
  }, [store])

  if (
    teamPreferences['hide-onboarding-invite'] ||
    store.state === 'loading' ||
    selectedInvite == null
  ) {
    return null
  }

  const inviteLink = `${boostHubBaseUrl}${getTeamURL(team)}${getOpenInviteURL(
    selectedInvite
  )}`

  return (
    <FolderPageInviteSectionContainer>
      <ColoredBlock variant='secondary' className='invite__section__block'>
        <Flexbox alignItems='flex-start' justifyContent='space-between'>
          <h5>{translate(lngKeys.OnboardingFolderSectionTitle)}</h5>
          <Button
            variant='icon'
            iconPath={mdiClose}
            onClick={() => toggleItem('hide-onboarding-invite')}
            iconSize={16}
          />
        </Flexbox>
        <p>{translate(lngKeys.OnboardingFolderSectionDisclaimer)}</p>
        <Form>
          <FormRow fullWidth={true}>
            <FormRowItem
              item={{
                type: 'input',
                props: {
                  value: inviteLink,
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
                    value: selectedInvite.id,
                  },
                  onChange: (val: FormSelectOption) =>
                    setSelectedInvite(
                      store.openInvites.find(
                        (invite) => val.value === invite.id
                      )!
                    ),
                  options: store.openInvites.map((invite) => {
                    return {
                      label: getRoleLabel(invite.role),
                      value: invite.id,
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
                  onClick: onButtonClick,
                  type: 'button',
                  label: copyButtonLabel,
                },
              }}
            />
          </FormRow>
        </Form>
      </ColoredBlock>
    </FolderPageInviteSectionContainer>
  )
}

const FolderPageInviteSectionContainer = styled.div`
  margin: ${({ theme }) => theme.sizes.spaces.df}px
    ${({ theme }) => theme.sizes.spaces.sm}px;

  .invite__section__block {
    input {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
    h5 {
      margin: 0;
      font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    }
    p {
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
      margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
    .form__row__items {
      > * {
        margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
      }
      flex-wrap: wrap;
    }
  }
`

const FolderPageInviteSection = () => {
  const { team } = usePage()
  const { teamPreferences } = useTeamPreferences()

  if (team == null || teamPreferences['hide-onboarding-invite']) {
    return null
  }

  return (
    <OpenInvitesProvider>
      <InviteSection team={team} />
    </OpenInvitesProvider>
  )
}

export default FolderPageInviteSection
