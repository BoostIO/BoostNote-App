import React, { useEffect } from 'react'
import { usePreferences } from '../../../lib/stores/preferences'
import { StyledNavHideButton } from './styled'
import IconMdi from '../../atoms/IconMdi'
import { mdiChevronDoubleLeft } from '@mdi/js'
import TopBarSideNavHideButton from '../../atoms/TopBarSideNavHideButton'
import { toggleSideNavigatorEventEmitter } from '../../../lib/utils/events'

const TopBarSideNavToggle = () => {
  const { preferences, toggleHideSidebar } = usePreferences()

  useEffect(() => {
    toggleSideNavigatorEventEmitter.listen(toggleHideSidebar)
    return () => {
      toggleSideNavigatorEventEmitter.unlisten(toggleHideSidebar)
    }
  }, [toggleHideSidebar])

  if (!preferences.sidebarIsHidden) {
    return (
      <StyledNavHideButton onClick={toggleHideSidebar}>
        <IconMdi path={mdiChevronDoubleLeft} size={24} />
      </StyledNavHideButton>
    )
  }
  return <TopBarSideNavHideButton />
}

export default TopBarSideNavToggle
