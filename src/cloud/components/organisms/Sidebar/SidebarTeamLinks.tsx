import React, { useCallback, useEffect } from 'react'
import styled from '../../../lib/styled'
import { usePage } from '../../../lib/stores/pageStore'
import Tooltip from '../../atoms/Tooltip'
import { useNav } from '../../../lib/stores/nav'
import cc from 'classcat'
import { MetaKeyText } from '../../../lib/keyboard'
import { useSearch } from '../../../lib/stores/search'
import SidebarTopButton from './SidebarTopButton'
import { mdiMagnify, mdiPlus, mdiClockOutline, mdiCircleSmall } from '@mdi/js'
import IconMdi from '../../atoms/IconMdi'
import { useNavigateToTeam } from '../../atoms/Link/TeamLink'
import Flexbox from '../../atoms/Flexbox'
import SidebarNewDocControls from './SideNavigator/SidebarNewDocControls'
import { useRouter } from '../../../lib/router'
import { newNoteEventEmitter } from '../../../lib/utils/events'
import { useElectron } from '../../../lib/stores/electron'
import { useToast } from '../../../../lib/v2/stores/toast'

const SidebarTeamLinks = () => {
  const { team, currentSubInfo } = usePage()
  const {
    createDocHandler,
    currentParentFolder,
    currentParentFolderId,
    currentWorkspaceId,
    sideNavCreateButtonState,
    setSideNavCreateButtonState,
  } = useNav()
  const { setShowGlobalSearch } = useSearch()
  const { pushApiErrorMessage } = useToast()
  const { pathname } = useRouter()
  const navigateToTeam = useNavigateToTeam()
  const { usingElectron } = useElectron()

  const createDocButtonClickHandler = useCallback(async () => {
    if (sideNavCreateButtonState != null) {
      return
    }
    setSideNavCreateButtonState('sending')
    try {
      await createDocHandler({
        parentFolderId: currentParentFolderId,
        workspaceId: currentWorkspaceId,
      })
    } catch (error) {
      if (error.response.data.includes('exceeds the free tier')) {
        return
      }

      pushApiErrorMessage(error)
    }
    setSideNavCreateButtonState()
  }, [
    currentParentFolderId,
    createDocHandler,
    pushApiErrorMessage,
    currentWorkspaceId,
    sideNavCreateButtonState,
    setSideNavCreateButtonState,
  ])

  useEffect(() => {
    newNoteEventEmitter.listen(createDocButtonClickHandler)
    return () => {
      newNoteEventEmitter.unlisten(createDocButtonClickHandler)
    }
  }, [createDocButtonClickHandler])

  const newDocButtonIsDisabled =
    sideNavCreateButtonState != null ||
    (currentSubInfo != null &&
      !currentSubInfo.trialing &&
      currentSubInfo.info.overLimit)

  if (team == null) {
    return null
  }

  return (
    <StyledSidebarTeamLinks>
      <SidebarTopButton
        onClick={() => setShowGlobalSearch(true)}
        id='sidebar-search'
        variant='emphasized'
        justify='space-between'
        label='Search'
        prependIcon={mdiMagnify}
        addedNodes={
          <StyledSideNavHeadingButtonTooltip className='hovered'>
            {`${MetaKeyText()} P`}
          </StyledSideNavHeadingButtonTooltip>
        }
      />

      <Flexbox flex='1 1 auto'>
        <Tooltip
          tooltip={
            usingElectron ? (
              <div>
                <span className='tooltip-text'>Create new document</span>
                <span className='tooltip-command'>{`${MetaKeyText()} N`}</span>
              </div>
            ) : (
              'Create new document'
            )
          }
          className='tooltip-tag'
        >
          <SidebarTopButton
            onClick={createDocButtonClickHandler}
            id='sidebar-createDoc'
            variant='blue'
            label='New doc'
            onboardingId='sidebarCreateDocButton'
            prependIcon={mdiPlus}
            disabled={newDocButtonIsDisabled}
            sending={sideNavCreateButtonState === 'sending'}
            className={cc([sideNavCreateButtonState != null && 'disabled'])}
            addedNodes={
              currentParentFolder != null ? (
                <StyledNewDocButtonSmall className='hovered'>
                  in {currentParentFolder.name}
                </StyledNewDocButtonSmall>
              ) : null
            }
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          />
        </Tooltip>

        <SidebarNewDocControls disabled={newDocButtonIsDisabled} />
      </Flexbox>
      <SidebarTopButton
        onClick={() => navigateToTeam(team, 'timeline')}
        id='sidebar-timeline'
        variant='transparent'
        active={pathname === '/[teamId]/timeline'}
        label={
          <>
            <IconMdi
              path={mdiClockOutline}
              size={19}
              style={{ marginRight: 4 }}
            />
            Timeline
          </>
        }
        prependIcon={mdiCircleSmall}
      />
    </StyledSidebarTeamLinks>
  )
}

const StyledSidebarTeamLinks = styled.div`
  .tooltip-tag {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    width: 100% !important;
  }
`

const StyledSideNavHeadingButtonTooltip = styled.small`
  color: ${({ theme }) => theme.emphasizedTextColor};
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  padding: 2px 3px;
  margin-right: ${({ theme }) => theme.space.xsmall}px;
`

const StyledNewDocButtonSmall = styled.small`
  padding-left: ${({ theme }) => theme.space.xsmall}px;
  font-size: ${({ theme }) => theme.fontSizes.xxsmall}px;
  opacity: 0.8;
  pointer-events: none;
  line-height: inherit;
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export default SidebarTeamLinks
