import { mdiChevronLeft, mdiChevronRight, mdiTrashCanOutline } from '@mdi/js'
import React, { useMemo } from 'react'
import {
  getWorkspaceShowPageData,
  WorkspacesShowPageResponseBody,
} from '../../../../cloud/api/pages/teams/workspaces'
import { SerializedWorkspace } from '../../../../cloud/interfaces/db/workspace'
import { GetInitialPropsParameters } from '../../../../cloud/interfaces/pages'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { usePreferences } from '../../../../cloud/lib/stores/preferences'
import { useWorkspaceDelete } from '../../../../lib/v2/hooks/cloud/workspaces'
import { ControlButtonProps } from '../../../../lib/v2/types'
import Button from '../../atoms/Button'
import { MetadataContainerRow } from '../../organisms/MetadataContainer'
import WorkspaceShowPageLayout from '../../templates/cloud/WorkspaceShowPageLayout'
import ContentLayout from '../../templates/ContentLayout'

const WorkspaceShowPage = ({
  pageWorkspace,
}: WorkspacesShowPageResponseBody) => {
  const { workspacesMap } = useNav()

  const workspace = useMemo(() => {
    return workspacesMap.get(pageWorkspace.id)
  }, [workspacesMap, pageWorkspace.id])

  if (workspace == null) {
    return <ContentLayout topbar={{}}>workspace has been removed</ContentLayout>
  }

  return <Page workspace={workspace} />
}

const Page = ({ workspace }: { workspace: SerializedWorkspace }) => {
  const { preferences, setPreferences } = usePreferences()
  const toolbar = useMemo(() => {
    return mapTopbar(!preferences.docContextIsHidden, () =>
      setPreferences({
        docContextIsHidden: !preferences.docContextIsHidden,
      })
    )
  }, [preferences.docContextIsHidden, setPreferences])

  const workspaceRemoval = useWorkspaceDelete(workspace)

  const metadataRows = useMemo(() => {
    return mapMetadataRows(workspace, workspaceRemoval)
  }, [workspace, workspaceRemoval])

  return (
    <WorkspaceShowPageLayout
      topbar={toolbar}
      metadata={{ show: !preferences.docContextIsHidden, rows: metadataRows }}
    />
  )
}

function mapTopbar(hideMetadata: boolean, toggleHideMetadata: () => void) {
  const controls: ControlButtonProps[] = []
  controls.push({
    icon: hideMetadata ? mdiChevronLeft : mdiChevronRight,
    onClick: toggleHideMetadata,
  })
  return {
    controls,
  }
}

function mapMetadataRows(
  workspace: SerializedWorkspace,
  removal: { sending: boolean; call: () => void }
) {
  const rows: MetadataContainerRow[] = []

  if (workspace.public) {
    rows.push({
      type: 'content',
      label: { text: 'Access' },
      direction: 'column',
      breakAfter: true,
      content: (
        <>This workspace is public. Anyone from the team can access it.</>
      ),
    })
  } else {
    rows.push({
      type: 'content',
      label: { text: 'Access' },
      content: <>User List</>,
    })
    rows.push({
      type: 'content',
      content: (
        <div>
          This workspace is private. You can modify its access in the workspace{' '}
          <Button
            variant='link'
            onClick={() => {
              // do something
            }}
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
    label: { text: 'Delete', icon: mdiTrashCanOutline },
    onClick: removal.call,
    disabled: removal.sending,
  })

  return rows
}

WorkspaceShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getWorkspaceShowPageData(params)
  return result
}

export default WorkspaceShowPage
