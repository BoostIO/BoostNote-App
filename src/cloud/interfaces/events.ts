interface Event<T extends string, U> {
  id: string
  type: T
  time: string
  data: U
}

interface DocEventData {
  id: string
  emoji?: string | null
  title: string
  content: string
  teamId: string
  parentFolderId?: string
  folderPathname: string
  updatedAt: string
  createdAt: string
  pathname: string
  workspaceId: string
  version: number
}

export type DocCreateEvent = Event<
  'doc.create',
  DocEventData & { creator?: string }
>
export type DocUpdateEvent = Event<
  'doc.update',
  DocEventData & { editors: string[] }
>

export type HookEvent = DocCreateEvent | DocUpdateEvent

export type HookEventType = HookEvent['type']
