import React, { useState } from 'react'
import { useCallback } from 'react'
import { useEffectOnce } from 'react-use'
import Button from '../../../design/components/atoms/Button'
import { ExternalLink } from '../../../design/components/atoms/Link'
import Spinner from '../../../design/components/atoms/Spinner'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import { useToast } from '../../../design/lib/stores/toast'
import { listSources, deleteSource } from '../../api/teams/sources'
import { SerializedSource } from '../../interfaces/db/source'
import { githubAppUrl } from '../../lib/consts'
import { useBetaRegistration } from '../../lib/stores/beta'
import { usePage } from '../../lib/stores/pageStore'
import IntegrationManager from './IntegrationManager'

const GithubIntegrations = () => {
  const betaRegistration = useBetaRegistration()
  return (
    <SettingTabContent
      title='GitHub'
      body={
        <>
          <IntegrationManager
            service='github:team'
            name='Github'
            icon='/app/static/logos/github.png'
          >
            <h3>How does it work?</h3>
            <p>Create Github Issue blocks in Canvas Documents (beta)</p>
          </IntegrationManager>
          {betaRegistration.state === 'loading' ? (
            <Spinner />
          ) : betaRegistration.betaRegistration?.state.automations ? (
            <>
              <hr />
              <GithubSourceManager />
            </>
          ) : null}
        </>
      }
    />
  )
}

export default GithubIntegrations

const GithubSourceManager = () => {
  const [fetching, setFetching] = useState(false)
  const [sources, setSources] = useState<SerializedSource[]>([])
  const { team } = usePage()
  const { pushApiErrorMessage } = useToast()

  const fetchSources = useCallback(async () => {
    if (team == null) {
      return
    }
    setFetching(true)
    try {
      const { sources } = await listSources(team, { type: 'github' })

      setSources(sources)
    } catch (error) {
      pushApiErrorMessage(error)
    }

    setFetching(false)
  }, [team, pushApiErrorMessage])

  const requestDeleteSource = useCallback(
    async (sourceId: string) => {
      if (team == null) {
        return
      }
      try {
        await deleteSource(team, sourceId)
        setSources((previousSources) => {
          return previousSources.filter((source) => source.id !== sourceId)
        })
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [team, pushApiErrorMessage]
  )

  useEffectOnce(() => {
    fetchSources()
  })

  return (
    <div>
      <h3>(BETA) Github Sources</h3>
      <div>
        <ExternalLink href={githubAppUrl}>
          Install Github app to add more sources
        </ExternalLink>
      </div>
      {fetching ? (
        <Spinner />
      ) : (
        <>
          <ul>
            {sources.map((source) => {
              return (
                <GithubSourceItem
                  key={source.id}
                  source={source}
                  requestDeleteSource={requestDeleteSource}
                />
              )
            })}
          </ul>
          <Button onClick={fetchSources}>Reload</Button>
        </>
      )}
    </div>
  )
}

interface GithubSourceItemProps {
  source: SerializedSource
  requestDeleteSource: (sourceId: string) => Promise<void>
}

const GithubSourceItem = ({
  source,
  requestDeleteSource,
}: GithubSourceItemProps) => {
  const [, githubInstallationId] = source.identifier.split(':')
  const [deleting, setDeleting] = useState(false)
  return (
    <li key={source.id}>
      {source.name}
      {source.invalidated && '(Invalidated)'}
      <ExternalLink
        href={`https://github.com/settings/installations/${githubInstallationId}`}
      >
        Configure
      </ExternalLink>
      <Button
        disabled={deleting}
        onClick={() => {
          // Add dialog
          setDeleting(true)
          requestDeleteSource(source.id)
          setDeleting(false)
        }}
      >
        Delete
      </Button>
    </li>
  )
}
