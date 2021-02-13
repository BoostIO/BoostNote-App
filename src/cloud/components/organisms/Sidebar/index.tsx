import React, { useMemo, useCallback } from 'react'
import styled from '../../../lib/styled'
import SidebarVerticalScroller from './SidebarVerticalScroller'
import { usePreferences } from '../../../lib/stores/preferences'
import {
  useGlobalKeyDownHandler,
  preventKeyboardEventPropagation,
  useUpDownNavigationListener,
} from '../../../lib/keyboard'
import { focusFirstChildFromElement } from '../../../lib/dom'
import { isFocusLeftSideShortcut } from '../../../lib/shortcuts'
import SidebarTeamSwitch from './SidebarTeamSwitch'
import { usePage } from '../../../lib/stores/pageStore'
import GuestSidebarScroller from './GuestSidebarScroller'
import CustomLink from '../../atoms/Link/CustomLink'
import { mdiPlusCircleOutline } from '@mdi/js'
import Icon from '../../atoms/Icon'

interface SidebarProps {
  setFocused: (val: boolean) => void
}

const Sidebar = ({ setFocused }: SidebarProps) => {
  const { currentUserPermissions } = usePage()
  const { hoverSidebarOn, hoverSidebarOff } = usePreferences()
  const treeRef = React.createRef<HTMLDivElement>()

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isFocusLeftSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(treeRef.current)
        setFocused(true)
      }
    }
  }, [treeRef, setFocused])
  useGlobalKeyDownHandler(keydownHandler)
  useUpDownNavigationListener(treeRef)

  const onBlurHandler = useCallback(
    (event: any) => {
      if (
        document.activeElement == null ||
        !event.currentTarget.contains(event.relatedTarget)
      ) {
        setFocused(false)
      }
    },
    [setFocused]
  )

  return (
    <StyledSidebar
      onMouseEnter={() => hoverSidebarOn()}
      onMouseLeave={() => hoverSidebarOff()}
      onBlur={onBlurHandler}
    >
      <SidebarTeamSwitch />
      <div className='clip' ref={treeRef}>
        {currentUserPermissions == null ? (
          <>
            <GuestSidebarScroller />
            <div className='sidebar__footer'>
              You are current a guest in this team. To see all the workspace
              folders and documents, ask an invitee to promote you to a member
              or admin.
              <CustomLink
                href={{ pathname: `/cooperate` }}
                className='team-link team-link-cstm cooperate-link'
                id='sidebar-footr-newteam'
              >
                <div className='sidebar__footer__button' tabIndex={-1}>
                  <Icon path={mdiPlusCircleOutline} />
                  Create a New Team
                </div>
              </CustomLink>
            </div>
          </>
        ) : (
          <SidebarVerticalScroller />
        )}
      </div>
    </StyledSidebar>
  )
}

const StyledSidebar = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.sideNavBackgroundColor};

  hr {
    float: left;
    width: 100%;
    margin: 0;
    clear: both;
    border: 0;
    border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
  }

  .sidebar__footer {
    border-top: 1px solid ${({ theme }) => theme.baseBorderColor};
    padding: ${({ theme }) => theme.space.xsmall}px
      ${({ theme }) => theme.space.small}px;
    font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
    color: ${({ theme }) => theme.subtleTextColor};
  }
  .sidebar__footer__button {
    display: flex;
    transition: 200ms color;
    border-radius: 3px;
    width: 100%;
    margin-top: ${({ theme }) => theme.space.xxsmall}px;
    padding: ${({ theme }) => theme.space.xxsmall}px
      ${({ theme }) => theme.space.small}px;
    background: none;
    color: ${({ theme }) => theme.subtleTextColor};
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    text-align: left;
    svg {
      margin-right: ${({ theme }) => theme.space.xxsmall}px;
      color: ${({ theme }) => theme.baseIconColor};
      font-size: ${({ theme }) => theme.fontSizes.large}px;
      vertical-align: text-bottom;
    }
    &:hover,
    &.active {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
      color: ${({ theme }) => theme.emphasizedTextColor};
      svg {
        color: ${({ theme }) => theme.emphasizedIconColor};
      }
    }
  }
`

export default Sidebar
