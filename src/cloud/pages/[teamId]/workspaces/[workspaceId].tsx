import React from 'react'
import { getWorkspaceShowPageData } from '../../../api/pages/teams/workspaces'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import WorkspacePage from '../../../components/WorkspacePage'
import { getTeamIndexPageData } from '../../../api/pages/teams'
import { parse as parseQuery } from 'querystring'

const WorkspaceShowPage = ({ pageWorkspace }: any) => {
  return <WorkspacePage workspace={pageWorkspace} />
}

WorkspaceShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getWorkspaceShowPageData(params)
  return result
}

WorkspaceShowPage.getInitialProps = (
  (prev: { value: string | null }) =>
  async (params: GetInitialPropsParameters) => {
    const [, teamId] = params.pathname.split('/')
    const [result, teamData] = await Promise.all([
      getWorkspaceShowPageData(params),
      prev.value != teamId
        ? getTeamIndexPageData(params)
        : Promise.resolve({
            merge: true,
          } as any),
    ])

    prev.value = teamId
    const query = parseQuery(params.search.slice(1))
    return { ...teamData, ...result, thread: query.thread }
  }
)({ value: null })

export default WorkspaceShowPage
