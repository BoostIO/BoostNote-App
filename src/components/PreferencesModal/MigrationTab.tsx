import React, { useEffect, useState, useCallback } from 'react'
import { SelectChangeEventHandler } from '../../cloud/lib/utils/events'
import { SerializedWorkspace } from '../../cloud/interfaces/db/workspace'
import { NoteDoc, NoteStorage } from '../../lib/db/types'
import { MigrationProgress, MigrationSummary } from '../../lib/migrate'
import { useRouter } from '../../lib/router'
import { GeneralStatus, useGeneralStatus } from '../../lib/generalStatus'
import CloudWorkspaceSelect from '../molecules/CloudWorkspaceSelect'
import Flexbox from '../../cloud/components/atoms/Flexbox'
import { mdiAlert, mdiCheckCircle, mdiTea } from '@mdi/js'
import ProgressBar from '../atoms/ProgressBar'
import { usePreferences } from '../../lib/preferences'
import { FormSelect, FormHeading, FormGroup } from '../atoms/form'
import Alert from '../atoms/Alert'
import { useMigrations, MigrationInfo } from '../../lib/migrate/store'
import plur from 'plur'
import { useStorageRouter } from '../../lib/storageRouter'
import Icon from '../../shared/components/atoms/Icon'
import styled from '../../shared/lib/styled'
import Button from '../../shared/components/atoms/Button'

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
    }
  | {
      step: 'complete'
      team: Team
      workspace: SerializedWorkspace
      summary?: MigrationSummary
    }
  | { step: 'error'; err: Error }

