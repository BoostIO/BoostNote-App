import React from 'react'
import { StyledTopbarVerticalSplit } from './styled'
import { SerializedTeam } from '../../../interfaces/db/team'
import BreadCrumbs from './BreadCrumbs'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import FolderControls from '../Topbar/Controls/FolderControls'
import RightSideTopBar from '.'

interface FolderTopBarProps {
  folder: SerializedFolderWithBookmark
  team: SerializedTeam
}

const FolderTopBar = ({ team, folder }: FolderTopBarProps) => (
  <RightSideTopBar
    left={
      <>
        <BreadCrumbs team={team} />
        <StyledTopbarVerticalSplit />
      </>
    }
    right={
      <>
        <StyledTopbarVerticalSplit className='transparent' />
        <FolderControls currentFolder={folder} />
      </>
    }
  />
)

export default FolderTopBar
