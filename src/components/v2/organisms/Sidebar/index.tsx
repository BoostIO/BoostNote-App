import React from 'react'
import cc from 'classcat'
import {
  defaultSidebarExpandedWidth,
  maxSidebarExpandedWidth,
  minSidebarExpandedWidth,
  SidebarState,
} from '../../../../lib/v2/sidebar'
import styled from '../../../../lib/v2/styled'
import WidthEnlarger from '../../atoms/WidthEnlarger'
import SidebarSpaces, { SidebarSpaceProps } from './molecules/SidebarSpaces'
import SidebarToolbar, { SidebarToolbarRow } from './molecules/SidebarToolbar'
import SidebarTree, {
  SidebarNavCategory,
  SidebarTreeControl,
} from './molecules/SidebarTree'
import Spinner from '../../atoms/Spinner'
import SidebarSearch, {
  SidebarSearchHistory,
  SidebarSearchResult,
  SidebarSearchState,
} from './molecules/SidebarSearch'
import SidebarTimeline, {
  SidebarTimelineRow,
} from './molecules/SidebarTimeline'
import { AppUser } from '../../../../lib/v2/mappers/users'
import Button, { ButtonProps } from '../../atoms/Button'

type SidebarProps = {
  showSpaces: boolean
  sidebarState?: SidebarState
  toolbarRows: SidebarToolbarRow[]
  sidebarExpandedWidth?: number
  sidebarResize?: (width: number) => void
  className?: string
  tree?: SidebarNavCategory[]
  treeControls?: SidebarTreeControl[]
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
  showSpaces,
  onSpacesBlur,
  sidebarState,
  toolbarRows,
  spaces,
  spaceBottomRows,
  sidebarExpandedWidth = defaultSidebarExpandedWidth,
  sidebarResize,
  tree,
  treeControls,
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
      <SidebarToolbar rows={toolbarRows} className='sidebar__context__icons' />
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
                <SidebarTree tree={tree} treeControls={treeControls} />
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
