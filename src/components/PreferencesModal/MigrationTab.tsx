import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  SectionHeader,
  SectionSelect,
  SectionPrimaryButton,
  SectionSecondaryButton,
} from './styled'
import { SelectChangeEventHandler } from '../../cloud/lib/utils/events'
import { SerializedWorkspace } from '../../cloud/interfaces/db/workspace'
import { NoteStorage } from '../../lib/db/types'
import { useEffectOnce } from 'react-use'
import {
  createMigrationJob,
  MigrationProgress,
  MigrationJob,
} from '../../lib/migrate'
import { useRouter } from '../../lib/router'
import { GeneralStatus, useGeneralStatus } from '../../lib/generalStatus'
import CloudWorkspaceSelect from '../molecules/CloudWorkspaceSelect'
import Flexbox from '../../cloud/components/atoms/Flexbox'
import Icon from '../atoms/Icon'
import { mdiAlert, mdiCheckCircle, mdiTea } from '@mdi/js'
import ProgressBar from '../atoms/ProgressBar'
import { usePreferences } from '../../lib/preferences'

interface MigrationPageProps {
  storage: NoteStorage
}

type Team = GeneralStatus['boostHubTeams'][number]

type MigrationState =
  | { step: 'login' }
  | {
      step: 'select'
      teams: Team[]
      team: Team
      workspace: SerializedWorkspace | null
    }
  | { step: 'confirm'; team: Team; workspace: SerializedWorkspace }
  | {
      step: 'running'
      team: Team
      workspace: SerializedWorkspace
      progress: MigrationProgress | null
      job: MigrationJob
    }
  | {
      step: 'complete'
      team: Team
      workspace: SerializedWorkspace
      promoCode?: string
    }
  | { step: 'error'; err: Error }

const MigrationPage = ({ storage }: MigrationPageProps) => {
  const { push } = useRouter()
  const {
    generalStatus: { boostHubTeams },
  } = useGeneralStatus()
  const [migrationState, setMigrationState] = useState<MigrationState>(
    stateFromTeams(boostHubTeams)
  )
  const [workspaceErr, setWorkspaceErr] = useState<Error | null>(null)
  const { openTab, setClosed } = usePreferences()

  useEffect(() => setMigrationState(stateFromTeams(boostHubTeams)), [
    boostHubTeams,
  ])

  const selectTeam: SelectChangeEventHandler = useCallback((ev) => {
    setWorkspaceErr(null)
    setMigrationState(updateTeam(ev.target.value))
  }, [])

  const selectWorkspace = useCallback(
    (workspace: SerializedWorkspace | null) =>
      setMigrationState(updateWorkspace(workspace)),
    []
  )

  const pinDestination = useCallback(
    () => setMigrationState(transitionConfirm()),
    []
  )

  const runMigration = useCallback(
    () => setMigrationState(transitionRunning(storage, setMigrationState)),
    [storage]
  )

  const cancel = useCallback(
    () => setMigrationState(transitionCancel(boostHubTeams)),
    [boostHubTeams]
  )

  const latest = useRef(migrationState)
  useEffect(() => {
    latest.current = migrationState
  }, [migrationState])

  useEffectOnce(() => {
    return () => {
      latest.current.step === 'running' && latest.current.job.destroy()
    }
  })

  if (migrationState.step === 'login') {
    return (
      <div>
        <p>You must have a cloud account to migrate data</p>
        <SectionPrimaryButton onClick={() => push('/app/boosthub/login')}>
          Create Team Account
        </SectionPrimaryButton>
      </div>
    )
  }

  if (migrationState.step === 'select') {
    return (
      <div>
        <SectionHeader>1. Select the destination</SectionHeader>
        {workspaceErr != null && (
          <p>
            An Error occured while tring to fetch workspaces:{' '}
            {workspaceErr.message || 'unknown'}
          </p>
        )}
        <Flexbox justifyContent='space-between'>
          <p>Space</p>
          <SectionSelect value={migrationState.team.id} onChange={selectTeam}>
            {boostHubTeams.map((team) => {
              return (
                <option value={team.id} key={team.id}>
                  {team.name}
                </option>
              )
            })}
          </SectionSelect>
        </Flexbox>
        <Flexbox justifyContent='space-between'>
          <p>Workspace</p>
          <div>
            <CloudWorkspaceSelect
              onChange={selectWorkspace}
              onError={setWorkspaceErr}
              value={migrationState.workspace}
              team={migrationState.team}
            />
          </div>
        </Flexbox>
        <Flexbox justifyContent='flex-end'>
          <SectionSecondaryButton onClick={() => openTab('storage')}>
            Cancel
          </SectionSecondaryButton>
          <SectionPrimaryButton
            onClick={pinDestination}
            disabled={migrationState.workspace == null}
          >
            Next
          </SectionPrimaryButton>
        </Flexbox>
      </div>
    )
  }

  if (migrationState.step === 'confirm') {
    return (
      <div>
        <SectionHeader>2. Start migration</SectionHeader>
        <div>
          <p>
            <Icon path={mdiAlert} /> Notice
          </p>
          <ol>
            <li>
              There are many advanced features like guest invitation for Cloud
              space Pro plan. Please see pricing table. You can try the Pro plan
              free for two weeks.
            </li>
            <li>
              This operation does not account for already migrated documents.
              Migrating multiple times will create duplicates!
            </li>
            <li>
              This operation will clone whole folders and documents to the cloud
              space. Please delete this space manually one migration has
              completed.
            </li>
          </ol>
        </div>
        <Flexbox justifyContent='flex-end'>
          <SectionSecondaryButton onClick={cancel}>
            Cancel
          </SectionSecondaryButton>
          <SectionPrimaryButton onClick={runMigration}>
            Start migration
          </SectionPrimaryButton>
        </Flexbox>
      </div>
    )
  }

  if (migrationState.step === 'running') {
    return (
      <div>
        <SectionHeader>2. Migrating</SectionHeader>
        <Flexbox justifyContent='center' direction='column'>
          <Icon path={mdiTea} size={42} />
          <h3>Migration is processing...</h3>
          <p>
            This may take a while. Feel free to have a cup of tea while waiting.
          </p>
          <small>
            {migrationState.progress == null
              ? 'Setting up!'
              : progressStageToString(migrationState.progress.stage)}
          </small>
          <ProgressBar
            progress={
              migrationState.progress == null
                ? 0
                : getProgressPercentage(migrationState.progress)
            }
          />
        </Flexbox>
        <Flexbox justifyContent='flex-end'>
          <SectionSecondaryButton onClick={cancel}>
            Cancel
          </SectionSecondaryButton>
        </Flexbox>
      </div>
    )
  }

  if (migrationState.step === 'error') {
    return (
      <div>
        <div>
          <p>
            <Icon path={mdiAlert} /> An Error Occured
          </p>
          <p>{migrationState.err.toString()}</p>
        </div>
        <Flexbox justifyContent='flex-end'>
          <SectionSecondaryButton onClick={cancel}>
            Retry
          </SectionSecondaryButton>
        </Flexbox>
      </div>
    )
  }

  return (
    <div>
      <Flexbox justifyContent='center' direction='column'>
        <Icon size={42} path={mdiCheckCircle} />
        <h3>Migration has completed!</h3>
        <p>
          Close settings modal and switch account via the left tab to the cloud
          space.
          <br />
          We hope you enjoy using it!
        </p>
        {migrationState.promoCode != null && (
          <>
            <p>Please use the below promotion code for 3 months free</p>
            <h1>{migrationState.promoCode}</h1>
          </>
        )}
        <SectionPrimaryButton onClick={() => setClosed(true)}>
          Close
        </SectionPrimaryButton>
      </Flexbox>
    </div>
  )
}

