export type TeamStorage = {
  showTrialAlert?: boolean
  hideFreePlanLimitReachedAlert?: boolean
}
export type LocallyStoredTeamPreferences = {
  [teamId: string]: TeamStorage
}

export interface TeamStorageContext {
  teamPreferences: TeamStorage
  setToLocalStorage: (teamId: string, content: TeamStorage) => void
}
