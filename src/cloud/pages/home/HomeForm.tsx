import UserIcon from '../../components/UserIcon'
import Form from '../../../design/components/molecules/Form'
import React, { useCallback, useState } from 'react'
import { useRouter } from '../../lib/router'
import styled from '../../../design/lib/styled'
import { SerializedUser } from '../../interfaces/db/user'
import {
  SerializedTeam,
  SerializedTeamWithPermissions,
} from '../../interfaces/db/team'
import { SerializedSubscription } from '../../interfaces/db/subscription'
import Image from '../../../design/components/atoms/Image'
import { getTeamLinkHref } from '../../components/Link/TeamLink'
import { lngKeys } from '../../lib/i18n/types'
import { useI18n } from '../../lib/hooks/useI18n'
import Button from '../../../design/components/atoms/Button'
import { sendToHost, useElectron } from '../../lib/stores/electron'
import { useEffectOnce } from 'react-use'
import { FormRowProps } from '../../../design/components/molecules/Form/templates/FormRow'
import AnnouncementAlert from '../../components/AnnouncementAlert'

interface HomePageTeamSelectForm {
  user: SerializedUser
  teams: (SerializedTeamWithPermissions & {
    subscription?: SerializedSubscription
  })[]
}

const HomeForm = ({ user, teams = [] }: HomePageTeamSelectForm) => {
  const { push, query } = useRouter()
  const { translate } = useI18n()
  const { usingElectron } = useElectron()
  const [ready, setReady] = useState(false)
  const navigateToTeam = useCallback(
    (selectedTeamId) => {
      const selectedTeam = teams.find(
        (team: SerializedTeam) => team.id == selectedTeamId
      )
      if (selectedTeam == null) {
        return
      }
      const teamHref = getTeamLinkHref(
        { id: selectedTeam.id, domain: selectedTeam.domain },
        'index'
      )
      push(teamHref)
    },
    [push, teams]
  )

  const signOutCloud = useCallback(() => {
    if (usingElectron) {
      sendToHost('sign-out-event')
      location.href = '/api/user/signout?redirectTo=/desktop'
    } else {
      location.href = '/api/user/signout'
    }
  }, [usingElectron])

  useEffectOnce(() => {
    if (query['desktop-init'] === 'true' && teams[0] != null) {
      const teamHref = getTeamLinkHref(
        { id: teams[0].id, domain: teams[0].domain },
        'index'
      )
      push(teamHref)
      return
    }
    setReady(true)
  })

  return (
    <Container>
      <AnnouncementAlert />
      <Form
        fullWidth={true}
        rows={[
          {
            items: [
              {
                type: 'node',
                element: (
                  <Image
                    src={'/app/static/images/logo.png'}
                    className={'intro__logo'}
                  />
                ),
              },
            ],
          },
          {
            items: [
              {
                type: 'node',
                element: (
                  <h1 className='intro__heading'>Welcome to Boost Note!</h1>
                ),
              },
            ],
          },
          ...(ready
            ? ([
                {
                  items: [
                    {
                      type: 'node',
                      element: (
                        <div className='intro__user'>
                          <span className='intro__user__prefix'>
                            Signed in as{' '}
                          </span>
                          <UserIcon className='intro__user__icon' user={user} />{' '}
                          <span className='intro__user__displayName'>
                            {user.displayName}
                          </span>
                          <span>
                            (
                            <Button variant={'link'} onClick={signOutCloud}>
                              {translate(lngKeys.GeneralSignout)}
                            </Button>
                            )
                          </span>
                        </div>
                      ),
                    },
                  ],
                },
                {
                  items: [
                    {
                      type: 'select--string',
                      props: {
                        value: 'Select team',
                        onChange: navigateToTeam,
                        options: teams.map((team) => team.id),
                        labels: teams.map((team) => team.name),
                      },
                    },
                  ],
                },
                {
                  items: [
                    {
                      type: 'button',
                      props: {
                        label: 'Create space',
                        variant: 'primary',
                        onClick: () => push('/cooperate'),
                      },
                    },
                  ],
                },
              ] as FormRowProps[])
            : []),
        ]}
      />
    </Container>
  )
}

const Container = styled.div`
  display: block;
  width: 100%;
  padding-top: ${({ theme }) => theme.sizes.spaces.xl}px;
  position: relative;
  padding: ${({ theme }) => theme.sizes.spaces.md}px;
  max-width: 700px;
  margin: 0 auto;

  .intro {
    margin-top: ${({ theme }) => theme.sizes.spaces.xl}px;
  }
  .intro__logo {
    max-width: 240px;
  }
  .intro__heading {
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
  }
  .intro__description {
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
  }

  .speceSelector {
    display: flex;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
    width: 100%;
    height: 48px;
    align-items: center;
    border: none;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.variants.secondary.text};
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
  }

  .intro__user {
    display: flex;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.md}px;
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    align-items: center;
  }
  .intro__user__prefix {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .intro__user__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
  .intro__user__displayName {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default HomeForm
