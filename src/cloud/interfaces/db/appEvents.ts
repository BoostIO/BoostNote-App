import { SerializedWorkspace } from './workspace'

export type SseSingleResourceEventType =
  | 'archiveDoc'
  | 'unarchiveDoc'
  | 'contentUpdate'

export type SseEventType =
  | SseSingleResourceEventType
  | 'resourcesUpdate'
  | 'createDoc'
  | 'mentionCreated'
  | 'userUpdate'
  | 'userRemoval'
  | 'subscriptionCreate'
  | 'subscriptionUpdate'
  | 'permissionsCreate'
  | 'permissionsRemoval'
  | 'tagCreate'
  | 'tagRemoval'
  | 'workspaceCreate'
  | 'workspaceRemoval'
  | 'workspaceUpdate'
  | 'teamUpdate'
  | 'templateUpdate'
  | 'templateDelete'
  | 'guestUpdate'
  | 'guestRemoval'
  | 'commentThreadCreated'
  | 'commentThreadUpdated'
  | 'commentThreadDeleted'

export interface SerializableAppEventProps {
  id: string
  data: any
  teamId?: string
  userId?: string
  type: SseEventType
}

export interface SerializedUnserializableAppEventProps {
  createdAt: string
}

export type SerializedAppEvent = SerializedUnserializableAppEventProps &
  SerializableAppEventProps

export type ResourcesChangeAppEventAction =
  | 'resourceChange'
  | 'deleteFolder'
  | 'deleteDoc'

interface ResourcesChangeEvent {
  action: ResourcesChangeAppEventAction
  resourcesIds: string[]
  actorId?: string
}

interface UserRemovalEvent {
  action: 'userRemoval'
  data: { userId: string }
}

export type AppEventTypes = ResourcesChangeEvent | UserRemovalEvent

export interface WorkspaceChangeEventData {
  actorId?: string
  workspace: string | SerializedWorkspace
  added: string[]
  removed: string[]
}

export type ResourcesIdSortedByWorkspaceIds = {
  [workspaceId: string]: string[]
}

export interface ResourceUpdateEventOriginalResourcesData {
  actorId?: string
  resources: ResourcesIdSortedByWorkspaceIds
}

export const sseTimelineEvents = ['archiveDoc', 'unarchiveDoc', 'contentUpdate']
