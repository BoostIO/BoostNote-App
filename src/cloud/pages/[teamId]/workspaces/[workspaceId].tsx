import React, { useMemo } from 'react'
import Application from '../../../components/Application'
import {
  getWorkspaceShowPageData,
  WorkspacesShowPageResponseBody,
} from '../../../api/pages/teams/workspaces'
import WorkspacePage from '../../../components/organisms/WorkspacePage'
import { useNav } from '../../../lib/stores/nav'
import ColoredBlock from '../../../components/atoms/ColoredBlock'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

const WorkspaceShowPage = ({
  pageWorkspace,
}: WorkspacesShowPageResponseBody) => {
  const { workspacesMap } = useNav()

  const workspace = useMemo(() => {
    return workspacesMap.get(pageWorkspace.id)
  }, [workspacesMap, pageWorkspace.id])

  if (workspace == null) {
    return (
      <Application content={{}}>
        <ColoredBlock variant='danger' style={{ marginTop: '40px' }}>
          <h3>Oops...</h3>
          <p>The workspace has been deleted.</p>
        </ColoredBlock>
      </Application>
    )
  }

  return <WorkspacePage workspace={workspace} />
}

WorkspaceShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getWorkspaceShowPageData(params)
  return result
}

export default WorkspaceShowPage
