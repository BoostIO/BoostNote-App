import React from 'react'
import Page from '../../components/Page'
import { LazyDefaultLayout } from '../../components/layouts/DefaultLayout'
import {
  getTeamIndexPageData,
  TeamShowPageResponseBody,
} from '../../api/pages/teams'
import WorkspacePage from '../../components/organisms/WorkspacePage'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const TeamIndex = ({ pageWorkspace }: TeamShowPageResponseBody) => {
  return (
    <Page>
      <LazyDefaultLayout>
        <WorkspacePage workspace={pageWorkspace} />
      </LazyDefaultLayout>
    </Page>
  )
}

TeamIndex.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getTeamIndexPageData(params)
  return result
}

export default TeamIndex
