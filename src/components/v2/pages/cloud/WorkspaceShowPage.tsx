import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import React, { useMemo } from 'react'
import {
  getWorkspaceShowPageData,
  WorkspacesShowPageResponseBody,
} from '../../../../cloud/api/pages/teams/workspaces'
import { SerializedWorkspace } from '../../../../cloud/interfaces/db/workspace'
import { GetInitialPropsParameters } from '../../../../cloud/interfaces/pages'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { usePreferences } from '../../../../cloud/lib/stores/preferences'
import { ControlButtonProps } from '../../../../lib/v2/types'
import WorkspaceShowPageLayout from '../../templates/cloud/WorkspaceShowPageLayout'

const WorkspaceShowPage = ({
  pageWorkspace,
}: WorkspacesShowPageResponseBody) => {
  const { workspacesMap } = useNav()
  const { preferences, setPreferences } = usePreferences()

  const workspace = useMemo(() => {
    return workspacesMap.get(pageWorkspace.id)
  }, [workspacesMap, pageWorkspace.id])

  const toolbar = useMemo(() => {
    return mapTopbar(!preferences.docContextIsHidden, () =>
      setPreferences({
        docContextIsHidden: !preferences.docContextIsHidden,
      })
    )
  }, [preferences.docContextIsHidden, setPreferences])

  const metadataRows = useMemo(() => {
    return mapMetadataRows(workspace)
  }, [workspace])

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

function mapMetadataRows(workspace?: SerializedWorkspace) {
  if (workspace == null) {
    return []
  }

  return []
}

WorkspaceShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getWorkspaceShowPageData(params)
  return result
}

export default WorkspaceShowPage