function stateFromTeams(teams: Team[]) {
  return (previousState?: MigrationState): MigrationState => {
    if (teams.length < 1) {
      return { step: 'login' }
    }

    if (previousState == null) {
      return {
        step: 'select',
        teams,
        team: teams[0],
        workspace: null,
      }
    }

    if (previousState.step !== 'select') {
      return previousState
    }

    return {
      step: 'select',
      teams,
      team: teams.find((team) => team.id === previousState.team.id) || teams[0],
      workspace: null,
    }
  }
}

function updateTeam(id: string) {
  return (previousState: MigrationState) => {
    return previousState.step === 'select'
      ? {
          ...previousState,
          team:
            previousState.teams.find((team) => team.id === id) ||
            previousState.teams[0],
        }
      : previousState
  }
}

function updateWorkspace(workspace: SerializedWorkspace | null) {
  return (previousState: MigrationState) => {
    return previousState.step === 'select'
      ? { ...previousState, workspace }
      : previousState
  }
}

function transitionRunning(
  storage: NoteStorage,
  setState: React.Dispatch<React.SetStateAction<MigrationState>>
) {
  return (previousState: MigrationState): MigrationState => {
    if (previousState.step === 'confirm') {
      const job = createMigrationJob(storage, previousState.workspace)

      job.on('progress', (progress) => {
        setState((prev) => {
          return { ...prev, progress }
        })
      })
      job.on('error', (err) => setState({ step: 'error', err }))
      job.on('complete', (code) => setState(transitionComplete(code)))
      job.start()

      return {
        ...previousState,
        step: 'running',
        progress: null,
        job,
      }
    }
    return previousState
  }
}

function transitionComplete(promoCode?: string) {
  return (previousState: MigrationState): MigrationState =>
    previousState.step === 'running'
      ? {
          step: 'complete',
          team: previousState.team,
          workspace: previousState.workspace,
          promoCode,
        }
      : previousState
}

function transitionConfirm() {
  return (previousState: MigrationState): MigrationState =>
    previousState.step === 'select' && previousState.workspace != null
      ? {
          step: 'confirm' as const,
          team: previousState.team,
          workspace: previousState.workspace,
        }
      : previousState
}

function transitionCancel(teams: Team[]) {
  return (previousState: MigrationState): MigrationState => {
    if (previousState.step === 'running') {
      previousState.job.destroy()
    }

    if (teams.length < 1) {
      return { step: 'login' }
    }
    return {
      step: 'select',
      teams: teams,
      team: teams[0],
      workspace: null,
    }
  }
}

function progressStageToString(stage: MigrationProgress['stage']) {
  switch (stage.name) {
    case 'document':
      return `Migrating documents: ${stage.handling}`
    case 'complete':
      return 'Complete'
    case 'attachments':
      const substage =
        stage.subStage === 'setup' ? 'Fetching data for' : `Uploading`

      return `Migrating attachments: ${substage} ${stage.handling}`
  }
}

function getProgressPercentage(progress: MigrationProgress) {
  return Math.max(
    Math.min((progress.jobsCompleted / progress.jobCount) * 100, 100),
    0
  )
}

export default MigrationPage
