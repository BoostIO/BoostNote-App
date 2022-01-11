import React from 'react'
import { getAutomation } from '../../api/automation/automation'
import { getTeamIndexPageData } from '../../api/pages/teams'
import { SerializedAutomation } from '../../interfaces/db/automations'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const AutomationPage = ({
  automation,
}: {
  automation: SerializedAutomation
}) => {
  return (
    <div>
      <div>{automation.name}</div>
    </div>
  )
}

AutomationPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const workflowId = params.pathname.split('/')[3]
  const [teamData, automation] = await Promise.all([
    getTeamIndexPageData(params),
    getAutomation(workflowId),
  ])
  return {
    ...teamData,
    automation,
  }
}

export default AutomationPage
