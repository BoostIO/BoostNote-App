import { usePreferences } from '../preferences'
import { CloudStorage, getStorages } from './api/storage'
import { Subscription, getSubscription } from './api/subscription'
import { useState, useEffect } from 'react'

export interface User {
  token: string
  name: string
  id: number
}

export interface UserCloudInfo {
  storages: CloudStorage[]
  subscription: Subscription | undefined
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

const cache: { [key: number]: UserCloudInfo } = {}
export const useUserCloudInfo = (
  user: User
): ['loading' | UserCloudInfo, () => void] => {
  const [info, setInfo] = useState<'loading' | UserCloudInfo>(() => {
    return cache[user.id] != undefined ? cache[user.id] : 'loading'
  })
  const [forceFlag, setForceFlag] = useState(true)

  useEffect(() => {
    let isSubscribed = true
    getUserCloudInfo(user).then(info => {
      cache[user.id] = info
      if (isSubscribed) {
        setInfo(info)
      }
    })
    return () => {
      isSubscribed = false
    }
  }, [user, forceFlag])

  return [info, () => setForceFlag(!forceFlag)]
}

const getUserCloudInfo = (user: User): Promise<UserCloudInfo> => {
  return Promise.all([getStorages(user), getSubscription(user)]).then(
    ([storages, subscription]) => ({ storages, subscription })
  )
}

const removeUser = (user: User, users: User[]) => {
  return users.filter(u => u.id !== user.id)
}
