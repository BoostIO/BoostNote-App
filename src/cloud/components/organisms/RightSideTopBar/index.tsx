import React from 'react'
import { usePreferences } from '../../../lib/stores/preferences'
import {
  StyledRightSideTopbar,
  StyledTopbarLeft,
  StyledTopBarInlineFlex,
  StyledTopbarRight,
} from './styled'
import TopBarSideNavToggle from './TopBarSideNavToggle'

interface RightSideTopBarProps {
  left: React.ReactNode
  right?: React.ReactNode
  displaySidebarToggle?: boolean
}

const RightSideTopBar = ({
  left,
  right,
  displaySidebarToggle = true,
}: RightSideTopBarProps) => {
  const { preferences } = usePreferences()

  return (
    <StyledRightSideTopbar
      style={{
        width: `calc(100vw - ${preferences.sideBarWidth}px)`,
        left: preferences.sideBarWidth,
      }}
    >
      <StyledTopbarLeft>
        {displaySidebarToggle && <TopBarSideNavToggle />}
        <StyledTopBarInlineFlex>{left}</StyledTopBarInlineFlex>
      </StyledTopbarLeft>
      <StyledTopbarRight>{right}</StyledTopbarRight>
    </StyledRightSideTopbar>
  )
}

export default RightSideTopBar
