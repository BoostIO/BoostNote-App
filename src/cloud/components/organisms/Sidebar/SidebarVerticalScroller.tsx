import React, { useCallback, useMemo } from 'react'
import styled from '../../../lib/styled'
import SidebarTeamLinks from './SidebarTeamLinks'
import SidebarTags from './SidebarTags'
import SidebarBookmarks from './SidebarBookmarks'
import { useNav } from '../../../lib/stores/nav'
import Spinner from '../../atoms/CustomSpinner'
import { useSettings } from '../../../lib/stores/settings'
import { mdiCogOutline, mdiCircleSmall } from '@mdi/js'
import IconMdi from '../../atoms/IconMdi'
import SidebarTopButton from './SidebarTopButton'
import SidebarWorkspaces from './SidebarWorkspaces'
import Flexbox from '../../atoms/Flexbox'
import SidebarMore from './SidebarMore'
import { usePage } from '../../../lib/stores/pageStore'
import { OnboardingPastille } from '../Onboarding/styled'
import { updateTeam } from '../../../api/teams'

const SidebarVerticalScroller = () => {
  const { team, setPartialPageData } = usePage()
  const { initialLoadDone } = useNav()
  const { openSettingsTab } = useSettings()

  const hideSettingsNotice = useMemo(() => {
    return team != null && team.state.settings === true
  }, [team])

  const settingsOnClickHandler = useCallback(async () => {
    openSettingsTab('teamMembers')

    if (team == null) {
      return
    }

    if (team.state.settings) {
      return
    }

    setPartialPageData({
      team: { ...team, state: { ...team.state, settings: true } },
    })
    try {
      await updateTeam(team.id, {
        name: team.name,
        state: JSON.stringify({ ...team.state, settings: true }),
      })
    } catch (error) {}
  }, [openSettingsTab, setPartialPageData, team])

  return (
    <StyledSidebarVerticalScroller>
      <StyledPaddedWrapper>
        <SidebarTeamLinks />
        <SidebarTopButton
          onClick={settingsOnClickHandler}
          id='sidebar-settings'
          variant='transparent'
          label={
            <>
              <IconMdi
                path={mdiCogOutline}
                size={19}
                style={{ marginRight: 4 }}
              />
              Settings &amp; Members
              {!hideSettingsNotice && (
                <OnboardingPastille
                  style={{
                    marginLeft: 14,
                    verticalAlign: 'middle',
                    width: 12,
                    height: 12,
                  }}
                />
              )}
            </>
          }
          prependIcon={mdiCircleSmall}
        ></SidebarTopButton>
      </StyledPaddedWrapper>

      {initialLoadDone ? (
        <>
          <StyledPaddedWrapper>
            <SidebarBookmarks />
          </StyledPaddedWrapper>
          <StyledWorkspacesWrapper>
            <StyledPaddedWrapper>
              <SidebarWorkspaces />
            </StyledPaddedWrapper>
          </StyledWorkspacesWrapper>
          <StyledPaddedWrapper>
            <SidebarTags />
            <SidebarMore />
          </StyledPaddedWrapper>
        </>
      ) : (
        <Flexbox justifyContent='center' style={{ marginTop: 20 }}>
          <Spinner />
        </Flexbox>
      )}
    </StyledSidebarVerticalScroller>
  )
}

export default SidebarVerticalScroller

const StyledWorkspacesWrapper = styled.div`
  margin: 20px 0;
  padding: 20px 0;
  border-top: 1px solid ${({ theme }) => theme.subtleBorderColor};
  border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
`
const StyledPaddedWrapper = styled.div`
  padding: 0 ${({ theme }) => theme.space.small}px;
`
const StyledSidebarVerticalScroller = styled.div`
  overflow: hidden auto;
  margin-right: 0;
  margin-top: ${({ theme }) => theme.space.xsmall}px;
  margin-bottom: ${({ theme }) => theme.space.xsmall}px;
  width: 100%;
  flex: 1 1 auto;
  min-height: 200px;
  ::-webkit-scrollbar {
    display: none;
  }
`
