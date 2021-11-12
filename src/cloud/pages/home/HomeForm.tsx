import UserIcon from '../../components/UserIcon'
import Form from '../../../design/components/molecules/Form'
import React, { useCallback } from 'react'
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
import { useElectron } from '../../lib/stores/electron'

interface HomePageTeamSelectForm {
  user: SerializedUser
  teams: (SerializedTeamWithPermissions & {
    subscription?: SerializedSubscription
  })[]
}

const HomeForm = ({ user, teams = [] }: HomePageTeamSelectForm) => {
  const { push } = useRouter()
  const { translate } = useI18n()
  const { usingElectron } = useElectron()
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
      location.href = '/api/oauth/signout?redirectTo=/desktop'
    } else {
      location.href = '/api/oauth/signout'
    }
  }, [usingElectron])

  return (
    <Container>
      <Form
        fullWidth={true}
        rows={[
          {
            items: [
              {
                type: 'node',
                element: (
                  <Image src={'/static/logo.png'} className={'intro__logo'} />
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
          {
            items: [
              {
                type: 'node',
                element: (
                  <div className='intro__user'>
                    <span className='intro__user__prefix'>Signed in as </span>
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
