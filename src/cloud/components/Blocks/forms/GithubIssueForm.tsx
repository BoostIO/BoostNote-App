import { mdiGithub, mdiPlus } from '@mdi/js'
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEventHandler,
} from 'react'
import { FormSelect } from '../../../../components/atoms/form'
import Button from '../../../../design/components/atoms/Button'
import Icon from '../../../../design/components/atoms/Icon'
import Spinner from '../../../../design/components/atoms/Spinner'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../design/components/molecules/Form/templates/FormRowItem'
import { useTeamIntegrations } from '../../../../design/lib/stores/integrations'
import { useToast } from '../../../../design/lib/stores/toast'
import styled from '../../../../design/lib/styled'
import { GithubIssueBlock } from '../../../api/blocks'
import { getAction, IntegrationActionTypes } from '../../../api/integrations'
import { SerializedTeamIntegration } from '../../../interfaces/db/connections'
import { usePage } from '../../../lib/stores/pageStore'
import ServiceConnect, { Integration } from '../../ServiceConnect'
import { FormProps } from '../BlockContent'

type State =
  | { stage: 'initialising' }
  | { stage: 'integrate' }
  | { stage: 'issue_select'; integrations: SerializedTeamIntegration[] }

const GithubIssueForm = ({ onSubmit }: FormProps<GithubIssueBlock>) => {
  const integrationState = useTeamIntegrations()
  const { team } = usePage()
  const [state, setState] = useState<State>({ stage: 'initialising' })

  useEffect(() => {
    if (integrationState.type === 'initialising') {
      setState({ stage: 'initialising' })
      return
    }
    const githubIntegrations = integrationState.integrations.filter(
      (integration) => integration.service === 'github:team'
    )

    if (githubIntegrations.length === 0) {
      setState({ stage: 'integrate' })
      return
    }

    setState({ stage: 'issue_select', integrations: githubIntegrations })
  }, [integrationState])

  const runImport = useCallback(
    async (issues: Issue[]) => {
      for (const issue of issues) {
        await onSubmit({
          type: 'github.issue',
          name: issue.title,
          data: issue,
          children: [],
        })
      }
    },
    [onSubmit]
  )

  const addIntegration = useCallback(
    (integration: Integration) => {
      if (
        integrationState.type !== 'initialising' &&
        integration.type === 'team'
      ) {
        integrationState.actions.addIntegration(integration.integration)
      }
    },
    [integrationState]
  )

  return (
    <GithubIssueFormLayout>
      {(() => {
        switch (state.stage) {
          case 'initialising':
            return <Spinner />
          case 'integrate':
            return (
              <StyledIntegrationManager>
                <div>
                  <div className='github-issue__form__integrate__icons'>
                    <img src='/app/static/images/logo_symbol.svg' />
                    <Icon path={mdiPlus} size={20} />
                    <img src='/app/static/logos/github.png' />
                  </div>
                  <div>
                    <h1>GitHub</h1>
                    <p>
                      Integrate with GitHub to import Issues automatically. You
                      can check the task progress, assignees, due date and more
                      at a glance.
                    </p>
                    <ServiceConnect
                      service='github:team'
                      team={team}
                      onConnect={addIntegration}
                    />
                  </div>
                </div>
                <div className='github-issue__form__integrate__splash'>
                  <img />
                </div>
              </StyledIntegrationManager>
            )
          case 'issue_select':
            return (
              <GithubIssueSelector
                integrations={state.integrations}
                onImport={runImport}
              />
            )
        }
      })()}
    </GithubIssueFormLayout>
  )
}

const StyledIntegrationManager = styled.div`
  padding: 0 ${({ theme }) => theme.sizes.spaces.l}px;
  display: flex;
  align-items: center;
  height: 100%;

  & > div {
    width: 50%;
  }

  & .github-issue__form__integrate__icons {
    display: flex;
    align-items: center;
    & > img {
      height: ${({ theme }) => theme.sizes.fonts.xl * 2}px;
    }

    & > svg {
      margin: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }

  & h1 {
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
    margin: ${({ theme }) => theme.sizes.spaces.l}px 0;
  }

  & p {
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    margin: ${({ theme }) => theme.sizes.spaces.md}px 0;
  }

  & .github-issue__form__integrate__splash {
    background-color: #c4c4c4;
    height: 300px;
    width: 400px;
    & > img {
      width: 100%;
      height: 100%;
    }
  }
`

