import React from 'react'
import { getWorkflows } from '../../api/automation/workflow'
import { getTeamIndexPageData } from '../../api/pages/teams'
import { SerializedWorkflow } from '../../interfaces/db/automations'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const WorkflowListPage = ({
  workflows,
}: {
  workflows: SerializedWorkflow[]
}) => {
  return (
    <div>
      <ul>
        {workflows.map((workflow) => {
          return <div key={workflow.id}>{workflow.name}</div>
        })}
      </ul>
    </div>
  )
}

WorkflowListPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const [, team] = params.pathname.split('/')
  const [teamData, workflows] = await Promise.all([
    getTeamIndexPageData(params),
    getWorkflows({ team }),
  ])
  return {
    ...teamData,
    workflows,
  }
}

export default WorkflowListPage
