import React from 'react'
import { getWorkspaceShowPageData } from '../../../api/pages/teams/workspaces'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import WorkspacePage from '../../../components/WorkspacePage'

const WorkspaceShowPage = ({ pageWorkspace }: any) => {
  return <WorkspacePage workspace={pageWorkspace} />
}

WorkspaceShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getWorkspaceShowPageData(params)
  return result
}

export default WorkspaceShowPage
