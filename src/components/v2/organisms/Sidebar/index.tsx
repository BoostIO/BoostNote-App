import React from 'react'
import cc from 'classcat'
import {
  defaultSidebarExpandedWidth,
  maxSidebarExpandedWidth,
  minSidebarExpandedWidth,
  SidebarState,
} from '../../../../shared/lib/sidebar'
import styled from '../../../../shared/lib/styled'
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
import { AppUser } from '../../../../shared/lib/mappers/users'
import Button, { ButtonProps } from '../../atoms/Button'

type SidebarProps = {
  showToolbar: boolean
  showSpaces: boolean
  sidebarState?: SidebarState
  toolbarRows: SidebarToolbarRow[]
  sidebarExpandedWidth?: number
  sidebarResize?: (width: number) => void
  className?: string
  tree?: SidebarNavCategory[]
  searchQuery: string
  setSearchQuery: (val: string) => void
  searchHistory: string[]
  recentPages: SidebarSearchHistory[]
  searchResults: SidebarSearchResult[]
  sidebarSearchState: SidebarSearchState
  users: Map<string, AppUser>
  timelineRows: SidebarTimelineRow[]
  timelineMore?: ButtonProps
} & SidebarSpaceProps

const Sidebar = ({
  showToolbar,
  showSpaces,
  onSpacesBlur,
  sidebarState,
  toolbarRows,
  spaces,
  spaceBottomRows,
  sidebarExpandedWidth = defaultSidebarExpandedWidth,
  sidebarResize,
  tree,
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
}: SidebarProps) => {
  return (
    <SidebarContainer className={cc(['sidebar', className])}>
      {showToolbar && (
        <SidebarToolbar
          rows={toolbarRows}
          className='sidebar__context__icons'
        />
      )}
      {showSpaces && (
        <SidebarSpaces
          spaces={spaces}
          spaceBottomRows={spaceBottomRows}
          onSpacesBlur={onSpacesBlur}
        />
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
                <SidebarTree tree={tree} />
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

export default Sidebar

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
`
