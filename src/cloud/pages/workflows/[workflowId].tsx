import React from 'react'
import { getWorkflow } from '../../api/automation/workflow'
import { SerializedWorkflow } from '../../interfaces/db/automations'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const WorkflowPage = ({ workflow }: { workflow: SerializedWorkflow }) => {
  return (
    <div>
      <div>{workflow.name}</div>
    </div>
  )
}

WorkflowPage.getInitialProps = async ({
  pathname,
}: GetInitialPropsParameters) => {
  const workflowId = pathname.split('/')[3]
  return {
    workflow: await getWorkflow(workflowId),
  }
}

export default WorkflowPage
