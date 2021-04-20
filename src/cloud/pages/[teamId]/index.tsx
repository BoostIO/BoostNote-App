import React from 'react'
import {
  getTeamIndexPageData,
  TeamShowPageResponseBody,
} from '../../api/pages/teams'
import WorkspacePage from '../../components/organisms/WorkspacePage'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const TeamIndex = ({ pageWorkspace }: TeamShowPageResponseBody) => {
  return <WorkspacePage workspace={pageWorkspace} />
}

TeamIndex.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getTeamIndexPageData(params)
  return result
}

export default TeamIndex
