import { SerializedUserTeamPermissions } from './userTeamPermissions'

export interface SerializableEditRequestProps {
  id: string
  userPermissionId: string
}

export interface SerializedUnserializableEditRequestProps {
  createdAt: string
  userPermission?: SerializedUserTeamPermissions
}

export type SerializedEditRequest = SerializedUnserializableEditRequestProps &
  SerializableEditRequestProps
