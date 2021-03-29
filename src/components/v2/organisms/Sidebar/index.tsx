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
import SidebarContext, { SidebarContextRow } from './molecules/SidebarContext'
import SidebarTree, {
  SidebarNavCategory,
  SidebarTreeControl,
} from './molecules/SidebarTree'
import Spinner from '../../atoms/Spinner'

type SidebarProps = {
  sidebarState?: SidebarState
  contextRows: SidebarContextRow[]
  sidebarExpandedWidth?: number
  sidebarResize?: (width: number) => void
  className?: string
  tree?: SidebarNavCategory[]
  treeControls?: SidebarTreeControl[]
} & SidebarSpaceProps

const Sidebar = ({
  sidebarState,
  contextRows,
  spaces,
  spaceBottomRows,
  sidebarExpandedWidth = defaultSidebarExpandedWidth,
  sidebarResize,
  tree,
  treeControls,
  className,
}: SidebarProps) => {
  return (
    <SidebarContainer className={cc(['sidebar', className])}>
      <SidebarContext rows={contextRows} className='sidebar__context__icons' />
      {sidebarState != null && (
        <WidthEnlarger
          position='right'
          minWidth={minSidebarExpandedWidth}
          maxWidth={maxSidebarExpandedWidth}
          defaultWidth={sidebarExpandedWidth}
          onResizeEnd={sidebarResize}
          className={cc([
            'sidebar__expanded',
            sidebarState === 'spaces' && 'flexible',
          ])}
        >
          <div className='sidebar__expanded__wrapper'>
            {sidebarState === 'spaces' ? (
              <SidebarSpaces
                spaces={spaces}
                spaceBottomRows={spaceBottomRows}
              />
            ) : sidebarState === 'tree' ? (
              tree == null ? (
                <Spinner className='sidebar__loader' />
              ) : (
                <SidebarTree tree={tree} treeControls={treeControls} />
              )
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

  .sidebar__expanded {
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};
    height: 100%;
    max-height: 100%;
    position: relative;

    &.flexible {
      height: fit-content;
      min-height: 200px;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
      border-bottom-right-radius: ${({ theme }) => theme.borders.radius}px;
    }
  }

  .sidebar__expanded__wrapper {
    height: 100%;
    overflow: auto;
  }
`
