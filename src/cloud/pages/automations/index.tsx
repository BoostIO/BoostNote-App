import React, { useCallback, useState } from 'react'
import {
  deleteAutomation,
  getAutomations,
} from '../../api/automation/automation'
import { SerializedAutomation } from '../../interfaces/db/automations'
import { getTeamIndexPageData } from '../../api/pages/teams'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import ApplicationContent from '../../components/ApplicationContent'
import ApplicationPage from '../../components/ApplicationPage'
import Topbar from '../../../design/components/organisms/Topbar'
import Button from '../../../design/components/atoms/Button'
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js'
import { GeneralAppProps } from '../../interfaces/api'
import { getTeamURL } from '../../lib/utils/patterns'
import { useRouter } from '../../lib/router'
import styled from '../../../design/lib/styled'
import { useToast } from '../../../design/lib/stores/toast'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'

type AutomationListPageProps = GeneralAppProps & {
  automations: SerializedAutomation[]
}

const AutomationListPage = ({
  automations: initialAutomations,
  team,
}: AutomationListPageProps) => {
  const { push } = useRouter()
  const { pushApiErrorMessage, pushMessage } = useToast()
  const [automations, setAutomations] = useState(initialAutomations)
  const [deleteSet, setDeleteSet] = useState(new Set<number>())

  const handleAutomationDelete = useCallback(
    async (automation: SerializedAutomation) => {
      try {
        setDeleteSet((set) => {
          const newSet = new Set(set)
          newSet.add(automation.id)
          return newSet
        })
        await deleteAutomation(automation.id)
        setAutomations((automations) =>
          automations.filter((wkfl) => wkfl.id !== automation.id)
        )
        pushMessage({
          type: 'success',
          title: 'Automation Deleted!',
          description: `${automation.name} was succesfully deleted.`,
        })
        trackEvent(MixpanelActionTrackTypes.AutomationDelete)
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setDeleteSet((set) => {
          const newSet = new Set(set)
          newSet.delete(automation.id)
          return newSet
        })
      }
    },
    [pushApiErrorMessage, pushMessage]
  )

  return (
    <ApplicationPage>
      <Topbar>
        <h2>Automations</h2>
      </Topbar>
      <ApplicationContent>
        <Container>
          <ul className='automation__list'>
            {automations.map((workflow) => {
              const url = `${getTeamURL(team)}/automations/${workflow.id}`
              return (
                <div className='automation__list__item' key={workflow.id}>
                  <a
                    onClick={(ev) => {
                      ev.preventDefault()
                      push(url)
                    }}
                    href={url}
                  >
                    {workflow.name}
                  </a>
                  <Button
                    onClick={() => handleAutomationDelete(workflow)}
                    disabled={deleteSet.has(workflow.id)}
                    variant='danger'
                    iconPath={mdiTrashCanOutline}
                  />
                </div>
              )
            })}
          </ul>
          <a href={`${getTeamURL(team)}/automations/create`}>
            <Button
              onClick={(ev) => {
                ev.preventDefault()
                push(`${getTeamURL(team)}/automations/create`)
              }}
              iconPath={mdiPlus}
            >
              Create Automation
            </Button>
          </a>
        </Container>
      </ApplicationContent>
    </ApplicationPage>
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

const Container = styled.div`
  padding: ${({ theme }) => theme.sizes.spaces.df}px;

  & a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  & .workflow__list {
    list-style: none;
    padding: 0;

    & .workflow__list__item {
      display: flex;
      align-items: center;
      margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
      & a {
        flex: 1 1 auto;
        text-decoration: none;
        color: ${({ theme }) => theme.colors.text.primary};
        font-size: ${({ theme }) => theme.sizes.fonts.md}px;
      }

      & button {
        flex: 0 0 auto;
      }
    }
  }
`
