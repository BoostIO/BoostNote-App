import React from 'react'
import { getWorkflow } from '../../api/automation/workflow'
import { getTeamIndexPageData } from '../../api/pages/teams'
import { SerializedWorkflow } from '../../interfaces/db/automations'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const WorkflowPage = ({ workflow }: { workflow: SerializedWorkflow }) => {
  return (
    <div>
      <div>{workflow.name}</div>
    </div>
  )
}

WorkflowPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const workflowId = params.pathname.split('/')[3]
  const [teamData, workflow] = await Promise.all([
    getTeamIndexPageData(params),
    getWorkflow(workflowId),
  ])
  return {
    ...teamData,
    workflow,
  }
}

export default WorkflowPage
