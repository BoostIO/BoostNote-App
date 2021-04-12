import React, { useMemo } from 'react'
import Page from '../../../components/Page'
import Application from '../../../components/Application'
import DefaultLayout from '../../../components/layouts/DefaultLayout'
import {
  getWorkspaceShowPageData,
  WorkspacesShowPageResponseBody,
} from '../../../api/pages/teams/workspaces'
import WorkspacePage from '../../../components/organisms/WorkspacePage'
import { useNav } from '../../../lib/stores/nav'
import ColoredBlock from '../../../components/atoms/ColoredBlock'
import BreadCrumbs from '../../../components/organisms/RightSideTopBar/BreadCrumbs'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

const WorkspaceShowPage = ({
  pageWorkspace,
  team,
}: WorkspacesShowPageResponseBody) => {
  const { workspacesMap } = useNav()

  const workspace = useMemo(() => {
    return workspacesMap.get(pageWorkspace.id)
  }, [workspacesMap, pageWorkspace.id])

  const rightContent = useMemo(() => {
    if (workspace == null) {
      return (
        <Application
          content={{
            topbar: { type: 'v1', left: <BreadCrumbs team={team} /> },
          }}
        >
          <ColoredBlock variant='danger' style={{ marginTop: '40px' }}>
            <h3>Oops...</h3>
            <p>The workspace has been deleted.</p>
          </ColoredBlock>
        </Application>
      )
    }

    return <WorkspacePage workspace={workspace} />
  }, [workspace, team])

  return (
    <Page>
      <DefaultLayout>{rightContent}</DefaultLayout>
    </Page>
  )
}

WorkspaceShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getWorkspaceShowPageData(params)
  return result
}

export default WorkspaceShowPage
