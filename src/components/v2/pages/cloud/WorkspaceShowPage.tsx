import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import React, { useMemo } from 'react'
import {
  getWorkspaceShowPageData,
  WorkspacesShowPageResponseBody,
} from '../../../../cloud/api/pages/teams/workspaces'
import { GetInitialPropsParameters } from '../../../../cloud/interfaces/pages'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { usePreferences } from '../../../../cloud/lib/stores/preferences'
import { ControlButtonProps } from '../../../../lib/v2/types'
import WorkspaceShowPageLayout from '../../templates/cloud/WorkspaceShowPageLayout'

const WorkspaceShowPage = ({
  pageWorkspace,
}: WorkspacesShowPageResponseBody) => {
  const { workspacesMap } = useNav()

  const workspace = useMemo(() => {
    return workspacesMap.get(pageWorkspace.id)
  }, [workspacesMap, pageWorkspace.id])

  return (
    <WorkspaceShowPageLayout
      topbar={BuildTopbar()}
      metadata={BuildMetadata()}
    />
  )
}

function BuildTopbar() {
  const { preferences, setPreferences } = usePreferences()
  const topbarControls = useMemo(() => {
    const controls: ControlButtonProps[] = []
    controls.push({
      icon: preferences.docContextIsHidden ? mdiChevronLeft : mdiChevronRight,
      onClick: () =>
        setPreferences({
          docContextIsHidden: !preferences.docContextIsHidden,
        }),
    })
    return controls
  }, [preferences.docContextIsHidden, setPreferences])

  return {
    controls: topbarControls,
  }
}

function BuildMetadata() {
  const { preferences } = usePreferences()
  return {
    show: !preferences.docContextIsHidden,
    rows: [],
  }
}

WorkspaceShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getWorkspaceShowPageData(params)
  return result
}

export default WorkspaceShowPage
