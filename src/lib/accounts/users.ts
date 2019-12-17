import { usePreferences } from '../preferences'
import { CloudStorage } from './api/storage'
import { Subscription } from './api/subscription'

export interface User {
  token: string
  name: string
  id: number
}

export interface UserCloudInfo {
  storages: CloudStorage[]
  subscription: Subscription | undefined
  usage: number
}

interface UserRepo {
  removeUser: (user: User) => void
  setUser: (user: User) => void
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
    setUser: user => setUsers([user])
  }

  return [users, repo]
}

const removeUser = (user: User, users: User[]) => {
  return users.filter(u => u.id !== user.id)
}
