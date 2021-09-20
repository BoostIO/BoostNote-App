import React from 'react'
import { getTeamIndexPageData } from '../../api/pages/teams'
import WorkspacePage from '../../components/WorkspacePage'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const TeamIndex = ({ pageWorkspace }: any) => {
  return <WorkspacePage workspace={pageWorkspace} />
}

TeamIndex.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getTeamIndexPageData(params)
  return result
}

export default TeamIndex
