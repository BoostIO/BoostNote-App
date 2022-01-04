import React, { useState } from 'react'
import { useCallback } from 'react'
import { useEffectOnce } from 'react-use'
import Spinner from '../../../design/components/atoms/Spinner'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import { useToast } from '../../../design/lib/stores/toast'
import { listSources, deleteSource } from '../../api/teams/sources'
import { SerializedSource } from '../../interfaces/db/source'
import { githubAppUrl } from '../../lib/consts'
import { usePage } from '../../lib/stores/pageStore'
import IntegrationManager from './IntegrationManager'

const GithubIntegrations = () => {
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
          <hr />
          <GithubSourceManager />
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
      <h3>Github Sources</h3>
      <div>
        <a href={githubAppUrl} target='_blank' rel='noreferrer'>
          Install Github app to add more sources
        </a>
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
          <button onClick={fetchSources}>Reload</button>
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
      {source.identifier}
      {source.invalidated && '(Invalidated)'}
      <a
        href={`https://github.com/settings/installations/${githubInstallationId}`}
        target='_blank'
        rel='noreferrer'
      >
        Configure
      </a>
      <button
        disabled={deleting}
        onClick={() => {
          // Add dialog
          setDeleting(true)
          requestDeleteSource(source.id)
          setDeleting(false)
        }}
      >
        Delete
      </button>
    </li>
  )
}
