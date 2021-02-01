import React from 'react'
import styled from '../../lib/styled'
import IconMdi from './IconMdi'
import { mdiMenu, mdiChevronDoubleRight } from '@mdi/js'
import { usePreferences } from '../../lib/stores/preferences'
import { defaultTopbarIndex } from '../organisms/RightSideTopBar/styled'
import { topbarIconButtonStyle } from '../../lib/styled/styleFunctions'

const TopBarSideNavHideButton = () => {
  const {
    preferences,
    toggleHideSidebar,
    hoverSidebarOff,
    hoverSidebarOn,
  } = usePreferences()

  return (
    <StyledButton
      onClick={toggleHideSidebar}
      onMouseEnter={() => hoverSidebarOn()}
      onMouseLeave={() => hoverSidebarOff()}
    >
      <IconMdi
        path={preferences.sidebarIsHovered ? mdiChevronDoubleRight : mdiMenu}
        size={24}
      />
    </StyledButton>
  )
}

const StyledButton = styled.button`
  ${topbarIconButtonStyle}
  z-index: ${defaultTopbarIndex + 1};
`

export default TopBarSideNavHideButton
