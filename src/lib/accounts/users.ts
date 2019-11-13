import { useState, useEffect } from 'react'
import { createStoreContext } from '../utils/context'
import { localLiteStorage } from 'ltstrg'

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

const useUsersStore = (): [User[], UserRepo] => {
  const [users, setUsers] = useState(getUsers)

  useEffect(() => {
    localLiteStorage.setItem('users', JSON.stringify(users))
  }, [users])

  const repo: UserRepo = {
    removeUser: user => setUsers(removeUser(user, users)),
    addUser: user => setUsers(addUser(user, users)),
    setActiveUser: (user: User) => setUsers(setActiveUser(user, users)),
    getActiveUser: () => users[0]
  }

  return [users, repo]
}

const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]')
}

const removeUser = (user: User, users: User[]) => {
  return users.filter(u => u.id !== user.id)
}

const addUser = (user: User, users: User[]) => {
  return [...removeUser(user, users), user]
}

const setActiveUser = (user: User, users: User[]) => {
  return users.sort((a, b) => {
    return a.id === user.id ? -1 : b.id === user.id ? 1 : 0
  })
}

export const {
  StoreProvider: UserProvider,
  useStore: useUsers
} = createStoreContext(useUsersStore)
