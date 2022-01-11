import React from 'react'
import { getWorkflows } from '../../api/automation/workflow'
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

WorkflowListPage.getInitialProps = async ({
  pathname,
}: GetInitialPropsParameters) => {
  const [, team] = pathname.split('/')
  return {
    workflows: await getWorkflows({ team }),
  }
}

export default WorkflowListPage
