import React, { useRef, useMemo } from 'react'
import { NavResource } from '../../../../interfaces/resources'
import { useNav } from '../../../../lib/stores/nav'
import { sortByAttributeAsc } from '../../../../lib/utils/array'
import { usePage } from '../../../../lib/stores/pageStore'
import SidebarWorkspaceItem from './SideNavigatorWorkspaceItem'
import { mdiPlus } from '@mdi/js'
import { useModal } from '../../../../lib/stores/modal'
import CreateWorkspaceModal from '../../Modal/contents/Workspace/CreateWorkspaceModal'
import SideNavigatorIconButton from '../SideNavigator/SideNavigatorIconButton'
import SidebarTopHeader from '../SidebarTopHeader'

const SidebarWorkspaces = () => {
  const { team } = usePage()
  const draggedResource = useRef<NavResource>()
  const { workspacesMap } = useNav()
  const { openModal } = useModal()

  const workspaces = useMemo(() => {
    const workspaces = [...workspacesMap.values()]
    return [
      ...sortByAttributeAsc(
        'name',
        workspaces.filter((workspace) => workspace.public)
      ),
      ...sortByAttributeAsc(
        'name',
        workspaces.filter((workspace) => !workspace.public)
      ),
    ]
  }, [workspacesMap])

  if (team == null || workspaces.length === 0) {
    return null
  }

  return (
    <>
      <SidebarTopHeader
        label='Workspaces'
        controls={
          <SideNavigatorIconButton
            onClick={() => openModal(<CreateWorkspaceModal />)}
            path={mdiPlus}
          />
        }
      />
      {workspaces.map((workspace) => (
        <SidebarWorkspaceItem
          key={workspace.id}
          workspace={workspace}
          team={team}
          draggedResource={draggedResource}
        />
      ))}
    </>
  )
}

export default SidebarWorkspaces
