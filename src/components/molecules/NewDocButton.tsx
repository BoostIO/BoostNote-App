import { mdiTextBoxPlusOutline } from '@mdi/js'
import React from 'react'
import { useLocalUI } from '../../lib/v2/hooks/local/useLocalUI'
import { NoteStorage } from '../../lib/db/types'
import SidebarButton from '../../shared/components/organisms/Sidebar/atoms/SidebarButton'

const NewDocButton = ({ workspace }: { workspace: NoteStorage }) => {
  const { openNewDocForm } = useLocalUI()
  // todo: [komediruzecki-30/05/2021] Implement Template modal and Templates
  return (
    <SidebarButton
      variant='primary'
      icon={mdiTextBoxPlusOutline}
      id='sidebar-newdoc-btn'
      label='Create new doc'
      labelClick={() =>
        openNewDocForm({
          parentFolderPathname: '/',
          workspaceId: workspace.id,
        })
      }
    />
  )
}

export default NewDocButton
