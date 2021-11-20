import React from 'react'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import WorkspacePage from '../../components/WorkspacePage'
import { getTeamIndexPageData } from '../../api/pages/teams'

const TeamIndexPage = ({ pageWorkspace }: any) => {
  return <WorkspacePage workspace={pageWorkspace} />
}

TeamIndexPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getTeamIndexPageData(params)
  return result
}

export default TeamIndexPage
