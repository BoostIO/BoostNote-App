import React, { useCallback, useMemo, useState } from 'react'
import {
  getAutomation,
  getAutomationLogs,
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
  SerializedAutomationLog,
  SerializedWorkflow,
} from '../../interfaces/db/automations'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import AutomationBuilder, {
  BaseAutomation,
} from '../../components/Automations/AutomationBuilder'
import AutomationLogList from '../../components/Automations/AutomationLogList'
import Button from '../../../design/components/atoms/Button'
import { mdiChevronDoubleDown } from '@mdi/js'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'

type AutomationPageProps = GeneralAppProps & {
  workflows: SerializedWorkflow[]
  automation: SerializedAutomation
  logs: SerializedAutomationLog[]
}

const AutomationPage = ({
  automation,
  workflows,
  logs,
}: AutomationPageProps) => {
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
          title: 'Automation Updated',
          description: `${newAutomation.name} has been successfully enabled!`,
        })
        trackEvent(MixpanelActionTrackTypes.AutomationUpdate)
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

  const [loadedLogs, setLogs] = useState(logs)
  const [logPage, setLogPage] = useState(1)
  const [logLoading, setLogLoading] = useState(false)
  const getMoreLogs = useCallback(async () => {
    try {
      setLogLoading(true)
      const logs = await getAutomationLogs(automation.id, { page: logPage + 1 })
      setLogPage(logPage + 1)
      setLogs((prev) => prev.concat(logs))
    } catch (err) {
      pushApiErrorMessage(err)
    } finally {
      setLogLoading(false)
    }
  }, [pushApiErrorMessage, automation, logPage])

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
        <AutomationLogList logs={loadedLogs} />
        <Button
          disabled={logLoading}
          iconPath={mdiChevronDoubleDown}
          onClick={getMoreLogs}
        />
      </ApplicationContent>
    </ApplicationPage>
  )
}

AutomationPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const [, team, , automationId] = params.pathname.split('/')
  const [teamData, automation, workflows, logs] = await Promise.all([
    getTeamIndexPageData(params),
    getAutomation(automationId),
    getWorkflows({ team }),
    getAutomationLogs(automationId, { page: 1 }),
  ])
  return {
    ...teamData,
    automation,
    workflows,
    logs,
  }
}

export default AutomationPage
