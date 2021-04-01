import React, { useMemo } from 'react'
import MetadataContainer, {
  MetadataContainerRow,
} from '../../organisms/MetadataContainer'
import ContentLayout from '../ContentLayout'
import { TopbarProps } from '../../organisms/Topbar'
import { SerializedWorkspace } from '../../../../cloud/interfaces/db/workspace'
import { useModal } from '../../../../lib/v2/stores/modal'
import { mdiPencil, mdiTrashCanOutline } from '@mdi/js'
import Button from '../../atoms/Button'
import UserIconList from '../../molecules/UserIconList'
import EditWorkspaceModal from '../../../../cloud/components/organisms/Modal/contents/Workspace/EditWorkspaceModal'
import { AppUser } from '../../../../lib/v2/mappers/users'

interface WorkspaceShowPageTemplateProps {
  helmet?: { title?: string; indexing?: boolean }
  topbar: TopbarProps
  metadata: { show: boolean }
  workspace: SerializedWorkspace
  workspaceRemoval: { sending: boolean; call: () => void }
  users: Map<string, AppUser & { hasAccess?: boolean; isOwner?: boolean }>
}

const WorkspaceShowPageTemplate = ({
  topbar,
  metadata,
  workspace,
  workspaceRemoval,
  users,
}: WorkspaceShowPageTemplateProps) => {
  const { openModal } = useModal()
  const metadataRows = useMemo(() => {
    const rows: MetadataContainerRow[] = []
    if (workspace.public) {
      rows.push({
        type: 'content',
        label: { text: 'Access' },
        direction: 'column',
        breakAfter: true,
        content: (
          <div>
            This workspace is public. Anyone from the team can access it. You
            can modify its access in the workspace{' '}
            <Button
              variant='link'
              onClick={() =>
                openModal(<EditWorkspaceModal workspace={workspace} />)
              }
              id='workspace-settings-edit'
            >
              Settings
            </Button>{' '}
          </div>
        ),
      })
    } else {
      rows.push({
        type: 'content',
        label: { text: 'Access' },
        content: (
          <UserIconList
            users={[...users.values()]
              .filter((user) => user.hasAccess)
              .map((user) => {
                return {
                  url: user.iconUrl,
                  alt: user.name,
                  color: user.color,
                }
              })}
          />
        ),
      })
      rows.push({
        type: 'content',
        content: (
          <div>
            This workspace is private. You can modify its access in the
            workspace{' '}
            <Button
              variant='link'
              onClick={() => {
                openModal(<EditWorkspaceModal workspace={workspace} />)
              }}
              id='workspace-settings-edit'
            >
              Settings
            </Button>{' '}
          </div>
        ),
        breakAfter: true,
      })
    }

    rows.push({
      type: 'button',
      label: { text: 'Edit', icon: mdiPencil },
      onClick: () => openModal(<EditWorkspaceModal workspace={workspace} />),
    })
    rows.push({
      type: 'button',
      label: { text: 'Delete', icon: mdiTrashCanOutline },
      onClick: workspaceRemoval.call,
      disabled: workspaceRemoval.sending,
      breakAfter: true,
    })
    rows.push({
      type: 'content',
      label: { text: 'Timeline' },
      direction: 'column',
      content: <div></div>,
    })

    return rows
  }, [workspace, workspaceRemoval, openModal, users])

  return (
    <ContentLayout
      topbar={topbar}
      right={metadata?.show && <MetadataContainer rows={metadataRows} />}
    >
      workspace page
    </ContentLayout>
  )
}

export default WorkspaceShowPageTemplate
