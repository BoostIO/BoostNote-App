import React from 'react'
import { SidebarState } from '../../../lib/v2/sidebar'
import styled from '../../../lib/v2/styled'
import GlobalStyle from '../organisms/GlobalStyle'
import Sidebar from '../organisms/Sidebar/index'
import { SidebarContextRow } from '../organisms/Sidebar/molecules/SidebarContext'
import {
  SidebarSpace,
  SidebarSpaceContentRow,
} from '../organisms/Sidebar/molecules/SidebarSpaces'
import {
  SidebarNavCategory,
  SidebarTreeControl,
} from '../organisms/Sidebar/molecules/SidebarTree'

interface ApplicationLayoutProps {
  sidebarState?: SidebarState
  spaces: SidebarSpace[]
  spaceBottomRows: SidebarSpaceContentRow[]
  contextRows: SidebarContextRow[]
  tree?: SidebarNavCategory[]
  treeControls?: SidebarTreeControl[]
  sidebarExpandedWidth?: number
  sidebarResize?: (width: number) => void
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({
  spaces,
  spaceBottomRows,
  contextRows,
  sidebarExpandedWidth,
  sidebarResize,
  sidebarState,
  tree,
  treeControls,
  children,
}) => {
  return (
    <Container className='application'>
      <div className='application__layout'>
        <Sidebar
          className='application__sidebar'
          contextRows={contextRows}
          spaces={spaces}
          spaceBottomRows={spaceBottomRows}
          sidebarResize={sidebarResize}
          sidebarExpandedWidth={sidebarExpandedWidth}
          sidebarState={sidebarState}
          tree={tree}
          treeControls={treeControls}
        />
        <div className='application__content'>{children}</div>
      </div>
      <GlobalStyle />
    </Container>
  )
}

const Container = styled.div`
  display: block;
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.main};

  .application__layout {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    overflow: initial;
    align-items: flex-start;
  }

  .application__sidebar {
    flex: 0 0 auto;
  }

  .application__content {
    width: 100%;
    flex: 1 1 auto;
  }
`

export default ApplicationLayout
