import { createStoreContext } from '../context'
import { NoteStorage } from '../db/types'
import { SerializedWorkspace } from '../../cloud/interfaces/db/workspace'
import { useCallback, useState, useRef, useEffect } from 'react'
import {
  MigrationJob,
  createMigrationJob,
  MigrationProgress,
  MigrationSummary,
} from '.'
import { GeneralStatus } from '../generalStatus'
import { notify } from '../notification'
import { usePreferences } from '../preferences'
import { useStorageRouter } from '../storageRouter'

type Team = GeneralStatus['boostHubTeams'][number]

export interface MigrationInfo {
  team: Team
  storage: NoteStorage
  workspace: SerializedWorkspace
  state:
    | {
        ok: true
        progress: MigrationProgress | null
        summary?: MigrationSummary
      }
    | { ok: false; err: any }
}

interface MigrationManager {
  get(id: string): MigrationInfo | undefined
  start(storage: NoteStorage, workspace: SerializedWorkspace, team: Team): void
  end(id: string): void
}

function useMigrationStore(): MigrationManager {
  const { navigate } = useStorageRouter()
  const { openTab } = usePreferences()
  const [jobs, setJobs] = useState<
    Map<string, MigrationInfo & { _job: MigrationJob }>
  >(new Map())

  const get: MigrationManager['get'] = useCallback((id) => jobs.get(id), [jobs])

  const navigateRef = useRef(navigate)
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])
  const openTabRef = useRef(openTab)
  useEffect(() => {
    openTabRef.current = openTab
  }, [openTab])

  const start: MigrationManager['start'] = useCallback(
    (storage, workspace, team) => {
      setJobs((prev) => {
        const running = prev.get(storage.id)
        if (running != null) {
          return prev
        }
        const next = new Map(prev)
        const job = createMigrationJob(storage, workspace)

        job.on('progress', (progress) => {
          setJobs((prev) => {
            const curr = prev.get(storage.id)
            if (curr == null || curr._job !== job) {
              job.destroy()
              return prev
            }
            const next = new Map(prev)
            next.set(storage.id, { ...curr, state: { ok: true, progress } })
            return next
          })
        })

        job.on('error', (err) => {
          setJobs((prev) => {
            const curr = prev.get(storage.id)
            if (curr == null || curr._job !== job) {
              job.destroy()
              return prev
            }

            const next = new Map(prev)
            next.set(storage.id, { ...curr, state: { ok: false, err } })
            return next
          })
        })

        job.on('complete', (summary) => {
          notify({
            title: 'Migration Complete',
            body: `Migration for ${storage.name} to ${team.name}:${workspace.name} has completed. Check the report in the migration tab in settings.`,
            onClick: () => {
              navigateRef.current(storage.id)
              openTabRef.current('migration')
            },
          })

          setJobs((prev) => {
            const curr = prev.get(storage.id)
            if (curr == null || curr._job !== job) {
              job.destroy()
              return prev
            }
            const next = new Map(prev)
            next.set(storage.id, {
              ...curr,
              state: { ok: true, progress: null, summary },
            })
            return next
          })
        })

        job.start()
        next.set(storage.id, {
          team,
          storage,
          workspace,
          state: { ok: true, progress: null },
          _job: job,
        })

        return next
      })
    },
    []
  )

  const end: MigrationManager['end'] = useCallback((id) => {
    setJobs((prev) => {
      const running = prev.get(id)
      if (running == null) {
        return prev
      }
      running._job.destroy()
      prev.delete(id)
      return new Map(prev)
    })
  }, [])

  return { get, start, end }
}

export const {
  StoreProvider: MigrationProvider,
  useStore: useMigrations,
} = createStoreContext(useMigrationStore, 'migrations')
