import { mdiDotsHorizontal } from '@mdi/js'
import React from 'react'
import { TopbarControlProps } from '../../../design/components/organisms/Topbar'
import { useModal } from '../../../design/lib/stores/modal'
import { ContainerBlock } from '../../api/blocks'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import { SerializedTeam } from '../../interfaces/db/team'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { usePage } from '../../lib/stores/pageStore'
import ApplicationPage from '../ApplicationPage'
import ApplicationTopbar from '../ApplicationTopbar'
import InviteCTAButton from '../buttons/InviteCTAButton'
import DocShare from '../DocPage/DocShare'
import NewDocContextMenu from '../DocPage/NewDocContextMenu'
import BlockContent from './BlockContent'

interface BlockEditorProps {
  doc: SerializedDocWithBookmark & { rootBlock: ContainerBlock }
  team: SerializedTeam
}

const BlockEditor = ({ doc, team }: BlockEditorProps) => {
  const { translate } = useI18n()
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
              type: 'button',
              variant: 'secondary',
              label: translate(lngKeys.Share),
              onClick: (event) =>
                openContextModal(
                  event,
                  <DocShare currentDoc={doc} team={team} />,
                  { width: 440, alignment: 'bottom-right' }
                ),
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
