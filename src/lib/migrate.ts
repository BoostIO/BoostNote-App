import { NoteStorage, AttachmentData, NoteDoc } from './db/types'
import { SerializedWorkspace } from '../cloud/interfaces/db/workspace'
import { uploadFile, buildTeamFileUrl } from '../cloud/api/teams/files'
import { createDocREST } from '../cloud/api/rest/doc'
import { getPromo } from '../cloud/api/teams/subscription'

export interface MigrationJob {
  on(ev: 'error', cb: (err: Error) => void): void
  on(ev: 'progress', cb: (progress: MigrationProgress) => void): void
  on(ev: 'complete', cb: (code?: string) => void): void
  start(): void
  stop(): void
  destroy(): void
}

type Stage =
  | { name: 'complete' }
  | { name: 'attachments'; handling: string; subStage: 'setup' | 'upload' }
  | { name: 'document'; handling: string }

export interface MigrationProgress {
  jobCount: number
  jobsCompleted: number
  stage: Stage
}

export function createMigrationJob(
  storage: NoteStorage,
  workspace: SerializedWorkspace
): MigrationJob {
  const iter = createMigrationIter(storage, workspace)
  const onErrorSet = new Set<(err: Error) => void>()
  const onProgressSet = new Set<(progress: MigrationProgress) => void>()
  const onCompleteSet = new Set<(code?: string) => void>()

  let stopped = false
  let complete = false

  const job: MigrationJob = {
    on(ev: 'error' | 'progress' | 'complete', cb: any) {
      switch (ev) {
        case 'error':
          onErrorSet.add(cb)
          break
        case 'progress':
          onProgressSet.add(cb)
          break
        case 'complete':
          onCompleteSet.add(cb)
          break
      }
    },
    async start() {
      stopped = false
      try {
        while (!stopped && !complete) {
          const result = await iter.next()
          onProgressSet.forEach(apply(result.value))
          if (result.done) {
            const promotion = await getPromoCode(workspace.teamId)
            onCompleteSet.forEach(apply(promotion))
            complete = true
          }
        }
      } catch (error) {
        onErrorSet.forEach(apply(error))
      }
    },
    stop() {
      stopped = true
    },
    destroy() {
      stopped = true
      onProgressSet.clear()
      onErrorSet.clear()
      onCompleteSet.clear()
    },
  }

  return job
}

async function* createMigrationIter(
  storage: NoteStorage,
  workspace: SerializedWorkspace
): AsyncGenerator<MigrationProgress, MigrationProgress> {
  const attachments = Object.entries(storage.attachmentMap).filter(tupleExists)
  const notes = Object.entries(storage.noteMap)
    .filter(tupleExists)
    .filter(([, doc]) => !doc.trashed)

  const attachmentSources: [string, string][] = []

  const jobCount = attachments.length * 2 + notes.length
  let jobsCompleted = 0

  const attachmentsQueue = attachments.map(([id, attachment]) => ({
    id,
    attachment,
    retries: 0,
  }))
  while (attachmentsQueue.length > 0) {
    const job = attachmentsQueue.shift()
    if (job == null) break
    const { attachment, id, retries } = job

    yield {
      jobCount,
      jobsCompleted,
      stage: { name: 'attachments', handling: id, subStage: 'setup' },
    }

    try {
      const data = await attachment.getData()
      const file = await loadFile(data, id)
      yield {
        jobCount,
        jobsCompleted: ++jobsCompleted,
        stage: { name: 'attachments', handling: id, subStage: 'upload' },
      }
      const upload = await uploadFile(workspace.teamId, file)
      attachmentSources.push([
        id,
        buildTeamFileUrl(workspace.teamId, upload.file.name),
      ])
    } catch (err) {
      if (
        retries > 9 ||
        (err.response instanceof Response && !isRetryable(err.response))
      ) {
        throw err
      } else {
        attachmentsQueue.push({ attachment, id, retries: retries + 1 })
      }
    }
  }

  const notesQueue = notes.map(([, note]) => ({
    note,
    retries: 0,
  }))

  while (notesQueue.length > 0) {
    const job = notesQueue.shift()
    if (job == null) break
    const { note, retries } = job

    yield {
      jobCount,
      jobsCompleted,
      stage: {
        name: 'document',
        handling: getNotePath(note),
      },
    }

    try {
      const content = replaceAttachments(note.content, attachmentSources)
      await createDocREST({
        workspaceId: workspace.id,
        teamId: workspace.teamId,
        content,
        title: note.title,
        tags: note.tags,
        path: note.folderPathname,
        generated: true,
        events: true,
      })

      yield {
        jobCount,
        jobsCompleted: ++jobsCompleted,
        stage: {
          name: 'document',
          handling: getNotePath(note),
        },
      }
    } catch (err) {
      if (
        retries > 9 ||
        (err.response instanceof Response && !isRetryable(err.response))
      ) {
        throw err
      } else {
        notesQueue.push({ note, retries: retries + 1 })
      }
    }
  }

  return { jobCount, jobsCompleted, stage: { name: 'complete' as const } }
}

function getNotePath(note: NoteDoc): string {
  const path = note.folderPathname === '/' ? '' : note.folderPathname
  const name = note.title === '' ? 'Untitled' : note.title
  return `${path}/${name}`
}

function getPromoCode(teamId: string) {
  return getPromo(teamId, 'migration')
    .then((code) => code.code)
    .catch(() => undefined)
}

function isRetryable(response: Response) {
  return (
    response.status === 408 || response.status < 400 || 499 < response.status
  )
}

async function loadFile(data: AttachmentData, name: string) {
  switch (data.type) {
    case 'blob':
      return new File([data.blob], name)
    case 'src': {
      return fetch(data.src)
        .then((r) => r.blob())
        .then((blob) => new File([blob], name))
    }
  }
}

function replaceAttachments(content: string, sources: [string, string][]) {
  return sources.reduce((content, [local, cloud]) => {
    return content.replace(`](${local})`, `](${cloud})`)
  }, content)
}

function tupleExists<U, T>(val: [U, T | undefined]): val is [U, T] {
  return exists(val[1])
}

function exists<T>(val: T | undefined): val is T {
  return val != null
}

function apply<T, U>(...args: T[]) {
  return (fn: (...args: T[]) => U) => fn(...args)
}
