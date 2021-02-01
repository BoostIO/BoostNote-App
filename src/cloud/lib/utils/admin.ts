export function getAdminAnalyticsStatsPropertyFromIndex(index: number) {
  switch (index) {
    case 0:
      return 'newUsers'
    case 1:
      return 'deletedUsers'
    case 2:
      return 'newTeams'
    case 3:
      return 'deletedTeams'
    case 4:
      return 'newTeamInvites'
    case 5:
      return 'deletedTeamInvites'
    case 6:
      return 'newSubs'
    case 7:
      return 'deletedSubs'
    case 8:
      return 'newDocs'
    case 9:
      return 'deletedDocs'
    case 10:
      return 'newFolders'
    case 11:
      return 'deletedFolders'
    default:
      return 'misc'
  }
}
