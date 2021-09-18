import React from 'react'
import { getWorkspaceShowPageData } from '../../../api/pages/teams/workspaces'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import WorkspacePage from '../../../components/WorkspacePage'

const WorkspaceShowPage = () => {
  return <WorkspacePage />
}

WorkspaceShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getWorkspaceShowPageData(params)
  return result
}

export default WorkspaceShowPage
