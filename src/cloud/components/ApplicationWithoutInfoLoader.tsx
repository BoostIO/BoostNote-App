import React from 'react'
import Loader from '../../design/components/atoms/loaders'
import WidthEnlarger from '../../design/components/atoms/WidthEnlarger'
import ApplicationLayout from '../../design/components/molecules/ApplicationLayout'
import { SidebarContainer } from '../../design/components/organisms/Sidebar'
import {
  maxSidebarExpandedWidth,
  minSidebarExpandedWidth,
} from '../../design/lib/sidebar'
import cc from 'classcat'
import { usePreferences } from '../lib/stores/preferences'

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
                <Loader variant='team-picker' />
                <Loader variant='nav-item' count={4} />
              </div>
              <div className='sidebar--expanded__wrapper__content'>
                <Loader variant='nav-item' withDepth={true} count={5} />
                <Loader variant='nav-item' withDepth={true} count={3} />
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
