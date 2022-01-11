import React from 'react'
import { getAutomations } from '../../api/automation/automation'
import { getTeamIndexPageData } from '../../api/pages/teams'
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

AutomationListPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const [, team] = params.pathname.split('/')
  const [teamData, automations] = await Promise.all([
    getTeamIndexPageData(params),
    getAutomations({ team }),
  ])
  return {
    ...teamData,
    automations,
  }
}

export default AutomationListPage
