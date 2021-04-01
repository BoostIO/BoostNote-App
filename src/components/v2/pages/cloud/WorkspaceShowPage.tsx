import React, { useMemo } from 'react'
import {
  getWorkspaceShowPageData,
  WorkspacesShowPageResponseBody,
} from '../../../../cloud/api/pages/teams/workspaces'
import { SerializedUser } from '../../../../cloud/interfaces/db/user'
import { SerializedWorkspace } from '../../../../cloud/interfaces/db/workspace'
import { GetInitialPropsParameters } from '../../../../cloud/interfaces/pages'
import { useGlobalData } from '../../../../cloud/lib/stores/globalData'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { usePreferences } from '../../../../cloud/lib/stores/preferences'
import { useWorkspaceDelete } from '../../../../lib/v2/hooks/cloud/workspaces'
import { mapTopbar } from '../../../../lib/v2/mappers/topbar'
import { mapUsersWithAccess } from '../../../../lib/v2/mappers/users'
import WorkspaceShowPageTemplate from '../../templates/cloud/WorkspaceShowPageTemplate'
import ErrorLayout from '../../templates/ErrorLayout'
import { prop } from 'ramda'

const WorkspaceShowPage = ({
  pageWorkspace,
}: WorkspacesShowPageResponseBody) => {
  const { workspacesMap } = useNav()
  const {
    globalData: { currentUser },
  } = useGlobalData()

  const workspace = useMemo(() => {
    return workspacesMap.get(pageWorkspace.id)
  }, [workspacesMap, pageWorkspace.id])

  if (currentUser == null) {
    return <ErrorLayout message={'You need to be connected'} />
  }

  if (workspace == null) {
    return <ErrorLayout message={'Workspace has been removed'} />
  }

  return <Page workspace={workspace} currentUser={currentUser} />
}

const Page = ({
  workspace,
  currentUser,
}: {
  workspace: SerializedWorkspace
  currentUser: SerializedUser
}) => {
  const { preferences, setPreferences } = usePreferences()
  const { permissions = [] } = usePage()

  const toolbar = useMemo(() => {
    return mapTopbar(!preferences.docContextIsHidden, () =>
      setPreferences({
        docContextIsHidden: !preferences.docContextIsHidden,
      })
    )
  }, [preferences.docContextIsHidden, setPreferences])

  const users = useMemo(() => {
    return mapUsersWithAccess(
      permissions,
      {
        permissions: new Set((workspace.permissions || []).map(prop('id'))),
        owner: workspace.ownerId,
      },
      currentUser
    )
  }, [permissions, currentUser, workspace.ownerId, workspace.permissions])

  const workspaceRemoval = useWorkspaceDelete(workspace)

  return (
    <WorkspaceShowPageTemplate
      topbar={toolbar}
      metadata={{ show: !preferences.docContextIsHidden }}
      workspaceRemoval={workspaceRemoval}
      workspace={workspace}
      users={users}
    />
  )
}

WorkspaceShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getWorkspaceShowPageData(params)
  return result
}

export default WorkspaceShowPage
