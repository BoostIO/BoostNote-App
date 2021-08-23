import React, { useMemo } from 'react'
import Application from '../../../components/Application'
import {
  getWorkspaceShowPageData,
  WorkspacesShowPageResponseBody,
} from '../../../api/pages/teams/workspaces'
import WorkspacePage from '../../../components/WorkspacePage'
import { useNav } from '../../../lib/stores/nav'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'

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
        <ColoredBlock
          variant='danger'
          style={{
            width: '96%',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '40px',
          }}
        >
          <h3>Oops...</h3>
          <p>The folder has been deleted.</p>
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