const MigrationPage = ({ storage }: MigrationPageProps) => {
  const { push } = useRouter()
  const {
    generalStatus: { boostHubTeams },
  } = useGeneralStatus()
  const { get, start, end } = useMigrations()
  const { navigateToNote } = useStorageRouter()

  const runningJob = get(storage.id)

  const [migrationState, setMigrationState] = useState<MigrationState>(
    initState(boostHubTeams, runningJob)
  )
  const [workspaceErr, setWorkspaceErr] = useState<Error | null>(null)
  const { openTab, setClosed } = usePreferences()

  useEffect(() => {
    if (runningJob != null) {
      setMigrationState(syncStateToMigration(runningJob))
    }
  }, [runningJob])

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

  const runMigration = useCallback(() => {
    if (migrationState.step === 'confirm') {
      start(storage, migrationState.workspace, migrationState.team)
    }
  }, [migrationState, start, storage])

  const cancel = useCallback(() => {
    end(storage.id)
    setMigrationState(transitionCancel(boostHubTeams))
  }, [boostHubTeams, end, storage.id])

  const finish = useCallback(() => {
    end(storage.id)
    openTab('storage')
  }, [end, openTab, storage])

  if (migrationState.step === 'login') {
    return (
      <div>
        <p>You must have a cloud account to migrate data</p>
        <Button
          variant={'primary'}
          onClick={() => {
            push('/app/boosthub/login')
            setClosed(true)
          }}
        >
          Create Team Account
        </Button>
      </div>
    )
  }

  if (migrationState.step === 'select') {
    return (
      <div>
        <FormHeading depth={2}>1. Select the destination</FormHeading>
        {workspaceErr != null && (
          <p>
            An Error occured while tring to fetch workspaces:{' '}
            {workspaceErr.message || 'unknown'}
          </p>
        )}
        <FormGroup>
          <Flexbox justifyContent='space-between'>
            <p>Space</p>
            <FormSelect value={migrationState.team.id} onChange={selectTeam}>
              {boostHubTeams.map((team) => {
                return (
                  <option value={team.id} key={team.id}>
                    {team.name}
                  </option>
                )
              })}
            </FormSelect>
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
        </FormGroup>
        <Flexbox justifyContent='flex-end'>
          <Button variant={'transparent'} onClick={() => openTab('storage')}>
            Cancel
          </Button>
          <Button
            variant={'primary'}
            onClick={pinDestination}
            disabled={migrationState.workspace == null}
          >
            Next
          </Button>
        </Flexbox>
      </div>
    )
  }

  if (migrationState.step === 'confirm') {
    return (
      <div>
        <FormHeading depth={2}>2. Start migration</FormHeading>
        <Alert>
          <FormHeading depth={2}>⚠️ Notice</FormHeading>
          <ol>
            <li>
              There are many advanced features like viewers invitation for Cloud
              space Pro plan. Please see pricing table. A two weeks long free
              trial for the Pro plan is also available.
            </li>
            <li>
              This operation does not account for already migrated documents.
              Migrating multiple times will create duplicates!
            </li>
            <li>
              This operation will clone whole folders and documents to the cloud
              space. Please delete this space manually once migration has
              completed.
            </li>
            <li>
              After migration, you will receive an 1 month free trial coupon for
              the cloud space.
            </li>
          </ol>
        </Alert>
        <Flexbox justifyContent='flex-end'>
          <Button variant={'transparent'} onClick={cancel}>
            Cancel
          </Button>
          <Button variant={'primary'} onClick={runMigration}>
            Start migration
          </Button>
        </Flexbox>
      </div>
    )
  }

  if (migrationState.step === 'running') {
    return (
      <div>
        <FormHeading>2. Migrating</FormHeading>
        <Flexbox justifyContent='center' direction='column'>
          <Icon path={mdiTea} size={50} />
          <h3>Migration is processing...</h3>
          <p>
            This may take a while. Feel free to have a cup of tea while waiting.
          </p>
          <p>
            {migrationState.progress == null
              ? 'Setting up!'
              : `Migrating ${migrationState.progress.jobsCompleted} / ${migrationState.progress.jobCount}`}
          </p>
          <ProgressBar
            progress={
              migrationState.progress == null
                ? 0
                : getProgressPercentage(migrationState.progress)
            }
          />
        </Flexbox>
        <Flexbox justifyContent='flex-end'>
          <Button variant={'transparent'} onClick={cancel}>
            Cancel
          </Button>
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
          <Button variant={'secondary'} onClick={cancel}>
            Retry
          </Button>
        </Flexbox>
      </div>
    )
  }

  const failedNoteJobs: { note: NoteDoc; err: unknown }[] =
    migrationState.summary != null
      ? (migrationState.summary.jobsFailed.filter(
          (job) => job.name === 'note' && job.note
        ) as any[])
      : []

  return (
    <StyledMigrationScreen>
      <Flexbox
        justifyContent='flex-start'
        alignItems='baseline'
        direction='column'
      >
        <Flexbox justifyContent='center' alignItems='center' direction='column'>
          <Icon size={50} path={mdiCheckCircle} />
          <h3>Migration has completed!</h3>
        </Flexbox>
        <p>
          Close settings modal and switch account via the left tab to the cloud
          space.
          <br />
          You&apos;ll receive an email containing the coupon code and
          instructions on how to redeem it.
          <br />
          We hope you enjoy using it!
        </p>
        {migrationState.summary != null ? (
          <>
            <p className='summary'>
              &middot;{' '}
              {migrationState.summary.noteCount - failedNoteJobs.length}{' '}
              {plur(
                'document',
                migrationState.summary.noteCount - failedNoteJobs.length
              )}{' '}
              have been successfully imported
            </p>
            {failedNoteJobs.length > 0 && (
              <>
                <p className='summary'>
                  &middot; {failedNoteJobs.length}{' '}
                  {plur('document', failedNoteJobs.length)} could not be
                  imported. Please open the documents separately to transfer
                  your data manually (export, copy and paste ...). Sorry for the
                  troubles.
                </p>
                <Alert>
                  <ul>
                    {failedNoteJobs.map((job) => (
                      <li key={job.note._id}>
                        <a
                          href='#'
                          onClick={(e) => {
                            e.preventDefault()
                            navigateToNote(
                              storage.id,
                              job.note._id,
                              job.note.folderPathname
                            )
                            setClosed(true)
                          }}
                        >
                          ⚠️ {job.note.folderPathname}
                          {job.note.folderPathname.endsWith('/') ? '' : '/'}
                          {job.note.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Alert>
              </>
            )}
          </>
        ) : null}

        <Flexbox justifyContent='center'>
          <Button variant={'primary'} onClick={finish}>
            Finish
          </Button>
        </Flexbox>
      </Flexbox>
    </StyledMigrationScreen>
  )
}

const StyledMigrationScreen = styled.div`
  width: 96%;
  max-width: 600px;
  margin: auto;

  div {
    width: 100%;
  }

  .summary {
    margin: 2px 0;
    &:last-of-type {
      margin-bottom: 30px;
    }
  }

  .alert--variant-secondary {
    max-height: 300px;
    overflow: auto;
  }
`

function initState(teams: Team[], runningJob?: MigrationInfo) {
  return () => {
    if (runningJob != null) {
      return syncStateToMigration(runningJob)()
    } else {
      return stateFromTeams(teams)()
    }
  }
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

function syncStateToMigration(info: MigrationInfo) {
  return (): MigrationState => {
    if (info.state.ok) {
      if (info.state.summary != null) {
        return {
          step: 'complete',
          team: info.team,
          summary: info.state.summary,
          workspace: info.workspace,
        }
      }
      return {
        step: 'running',
        team: info.team,
        workspace: info.workspace,
        progress: info.state.progress,
      }
    } else {
      return {
        step: 'error',
        err: info.state.err,
      }
    }
  }
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
  return (): MigrationState => {
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

function getProgressPercentage(progress: MigrationProgress) {
  return Math.max(
    Math.min((progress.jobsCompleted / progress.jobCount) * 100, 100),
    0
  )
}

export default MigrationPage
