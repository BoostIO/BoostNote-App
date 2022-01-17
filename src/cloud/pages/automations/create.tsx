import React, { useCallback, useState } from 'react'
import ApplicationContent from '../../components/ApplicationContent'
import ApplicationPage from '../../components/ApplicationPage'
import Topbar from '../../../design/components/organisms/Topbar'
import { getTeamIndexPageData } from '../../api/pages/teams'
import { GeneralAppProps } from '../../interfaces/api'
import { SerializedWorkflow } from '../../interfaces/db/automations'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { getWorkflows } from '../../api/automation/workflow'
import { createAutomation } from '../../api/automation/automation'
import { useToast } from '../../../design/lib/stores/toast'
import { useRouter } from '../../lib/router'
import { getTeamURL } from '../../lib/utils/patterns'
import AutomationBuilder, {
  BaseAutomation,
} from '../../components/Automations/AutomationBuilder'

type AutomationCreatePageProps = GeneralAppProps & {
  workflows: SerializedWorkflow[]
}

const AutomationCreatePage = ({
  workflows,
  team,
}: AutomationCreatePageProps) => {
  const { push } = useRouter()
  const { pushApiErrorMessage, pushMessage } = useToast()
  const [working, setWorking] = useState(false)

  const saveAutomation = useCallback(
    async (automation: BaseAutomation) => {
      if (automation.workflowId == null) {
        return
      }

      try {
        setWorking(true)
        const newAutomation = await createAutomation({
          name: automation.name,
          description: automation.description,
          workflow: automation.workflowId,
          team: team.id,
          env: automation.env,
        })
        pushMessage({
          type: 'success',
          title: 'Automation Created',
          description: `${newAutomation.name} has been successfully enabled!`,
        })
        push(`${getTeamURL(team)}/automations/${newAutomation.id}`)
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setWorking(false)
      }
    },
    [team, push, pushApiErrorMessage, pushMessage]
  )

  return (
    <ApplicationPage>
      <Topbar>
        <h2>Automations</h2>
      </Topbar>
      <ApplicationContent>
        <AutomationBuilder
          initialAutomation={defaultAutomation}
          onSubmit={saveAutomation}
          workflows={workflows}
          working={working}
        />
      </ApplicationContent>
    </ApplicationPage>
  )
}

AutomationCreatePage.getInitialProps = async (
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

export default AutomationCreatePage

const defaultAutomation = {
  name: 'New Automation',
  description: '',
  workflowId: null as null | number,
  env: {},
}
