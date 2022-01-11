import React from 'react'
import { getAutomations } from '../../api/automation/automation'
import { SerializedAutomation } from '../../interfaces/db/automations'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const AutomationListPage = ({
  automations,
}: {
  automations: SerializedAutomation[]
}) => {
  return (
    <div>
      <ul>
        {automations.map((automation) => {
          return <div key={automation.id}>{automation.name}</div>
        })}
      </ul>
    </div>
  )
}

AutomationListPage.getInitialProps = async ({
  pathname,
}: GetInitialPropsParameters) => {
  const [, team] = pathname.split('/')
  return {
    workflows: await getAutomations({ team }),
  }
}

export default AutomationListPage
