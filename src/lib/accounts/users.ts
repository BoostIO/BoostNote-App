import { usePreferences } from '../preferences'

export interface User {
  token: string
  name: string
  id: number
}

interface UserRepo {
  removeUser: (user: User) => void
  addUser: (user: User) => void
  setActiveUser: (user: User) => void
  getActiveUser: () => User | undefined
}

export const useUsers = (): [User[], UserRepo] => {
  const { preferences, setPreferences } = usePreferences()
  const users = preferences['general.accounts']

  const setUsers = (users: User[]) => {
    setPreferences({
      'general.accounts': users
    })
  }

  const repo: UserRepo = {
    removeUser: user => setUsers(removeUser(user, users)),
    addUser: user => setUsers(addUser(user, users)),
    setActiveUser: (user: User) => setUsers(setActiveUser(user, users)),
    getActiveUser: () => users[0]
  }

  return [users, repo]
}

const removeUser = (user: User, users: User[]) => {
  return users.filter(u => u.id !== user.id)
}

const addUser = (user: User, _users: User[]) => {
  return [user]
}

const setActiveUser = (user: User, users: User[]) => {
  return users.sort((a, b) => {
    return a.id === user.id ? -1 : b.id === user.id ? 1 : 0
  })
}
