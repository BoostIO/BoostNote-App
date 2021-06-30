export interface SerializedServiceConnection {
  id: string
  service: string
  token: string
  identifier: string
}

export interface SerializedTeamIntegration {
  id: string
  service: string
  name: string
  identifier: string
  teamId: string
}
