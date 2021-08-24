import React, { useMemo } from 'react'
import {
  getWorkspaceShowPageData,
  WorkspacesShowPageResponseBody,
} from '../../../api/pages/teams/workspaces'
import { useNav } from '../../../lib/stores/nav'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'
import ApplicationPage from '../../../components/ApplicationPage'
import WorkspacePage from '../../../components/WorkspacePage'
import ApplicationContent from '../../../components/ApplicationContent'

const WorkspaceShowPage = ({
  pageWorkspace,
}: WorkspacesShowPageResponseBody) => {
  const { workspacesMap } = useNav()

  const workspace = useMemo(() => {
    return workspacesMap.get(pageWorkspace.id)
  }, [workspacesMap, pageWorkspace.id])

  if (workspace == null) {
    return (
      <ApplicationPage topbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>
            {'The folder has been deleted'}
          </ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
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
