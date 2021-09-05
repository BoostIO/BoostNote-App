import React from 'react'
import cc from 'classcat'
import {
  defaultSidebarExpandedWidth,
  maxSidebarExpandedWidth,
  minSidebarExpandedWidth,
} from '../../../lib/sidebar'
import styled from '../../../lib/styled'
import WidthEnlarger from '../../atoms/WidthEnlarger'
import Spinner from '../../atoms/Spinner'
import { AppUser } from '../../../lib/mappers/users'
import NotificationList, {
  NotificationState,
} from '../../molecules/NotificationList'
import { Notification } from '../../../../cloud/interfaces/db/notifications'
import SidebarTree, { SidebarNavCategory } from './molecules/SidebarTree'
import SidebarPopOver from './atoms/SidebarPopOver'
import SidebarSpaces, { SidebarSpaceProps } from './molecules/SidebarSpaces'
import SidebarContextList from './atoms/SidebarContextList'
import Scroller from '../../atoms/Scroller'

export type PopOverState = null | 'spaces' | 'notifications'

type SidebarProps = {
  popOver: PopOverState
  sidebarExpandedWidth?: number
  sidebarResize?: (width: number) => void
  className?: string
  header?: React.ReactNode
  tree?: SidebarNavCategory[]
  treeBottomRows?: React.ReactNode
  users: Map<string, AppUser>
  notificationState?: NotificationState
  getMoreNotifications?: () => void
  notificationClick?: (notification: Notification) => void
} & SidebarSpaceProps

const Sidebar = ({
  popOver,
  onSpacesBlur: onPopOverBlur,
  spaces,
  spaceBottomRows,
  sidebarExpandedWidth = defaultSidebarExpandedWidth,
  sidebarResize,
  tree,
  header,
  treeBottomRows,
  className,
  notificationState,
  getMoreNotifications,
  notificationClick,
}: SidebarProps) => {
  return (
    <SidebarContainer className={cc(['sidebar', className])}>
      {popOver === 'spaces' ? (
        <SidebarPopOver>
          <SidebarSpaces
            spaces={spaces}
            spaceBottomRows={spaceBottomRows}
            onSpacesBlur={onPopOverBlur}
          />
        </SidebarPopOver>
      ) : popOver === 'notifications' && notificationState != null ? (
        <SidebarPopOver onClose={onPopOverBlur}>
          <NotificationList
            state={notificationState}
            getMore={getMoreNotifications!}
            onClick={notificationClick}
          />
        </SidebarPopOver>
      ) : null}
      <WidthEnlarger
        position='right'
        minWidth={minSidebarExpandedWidth}
        maxWidth={maxSidebarExpandedWidth}
        defaultWidth={sidebarExpandedWidth}
        onResizeEnd={sidebarResize}
        className={cc(['sidebar--expanded'])}
      >
        <SidebarContextList className='sidebar--expanded__wrapper'>
          <div className='sidebar--expanded__wrapper__header'>{header}</div>
          <Scroller className='sidebar--expanded__wrapper__content'>
            {tree == null ? (
              <Spinner className='sidebar__loader' />
            ) : (
              <SidebarTree tree={tree} />
            )}
            {treeBottomRows}
          </Scroller>
        </SidebarContextList>
      </WidthEnlarger>
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

  .sidebar--expanded,
  .width__enlarger__content,
  .sidebar--expanded__wrapper {
    height: 100% !important;
  }

  .sidebar__loader {
    margin: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .sidebar--expanded__wrapper__header {
    flex: 0 0 auto;
  }

  .sidebar--expanded__wrapper__content {
    flex: 1 1 auto;
    position: relative;
    padding-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .sidebar--expanded {
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};
    height: 100%;
    max-height: 100%;
    position: relative;
  }

  .sidebar--expanded__wrapper {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`
