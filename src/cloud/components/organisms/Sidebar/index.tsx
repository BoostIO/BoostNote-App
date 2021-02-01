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

interface SidebarProps {
  setFocused: (val: boolean) => void
}

const Sidebar = ({ setFocused }: SidebarProps) => {
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
        <SidebarVerticalScroller />
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
`

export default Sidebar