interface GithubIssueSelectorProps {
  integrations: SerializedTeamIntegration[]
  onImport: (issues: Record<string, any>[]) => Promise<void>
}

type Org = IntegrationActionTypes['orgs:list'][number]
type Repo = IntegrationActionTypes['org:repos'][number]
type Issue = IntegrationActionTypes['repo:issues'][number]

const GithubIssueSelector = ({
  integrations,
  onImport,
}: GithubIssueSelectorProps) => {
  const [currentIntegration, setCurrentIntegration] = useState(integrations[0])
  const [organisations, setOrganisations] = useState<Org[]>([])
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const [currentRepo, setCurrentRepo] = useState<Repo | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssues, setSelectedIssues] = useState<Set<Issue>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const { pushApiErrorMessage } = useToast()

  const errorHandleRef = useRef(pushApiErrorMessage)
  useEffect(() => {
    errorHandleRef.current = pushApiErrorMessage
  }, [pushApiErrorMessage])

  const integrationRef = useRef(currentIntegration)
  useEffect(() => {
    integrationRef.current = currentIntegration
  }, [currentIntegration])

  useEffect(() => {
    setOrganisations([])
    setCurrentOrg(null)
    setIsLoading(true)
    getAction(currentIntegration, 'orgs:list')
      .then((orgs) => {
        setOrganisations(orgs)
        setCurrentOrg(orgs[0] || null)
      })
      .finally(() => setIsLoading(false))
      .catch(errorHandleRef.current)
  }, [currentIntegration])

  useEffect(() => {
    setRepos([])
    setCurrentRepo(null)
    if (currentOrg != null) {
      setIsLoading(true)
      getAction(integrationRef.current, 'org:repos', { org: currentOrg.login })
        .then((repos) => {
          setRepos(repos)
          setCurrentRepo(repos[0] || null)
        })
        .finally(() => setIsLoading(false))
        .catch(errorHandleRef.current)
    }
  }, [currentOrg])

  useEffect(() => {
    setIssues([])
    setSelectedIssues(new Set())
    if (currentRepo != null) {
      setIsLoading(true)
      getAction(integrationRef.current, 'repo:issues', {
        owner: currentRepo.owner.login,
        repo: currentRepo.name,
      })
        .then(setIssues)
        .finally(() => setIsLoading(false))
        .catch(errorHandleRef.current)
      setIsLoading(false)
    }
  }, [currentRepo])

  const setIntegration = useCallback(
    ({ value }) => {
      const integration = integrations.find(({ id }) => id === value)
      if (integration != null) {
        setCurrentIntegration(integration)
      }
    },
    [integrations]
  )

  const setOrg = useCallback(
    ({ value }) => {
      const org = organisations.find(({ id }) => id === value)
      if (org) {
        setCurrentOrg(org)
      }
    },
    [organisations]
  )

  const setRepo = useCallback(
    ({ value }) => {
      const repo = repos.find(({ id }) => id === value)
      if (repo) {
        setCurrentRepo(repo)
      }
    },
    [repos]
  )

  const integrationOptions = useMemo(() => {
    return integrations.map(({ id, name }) => ({ label: name, value: id }))
  }, [integrations])

  const organisationOptions = useMemo(() => {
    return organisations.map(({ id, login }) => ({ label: login, value: id }))
  }, [organisations])

  const repoOptions = useMemo(() => {
    return repos.map(({ id, name }) => ({ label: name, value: id }))
  }, [repos])

  const filteredIssues: Issue[] = useMemo(() => {
    const lower = search.toLowerCase()
    return search === ''
      ? issues
      : issues.filter(
          (issue) =>
            issue.title.toLowerCase().includes(lower) ||
            selectedIssues.has(issue)
        )
  }, [issues, search, selectedIssues])

  const toggleAll: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (ev) => {
      if (ev.target.checked) {
        setSelectedIssues(new Set(issues))
      } else {
        setSelectedIssues(new Set())
      }
    },
    [issues]
  )

  const createToggleSelect = useCallback(
    (issue: Issue): ChangeEventHandler<HTMLInputElement> => {
      return (ev) => {
        const checked = ev.target.checked
        setSelectedIssues((old) => {
          if (checked) {
            old.add(issue)
          } else {
            old.delete(issue)
          }
          return new Set(old)
        })
      }
    },
    []
  )
  const runImport = useCallback(async () => {
    try {
      setIsLoading(true)
      await onImport(Array.from(selectedIssues.values()))
    } finally {
      setIsLoading(false)
    }
  }, [selectedIssues, onImport])

  return (
    <div className='github-issue__form__importer'>
      <FormRow fullWidth={true}>
        <FormRowItem>
          <FormSelect
            value={{
              label: currentIntegration.name,
              value: currentIntegration.id,
            }}
            isDisabled={isLoading}
            options={integrationOptions}
            onChange={setIntegration}
          />
        </FormRowItem>
        <FormRowItem>
          <FormSelect
            value={
              currentOrg != null
                ? {
                    label: currentOrg.login,
                    value: currentOrg.id,
                  }
                : undefined
            }
            isLoading={isLoading}
            options={organisationOptions}
            onChange={setOrg}
          />
        </FormRowItem>
        <FormRowItem>
          <FormSelect
            value={
              currentRepo != null
                ? {
                    label: currentRepo.name,
                    value: currentRepo.id,
                  }
                : undefined
            }
            isLoading={isLoading}
            options={repoOptions}
            onChange={setRepo}
          />
        </FormRowItem>
        <FormRowItem>
          <FormInput
            placeholder='Search'
            value={search}
            onChange={(ev) => setSearch(ev.target.value)}
          />
        </FormRowItem>
      </FormRow>
      <div className='github-issue__form__table'>
        <table>
          <thead>
            <tr>
              <td>
                <input
                  type='checkbox'
                  onChange={toggleAll}
                  checked={
                    filteredIssues.length > 0 &&
                    filteredIssues.length === selectedIssues.size
                  }
                />{' '}
                Title
              </td>
              <td>Assignees</td>
              <td>Status</td>
              <td>Labels</td>
              <td>LinkedPR</td>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue.id}>
                <td>
                  <input
                    type='checkbox'
                    checked={selectedIssues.has(issue)}
                    onChange={createToggleSelect(issue)}
                  />
                  <span>{issue.title}</span>
                </td>
                <td>
                  {issue.assignees
                    .map((assignee: any) => assignee.login)
                    .join(', ')}
                </td>
                <td>{issue.status}</td>
                <td>
                  {issue.labels.map((label: any) => label.name).join(', ')}
                </td>
                <td>
                  {issue.pull_request != null && issue.pull_request.html_url}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='github-issue__form__action'>
        <Button
          onClick={runImport}
          disabled={selectedIssues.size === 0}
          variant='primary'
        >
          Import{' '}
          {selectedIssues.size > 0 && <span>({selectedIssues.size})</span>}
        </Button>
      </div>
    </div>
  )
}

const GithubIssueFormLayout = (props: React.PropsWithChildren<{}>) => {
  return (
    <StyledGithubIssueForm>
      <h2 className='github-issue__form____title'>
        <Icon path={mdiGithub} size={20} /> GitHub
      </h2>
      <div className='github-issue__form__content'>{props.children}</div>
    </StyledGithubIssueForm>
  )
}

const StyledGithubIssueForm = styled.div`
  height: 80vh;
  display: flex;
  flex-direction: column;

  & .github-issue__form__title {
    display: flex;
    align-items: center;
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    margin: 0;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.md}px;
    padding: ${({ theme }) => theme.sizes.spaces.df}px 0;
    svg {
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }

  & .github-issue__form__content {
    flex: 1 1 auto;
    min-height: 0;
  }

  & .github-issue__form__importer {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  & .github-issue__form__table {
    flex-grow: 1;
    overflow: auto;
  }

  & .github-issue__form__action {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.sizes.spaces.md}px 0;
    border-top: 1px solid ${({ theme }) => theme.colors.border.second};
  }

  & table {
    width: 100%;
    text-align: left;
    border-collapse: collapse;
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
  }

  & td,
  th {
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  & .block__table__view__import {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }
`

export default GithubIssueForm
