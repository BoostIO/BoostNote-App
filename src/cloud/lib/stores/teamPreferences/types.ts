export type TeamPreferencesType = 'hide-onboarding-invite'
export type TeamPreferencesContent = {
  [type in TeamPreferencesType]?: boolean
}
export type LocallyStoredTeamPreferences = {
  [teamId: string]: TeamPreferencesContent
}

export interface TeamPreferencesContext {
  teamPreferences: TeamPreferencesContent
  setToLocalStorage: (teamId: string, content: TeamPreferencesContent) => void
  toggleItem: (type: TeamPreferencesType) => void
}
