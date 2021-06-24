import React from 'react'
import cc from 'classcat'
import {
  defaultSidebarExpandedWidth,
  maxSidebarExpandedWidth,
  minSidebarExpandedWidth,
  SidebarState,
} from '../../../lib/sidebar'
import styled from '../../../lib/styled'
import WidthEnlarger from '../../atoms/WidthEnlarger'
import SidebarSpaces, { SidebarSpaceProps } from './molecules/SidebarSpaces'
import SidebarToolbar, { SidebarToolbarRow } from './molecules/SidebarToolbar'
import SidebarTree, { SidebarNavCategory } from './molecules/SidebarTree'
import Spinner from '../../atoms/Spinner'
import SidebarSearch, {
  SidebarSearchHistory,
  SidebarSearchResult,
  SidebarSearchState,
} from './molecules/SidebarSearch'
import SidebarTimeline, {
  SidebarTimelineRow,
} from './molecules/SidebarTimeline'
import { AppUser } from '../../../lib/mappers/users'
import Button, { ButtonProps } from '../../atoms/Button'
import { ControlButtonProps } from '../../../lib/types'
import SidebarPopOver from './atoms/SidebarPopOver'
import NotificationList, {
  NotificationState,
} from '../../molecules/NotificationList'
import { Notification } from '../../../../cloud/interfaces/db/notifications'

export type PopOverState = null | 'spaces' | 'notifications'

type SidebarProps = {
  showToolbar: boolean
  popOver: PopOverState
  sidebarState?: SidebarState
  toolbarRows: SidebarToolbarRow[]
  sidebarExpandedWidth?: number
  sidebarResize?: (width: number) => void
  className?: string
  tree?: SidebarNavCategory[]
  treeControls?: ControlButtonProps[]
  treeTopRows?: React.ReactNode
  searchQuery: string
  setSearchQuery: (val: string) => void
  searchHistory: string[]
  recentPages: SidebarSearchHistory[]
  searchResults: SidebarSearchResult[]
  sidebarSearchState: SidebarSearchState
  users: Map<string, AppUser>
  timelineRows: SidebarTimelineRow[]
  timelineMore?: ButtonProps
  notificationState?: NotificationState
  getMoreNotifications?: () => void
  notificationClick?: (notification: Notification) => void
} & SidebarSpaceProps

const Sidebar = ({
  showToolbar,
  popOver,
  onSpacesBlur: onPopOverBlur,
  sidebarState,
  toolbarRows,
  spaces,
  spaceBottomRows,
  sidebarExpandedWidth = defaultSidebarExpandedWidth,
  sidebarResize,
  tree,
  treeControls,
  treeTopRows,
  className,
  searchHistory,
  searchQuery,
  setSearchQuery,
  recentPages,
  searchResults,
  sidebarSearchState,
  timelineRows,
  timelineMore,
  users,
  notificationState,
  getMoreNotifications,
  notificationClick,
}: SidebarProps) => {
  return (
    <SidebarContainer className={cc(['sidebar', className])}>
      {showToolbar && (
        <SidebarToolbar
          rows={toolbarRows}
          className='sidebar__context__icons'
        />
      )}
      {popOver === 'spaces' && (
        <SidebarPopOver className='sidebar__popover__indent'>
          <SidebarSpaces
            spaces={spaces}
            spaceBottomRows={spaceBottomRows}
            onSpacesBlur={onPopOverBlur}
          />
        </SidebarPopOver>
      )}
      {popOver === 'notifications' && notificationState != null && (
        <SidebarPopOver
          onClose={onPopOverBlur}
          className={cc([showToolbar && 'sidebar__popover__indent'])}
        >
          <NotificationList
            state={notificationState}
            getMore={getMoreNotifications!}
            onClick={notificationClick}
          />
        </SidebarPopOver>
      )}
      {sidebarState != null && (
        <WidthEnlarger
          position='right'
          minWidth={minSidebarExpandedWidth}
          maxWidth={maxSidebarExpandedWidth}
          defaultWidth={sidebarExpandedWidth}
          onResizeEnd={sidebarResize}
          className={cc(['sidebar--expanded'])}
        >
          <div className='sidebar--expanded__wrapper'>
            {sidebarState === 'tree' ? (
              tree == null ? (
                <Spinner className='sidebar__loader' />
              ) : (
                <SidebarTree
                  tree={tree}
                  topRows={treeTopRows}
                  treeControls={treeControls}
                />
              )
            ) : sidebarState === 'search' ? (
              <SidebarSearch
                recentlySearched={searchHistory}
                recentlyVisited={recentPages}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                searchState={sidebarSearchState}
              />
            ) : sidebarState === 'timeline' ? (
              <SidebarTimeline users={users} rows={timelineRows}>
                {timelineMore != null && (
                  <Button id='sidebar__timeline__more' {...timelineMore}>
                    See More
                  </Button>
                )}
              </SidebarTimeline>
            ) : null}
          </div>
        </WidthEnlarger>
      )}
    </SidebarContainer>
  )
}

export default React.memo(Sidebar)

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: top;
  flex: 0 0 auto;
  height: 100vh;

  .sidebar__loader {
    margin: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .application__sidebar--electron .sidebar__context__icons {
    display: none;
  }

  .sidebar--expanded {
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};
    height: 100%;
    max-height: 100%;
    position: relative;
  }

  .sidebar--expanded__wrapper {
    height: 100%;
    overflow: auto;
  }

  .sidebar__popover__indent {
    left: 35px;
  }
`
