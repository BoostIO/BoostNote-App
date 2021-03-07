import { NoteStorage, AttachmentData } from './db/types'
import { SerializedWorkspace } from '../cloud/interfaces/db/workspace'
import { uploadFile, buildTeamFileUrl } from '../cloud/api/teams/files'
import { createDocREST } from '../cloud/api/rest/doc'
import { registerPromo } from '../cloud/api/teams/subscription'

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

  for (const [id, attachment] of attachments) {
    yield {
      jobCount,
      jobsCompleted,
      stage: { name: 'attachments', handling: id, subStage: 'setup' },
    }
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
  }

  for (const [, note] of notes) {
    yield {
      jobCount,
      jobsCompleted: ++jobsCompleted,
      stage: {
        name: 'document',
        handling: `${note.folderPathname}/${note.title}`,
      },
    }
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
  }
  return { jobCount, jobsCompleted, stage: { name: 'complete' as const } }
}

function getPromoCode(teamId: string) {
  return registerPromo(teamId, 'migration')
    .then((code) => (code.active ? code.code : undefined))
    .catch(() => undefined)
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
