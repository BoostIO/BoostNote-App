import React, { useMemo, useState, useCallback } from 'react'
import { getOAuthPageData, OAuthPageData } from '../../api/pages/oauth'
import { SerializedTeam } from '../../interfaces/db/team'
import { stringify } from 'querystring'
import CustomButton from '../../components/atoms/buttons/CustomButton'
import styled from '../../lib/styled'
import TeamIcon from '../../components/atoms/TeamIcon'
import IconMdi from '../../components/atoms/IconMdi'
import {
  mdiChevronDown,
  mdiCompareVertical,
  mdiExclamationThick,
  mdiLockOpenOutline,
  mdiLockOutline,
} from '@mdi/js'
import UserIcon from '../../components/atoms/UserIcon'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { useRouter } from '../../lib/router'

const OAuthAuthorizePage = (data: OAuthPageData) => {
  const router = useRouter()
  const [selectedTeam, setSelectedTeam] = useState<SerializedTeam | undefined>(
    data.teams[0]
  )
  const [teamSelectOpen, setTeamSelectOpen] = useState(false)
  const authUrl = useMemo(() => {
    return `/api/oauth2/authorize?${stringify({
      ...router.query,
      team_id: selectedTeam != null ? selectedTeam.id : null,
    })}`
  }, [selectedTeam, router.query])

  const denyUrl = useMemo(() => {
    return `/api/oauth2/authorize?${stringify({
      ...router.query,
      reject: true,
    })}`
  }, [router.query])

  const toggleTeamSelect = useCallback(() => {
    setTeamSelectOpen((prev) => !prev)
  }, [])

  const changeUserUrl = useMemo(() => {
    return `/api/oauth/signout?${stringify({
      redirectTo: `/api/oauth2/authorize?${stringify({ ...router.query })}`,
    })}`
  }, [router.query])

  const selectTeams = useMemo(() => {
    if (selectedTeam == null) {
      return data.teams
    }
    return data.teams.filter((team) => team.id !== selectedTeam.id)
  }, [selectedTeam, data.teams])

  const permissionDescriptions = useMemo(() => {
    const scopeSet = new Set(data.scope)
    const descriptions = new Set<string>()

    if (scopeSet.has('user.read')) {
      descriptions.add('Read your name and icon url')
    }

    if (scopeSet.has('doc.read')) {
      descriptions.add(
        'Read documents in the selected team you have permission for'
      )
    }

    if (scopeSet.has('doc.create')) {
      descriptions.add('Create documents in the selected team')
    }

    if (scopeSet.has('doc.update')) {
      descriptions.add(
        'Update and edit documents in the selected team you have permission for'
      )
    }

    if (scopeSet.has('hooks')) {
      descriptions.add('Subscribe to document events (create, update)')
    }

    return Array.from(descriptions.values())
  }, [data.scope])

  return (
    <StyledOAuthPage>
      <div className='logo'>
        <a href='/'>
          <img
            src='/app/static/images/logo_boostnote_forteams.svg'
            alt='Boost Note for Teams'
          />
        </a>
      </div>
      <main>
        <section>
          <header>
            Would you like to authorize the following service to have access to{' '}
            <strong>{selectedTeam != null ? selectedTeam.name : 'team'}</strong>
            ?
          </header>
        </section>
        <section>
          <StyledAuthDetails>
            <h2>{data.clientName}</h2>
            <IconMdi path={mdiCompareVertical} size={40} />
            <StyledTeamSelect>
              {selectedTeam != null && (
                <div className='team-info' onClick={toggleTeamSelect}>
                  <StyledTeamIconWrapper>
                    <TeamIcon team={selectedTeam} />
                  </StyledTeamIconWrapper>
                  <div className='label'>
                    <span>
                      {selectedTeam.name} <IconMdi path={mdiChevronDown} />
                    </span>
                  </div>
                </div>
              )}
              <div className='team-select-wrapper'>
                {teamSelectOpen && (
                  <div className='team-select'>
                    {selectTeams.map((team) => (
                      <div
                        className='team-info'
                        key={team.id}
                        onClick={() => {
                          setSelectedTeam(team)
                          setTeamSelectOpen(false)
                        }}
                      >
                        <StyledTeamIconWrapper>
                          <TeamIcon team={team} />
                        </StyledTeamIconWrapper>
                        <div className='label'>{team.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </StyledTeamSelect>
            <StyledUserInfo>
              <p>You are logged in as:</p>
              <div className='user-details'>
                <UserIcon user={data.user} />
                <span>{data.user.displayName}</span>
              </div>
            </StyledUserInfo>
            <a href={changeUserUrl} className='user-switch'>
              <CustomButton variant='transparent'>Switch User</CustomButton>
            </a>
          </StyledAuthDetails>
        </section>
        <section>
          <StyledInfoSection>
            <IconMdi path={mdiExclamationThick} size={24} />{' '}
            <div>
              <strong>{data.clientName}</strong> will only be able to access
              team resource <strong>you have permission for</strong>.
            </div>
          </StyledInfoSection>
        </section>
        <section>
          <StyledInfoSection>
            <IconMdi path={mdiLockOpenOutline} size={24} />{' '}
            <div>
              <strong>{data.clientName}</strong> will be able to:
              <ul>
                {permissionDescriptions.map((description) => (
                  <li key={description}>{description}.</li>
                ))}
              </ul>
            </div>
          </StyledInfoSection>
        </section>
        <section>
          <StyledInfoSection>
            <IconMdi path={mdiLockOutline} size={24} />{' '}
            <div>
              <strong>{data.clientName}</strong> will be <strong>NOT</strong>{' '}
              able to:
              <ul>
                <li>
                  Read your email or other user info from connected accounts.
                </li>
                <li>Delete documents or folders.</li>
              </ul>
            </div>
          </StyledInfoSection>
        </section>
        <section>
          <StyledButtonWrapper>
            <CustomButton variant='transparent'>
              <a href={denyUrl}>Deny</a>
            </CustomButton>
            <CustomButton>
              <a href={authUrl}>Authorize</a>
            </CustomButton>
          </StyledButtonWrapper>
        </section>
      </main>
    </StyledOAuthPage>
  )
}

OAuthAuthorizePage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const data = await getOAuthPageData(params)
  return data
}

export default OAuthAuthorizePage

const StyledOAuthPage = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.baseBackgroundColor};

  .logo {
    display: flex;
    justify-content: center;
    margin: ${({ theme }) => theme.space.default}px 0;

    & img {
      height: 70px;
      vertical-align: middle;
    }
  }

  main {
    background-color: ${({ theme }) => theme.baseBackgroundColor};
    color: ${({ theme }) => theme.emphasizedTextColor};
    box-shadow: 0 2px 40px 0 rgba(0, 0, 0, 0.06);
    width: 100%;
    max-width: 600px;
    padding: ${({ theme }) => theme.space.small}px
      ${({ theme }) => theme.space.small}px;
    margin: 0 auto;

    & > section {
      border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
      padding: ${({ theme }) => theme.space.small}px
        ${({ theme }) => theme.space.default}px;

      &:last-child {
        border-bottom: none;
      }
    }
  }

  header {
    text-align: center;
    font-size: ${({ theme }) => theme.fontSizes.medium}px;
  }
`

const StyledAuthDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  svg {
    color: ${({ theme }) => theme.subtleIconColor};
  }

  .user-switch {
    align-self: end;
  }
`

const StyledUserInfo = styled.div`
  margin-top: ${({ theme }) => theme.space.small}px;

  p {
    margin-bottom: ${({ theme }) => theme.space.xsmall}px;
  }

  .user-details {
    display: flex;
    justify-content: center;
    align-items: center;
    & > span {
      margin-left: ${({ theme }) => theme.space.small}px;
    }
  }
`

const StyledInfoSection = styled.div`
  display: flex;
  align-items: center;

  svg {
    margin-right: ${({ theme }) => theme.space.default}px;
    flex: 0 0 auto;
  }
`

const StyledTeamSelect = styled.div`
  .team-select-wrapper {
    position: relative;
    .team-select {
      border: 1px solid ${({ theme }) => theme.baseBorderColor};
      position: absolute;
      background-color: ${({ theme }) => theme.baseBackgroundColor};
      z-index: 100;
      width: 100%;
    }
  }

  .team-info {
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    padding: ${({ theme }) => theme.space.xsmall}px;
    text-align: left;
    vertical-align: middle;
    &:hover,
    &.active {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
    }

    .label {
      font-size: ${({ theme }) => theme.fontSizes.large}px;
    }
  }
`

const StyledTeamIconWrapper = styled.div`
  display: block;
  position: relative;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  margin-right: ${({ theme }) => theme.space.xsmall}px;
  background: ${({ theme }) => theme.secondaryBackgroundColor};
  border-radius: 4px;
  overflow: hidden;

  svg {
    padding: 0;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const StyledButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
`
