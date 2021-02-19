import React, { useMemo } from 'react'
import styled from '../../../lib/styled'
import { useGlobalData } from '../../../lib/stores/globalData'
import CustomLink from '../../atoms/Link/CustomLink'
import plur from 'plur'
import {
  StyledProps,
  teamPickerButtonStyle,
} from '../../../lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import TeamLink from '../../atoms/Link/TeamLink'
import cc from 'classcat'
import { usePage } from '../../../lib/stores/pageStore'
import Link from '../../atoms/Link/Link'
import { getHexFromUUID } from '../../../lib/utils/string'
import { stringify } from 'querystring'
import IconMdi from '../../atoms/IconMdi'
import { mdiPlusCircleOutline, mdiLogout } from '@mdi/js'
import TeamIcon from '../../atoms/TeamIcon'
import {
  useGlobalKeyDownHandler,
  useUpDownNavigationListener,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
} from '../../../lib/keyboard'
import { usingElectron, sendToHost } from '../../../lib/stores/electron'
import { boostHubBaseUrl } from '../../../lib/consts'

interface SidebarTeamPickerContextProps {
  setClosed: (val: boolean) => void
}
const SidebarTeamPickerContext = ({
  setClosed,
}: SidebarTeamPickerContextProps) => {
  const {
    globalData: { currentUser, teams, invites },
  } = useGlobalData()
  const { team } = usePage()
  const { t } = useTranslation()
  const pickerRef = React.createRef<HTMLDivElement>()

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isSingleKeyEventOutsideOfInput(event, 'escape')) {
        setClosed(true)
        preventKeyboardEventPropagation(event)
      }
    }
  }, [setClosed])
  useGlobalKeyDownHandler(keydownHandler)
  useUpDownNavigationListener(pickerRef)

  const teamsList = useMemo(() => {
    if (currentUser == null) {
      return null
    }
    const currentTeamId = team != null ? team.id : ''
    return (
      <Scrollable tabIndex={-1}>
        {teams.map((team) => {
          return (
            <TeamLink
              team={team}
              key={team.id}
              className={cc([
                'team-link',
                team.id === currentTeamId && 'active',
              ])}
              id={`teampicker-${team.id}`}
              beforeNavigate={() => setClosed(true)}
            >
              <TeamContainer>
                <StyledTeamIcon>
                  <TeamIcon team={team} />
                </StyledTeamIcon>
                <TeamLabel>
                  <TeamName>{team.name}</TeamName>
                  <TeamSubtitle>
                    - {team.permissions.length}{' '}
                    {plur('Member', team.permissions.length)}
                    {!team.permissions
                      .map((p) => p.userId)
                      .includes(currentUser.id) && ` ( Guest )`}
                  </TeamSubtitle>
                </TeamLabel>
              </TeamContainer>
            </TeamLink>
          )
        })}
        {invites.map((invite) => {
          const query = { t: invite.team.id, i: getHexFromUUID(invite.id) }
          return (
            <Link
              href={`/invite?${stringify(query)}`}
              key={invite.id}
              className={cc(['team-link'])}
              id={`teampicker-invite-${invite.id}`}
              tabIndex={0}
            >
              <TeamContainer>
                <StyledTeamIcon>
                  <TeamIcon team={invite.team} />
                </StyledTeamIcon>
                <TeamLabel>
                  <TeamName>{invite.team.name}</TeamName>
                  <TeamSubtitle>- invited</TeamSubtitle>
                </TeamLabel>
              </TeamContainer>
            </Link>
          )
        })}

        <CustomLink
          href={{ pathname: `/cooperate` }}
          className='team-link team-link-cstm cooperate-link'
          id='teampicker-newteam'
        >
          <SidebarButton tabIndex={-1}>
            <IconMdi path={mdiPlusCircleOutline} />
            Create a New Space
          </SidebarButton>
        </CustomLink>
      </Scrollable>
    )
  }, [teams, team, setClosed, invites, currentUser])

  if (currentUser == null) {
    return null
  }

  return (
    <StyledSidebarTeamPickerContext ref={pickerRef}>
      {teamsList}
      <CustomLink
        href='/api/oauth/signout'
        onClick={(event) => {
          event.preventDefault()
          if (usingElectron) {
            sendToHost('sign-out')
          } else {
            window.location.href = `${boostHubBaseUrl}/api/oauth/signout`
          }
        }}
        isReactLink={false}
        block={true}
        className='team-link team-link-cstm signout-btn'
        id='teampicker-signout-btn'
      >
        <IconMdi path={mdiLogout} />
        {t('general.signOut')} ({currentUser!.displayName})
      </CustomLink>
    </StyledSidebarTeamPickerContext>
  )
}

const contextButtonStyle = ({ theme }: StyledProps) => `
  position: relative;
  width: 100%;
  height: 45px;
  padding: ${theme.space.small}px;
  box-sizing: border-box;
  font-size: ${theme.fontSizes.xxsmall}px;
  text-align: left;
  vertical-align: middle;
  &:hover, &.active {
    background-color: ${theme.subtleBackgroundColor};
  }
`

const StyledSidebarTeamPickerContext = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  padding: ${({ theme }) => theme.space.xsmall}px 0;
  overflow: hidden auto;

  .team-link,
  button,
  a {
    &:focus {
      box-shadow: none !important;
      outline: none;
    }
  }

  .signout-btn {
    ${teamPickerButtonStyle}
  }

  .team-link {
    &:hover {
      color: ${({ theme }) => theme.emphasizedTextColor};
    }

    &:not(.team-link-cstm):focus {
      background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
    }

    &.team-link-cstm {
      &:focus {
        background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
      }
    }
  }
`

const TeamContainer = styled.div`
  display: flex;
  align-items: center;
  ${contextButtonStyle}
`

const StyledTeamIcon = styled.div`
  display: block;
  position: relative;
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  margin-right: ${({ theme }) => theme.space.xsmall}px;
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
    width: 30px;
    height: 30px;
    object-fit: cover;
  }
`
const TeamName = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small}px;
`
const TeamLabel = styled.div`
  color: ${({ theme }) => theme.baseTextColor};
`

const TeamSubtitle = styled.div`
  color: ${({ theme }) => theme.baseTextColor};
  font-size: ${({ theme }) => theme.fontSizes.xxsmall}px;
  line-height: 16px;
`

const SidebarButton = styled.button`
  ${teamPickerButtonStyle}
`

const Scrollable = styled.div`
  flex: 1 1 auto;
  width: 100%;
  padding: 0;
  overflow: hidden auto;

  .team-link {
    display: block;
    width: 100%;
    height: auto;
    text-decoration: none;

    &:hover,
    &.active {
      background-color: ${({ theme }) => theme.secondaryBackgroundColor};
    }
  }
`

export default SidebarTeamPickerContext
