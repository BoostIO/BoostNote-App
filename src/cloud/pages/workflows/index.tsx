import React, { useCallback, useState } from 'react'
import { deleteWorkflow, getWorkflows } from '../../api/automation/workflow'
import { getTeamIndexPageData } from '../../api/pages/teams'
import { SerializedWorkflow } from '../../interfaces/db/automations'
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

type WorkflowListPageProps = GeneralAppProps & {
  workflows: SerializedWorkflow[]
}

const WorkflowListPage = ({
  workflows: initialWorkflows,
  team,
}: WorkflowListPageProps) => {
  const { push } = useRouter()
  const { pushApiErrorMessage, pushMessage } = useToast()
  const [workflows, setWorkflows] = useState(initialWorkflows)
  const [deleteSet, setDeleteSet] = useState(new Set<number>())

  const handleWorkflowDelete = useCallback(
    async (workflow: SerializedWorkflow) => {
      try {
        setDeleteSet((set) => {
          const newSet = new Set(set)
          newSet.add(workflow.id)
          return newSet
        })
        await deleteWorkflow(workflow.id)
        setWorkflows((workflows) =>
          workflows.filter((wkfl) => wkfl.id !== workflow.id)
        )
        pushMessage({
          type: 'success',
          title: 'Workflow Deleted!',
          description: `${workflow.name} was succesfully deleted.`,
        })
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setDeleteSet((set) => {
          const newSet = new Set(set)
          newSet.delete(workflow.id)
          return newSet
        })
      }
    },
    [pushApiErrorMessage, pushMessage]
  )

  return (
    <ApplicationPage>
      <Topbar>
        <h2>Workflows</h2>
      </Topbar>
      <ApplicationContent>
        <Container>
          <ul className='workflow__list'>
            {workflows.map((workflow) => {
              const url = `${getTeamURL(team)}/workflows/${workflow.id}`
              return (
                <div className='workflow__list__item' key={workflow.id}>
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
                    onClick={() => handleWorkflowDelete(workflow)}
                    disabled={deleteSet.has(workflow.id)}
                    variant='danger'
                    iconPath={mdiTrashCanOutline}
                  />
                </div>
              )
            })}
          </ul>
          <a href={`${getTeamURL(team)}/workflows/create`}>
            <Button
              onClick={(ev) => {
                ev.preventDefault()
                push(`${getTeamURL(team)}/workflows/create`)
              }}
              iconPath={mdiPlus}
            >
              Create A Workflow
            </Button>
          </a>
        </Container>
      </ApplicationContent>
    </ApplicationPage>
  )
}

WorkflowListPage.getInitialProps = async (
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

export default WorkflowListPage

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
