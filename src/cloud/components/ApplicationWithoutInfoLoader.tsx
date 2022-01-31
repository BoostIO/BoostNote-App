import React from 'react'
import WidthEnlarger from '../../design/components/atoms/WidthEnlarger'
import ApplicationLayout from '../../design/components/molecules/ApplicationLayout'
import { SidebarContainer } from '../../design/components/organisms/Sidebar'
import {
  maxSidebarExpandedWidth,
  minSidebarExpandedWidth,
} from '../../design/lib/sidebar'
import cc from 'classcat'
import { usePreferences } from '../lib/stores/preferences'
import LoaderTeamPicker from '../../design/components/atoms/loaders/LoaderTeamPicker'
import LoaderNavItem from '../../design/components/atoms/loaders/LoaderNavItem'

const ApplicationWithoutPageInfo = () => {
  const { preferences } = usePreferences()
  return (
    <ApplicationLayout
      sidebar={
        <SidebarContainer>
          <WidthEnlarger
            position='right'
            minWidth={minSidebarExpandedWidth}
            maxWidth={maxSidebarExpandedWidth}
            defaultWidth={preferences.sideBarWidth}
            className={cc([
              'sidebar--expanded',
              preferences.sidebarIsHidden && 'sidebar--hidden',
            ])}
          >
            <div className='sidebar--expanded__wrapper'>
              <div className='sidebar--expanded__wrapper__header'>
                <LoaderTeamPicker />
                <LoaderNavItem count={4} />
              </div>
              <div className='sidebar--expanded__wrapper__content'>
                <LoaderNavItem count={5} />
                <LoaderNavItem count={3} />
              </div>
            </div>
          </WidthEnlarger>
        </SidebarContainer>
      }
      pageBody={<></>}
    />
  )
}

export default ApplicationWithoutPageInfo
