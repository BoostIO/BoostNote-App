import { mdiDotsHorizontal } from '@mdi/js'
import React from 'react'
import { TopbarControlProps } from '../../../design/components/organisms/Topbar'
import { useModal } from '../../../design/lib/stores/modal'
import { ContainerBlock } from '../../api/blocks'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedTeam } from '../../interfaces/db/team'
import { usePage } from '../../lib/stores/pageStore'
import ApplicationPage from '../ApplicationPage'
import ApplicationTopbar from '../ApplicationTopbar'
import InviteCTAButton from '../buttons/InviteCTAButton'
import NewDocContextMenu from '../DocPage/NewDocContextMenu'
import BlockContent from './BlockContent'

interface BlockEditorProps {
  doc: SerializedDocWithSupplemental & { rootBlock: ContainerBlock }
  team: SerializedTeam
}

const BlockEditor = ({ doc, team }: BlockEditorProps) => {
  const { openContextModal } = useModal()
  const { currentUserIsCoreMember, permissions = [] } = usePage()

  return (
    <ApplicationPage>
      <ApplicationTopbar
        controls={
          [
            {
              type: 'node',
              element: <InviteCTAButton origin='doc-page' key='invite-cta' />,
            },
            {
              type: 'separator',
            },
            {
              variant: 'icon',
              iconPath: mdiDotsHorizontal,
              onClick: (event) => {
                openContextModal(
                  event,
                  <NewDocContextMenu
                    currentDoc={doc}
                    team={team}
                    currentUserIsCoreMember={currentUserIsCoreMember}
                    permissions={permissions || []}
                    isCanvas={true}
                  />,
                  {
                    alignment: 'bottom-right',
                    removePadding: true,
                    hideBackground: true,
                  }
                )
              },
            },
          ] as TopbarControlProps[]
        }
      />
      <BlockContent doc={doc} />
    </ApplicationPage>
  )
}

export default BlockEditor
