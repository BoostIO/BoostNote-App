import React from 'react'
import { getAutomation } from '../../api/automation/automation'
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

AutomationPage.getInitialProps = async ({
  pathname,
}: GetInitialPropsParameters) => {
  const workflowId = pathname.split('/')[3]
  return {
    workflow: await getAutomation(workflowId),
  }
}

export default AutomationPage
