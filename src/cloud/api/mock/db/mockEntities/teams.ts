import { SerializedTeam } from '../../../../interfaces/db/team'
import { generateMockId, getCurrentTime, MockDbMap } from '../utils'

type MockTeam = Omit<SerializedTeam, 'permissions'>

const teamMap = new MockDbMap<MockTeam>('mock:teamMap')
const teamDomainMap = new MockDbMap<string>('mock:teamDomainMap')

export function resetMockTeams() {
  teamMap.reset()
  teamDomainMap.reset()
}

interface CreateMockTeamParams {
  name?: string
  domain?: string
}

export function createMockTeam({
  name,
  domain,
}: CreateMockTeamParams): MockTeam {
  const id = generateMockId()
  if (name == null) {
    name = id
  }
  if (domain == null) {
    domain = id
  }
  const now = getCurrentTime()
  const newTeam = {
    id,
    domain,
    name,
    version: 1,
    trial: false,
    creationsCounter: 0,
    state: {},
    createdAt: now,
    updatedAt: now,
  }
  teamMap.set(id, newTeam)
  teamDomainMap.set(domain, id)

  return newTeam
}

export function getMockTeamById(id: string) {
  return teamMap.get(id)
}

export function getMockTeamByDomain(domain: string) {
  const teamId = teamDomainMap.get(domain)
  if (teamId == null) {
    return undefined
  }
  return teamMap.get(teamId)
}
