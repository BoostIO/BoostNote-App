import React, { useCallback, useMemo, useState } from 'react'
import {
  getAutomation,
  updateAutomation,
} from '../../api/automation/automation'
import { getWorkflows } from '../../api/automation/workflow'
import { getTeamIndexPageData } from '../../api/pages/teams'
import { GeneralAppProps } from '../../interfaces/api'
import ApplicationContent from '../../components/ApplicationContent'
import ApplicationPage from '../../components/ApplicationPage'
import Topbar from '../../../design/components/organisms/Topbar'
import { useToast } from '../../../design/lib/stores/toast'
import {
  SerializedAutomation,
  SerializedWorkflow,
} from '../../interfaces/db/automations'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import AutomationBuilder, {
  BaseAutomation,
} from '../../components/Automations/AutomationBuilder'

type AutomationPageProps = GeneralAppProps & {
  workflows: SerializedWorkflow[]
  automation: SerializedAutomation
}

const AutomationPage = ({ automation, workflows }: AutomationPageProps) => {
  const { pushApiErrorMessage, pushMessage } = useToast()
  const [working, setWorking] = useState(false)

  const saveAutomation = useCallback(
    async (automation: SerializedAutomation) => {
      try {
        setWorking(true)
        const newAutomation = await updateAutomation(automation.id, {
          name: automation.name,
          description: automation.description,
          env: automation.env,
        })
        pushMessage({
          type: 'success',
          title: 'Automation Created',
          description: `${newAutomation.name} has been successfully enabled!`,
        })
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setWorking(false)
      }
    },
    [pushApiErrorMessage, pushMessage]
  )

  const disabledInputs = useMemo(() => {
    return new Set<keyof BaseAutomation>(['workflowId', 'env'])
  }, [])

  return (
    <ApplicationPage>
      <Topbar>
        <h2>Automations</h2>
      </Topbar>
      <ApplicationContent>
        <AutomationBuilder
          initialAutomation={automation}
          onSubmit={saveAutomation}
          workflows={workflows}
          working={working}
          disabled={disabledInputs}
        />
      </ApplicationContent>
    </ApplicationPage>
  )
}

AutomationPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const [, team, , automationId] = params.pathname.split('/')
  const [teamData, automation, workflows] = await Promise.all([
    getTeamIndexPageData(params),
    getAutomation(automationId),
    getWorkflows({ team }),
  ])
  return {
    ...teamData,
    automation,
    workflows,
  }
}

export default AutomationPage
