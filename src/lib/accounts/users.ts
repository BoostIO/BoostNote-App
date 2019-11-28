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

const cache: { [key: number]: UserCloudInfo } = {}
export const useUserCloudInfo = (
  user: User
): [UserCloudInfo, () => void, boolean] => {
  const [info, setInfo] = useState<UserCloudInfo>(() => {
    return cache[user.id] != undefined
      ? cache[user.id]
      : { storages: [] as CloudStorage[], usage: 1, subscription: undefined }
  })
  const [forceFlag, setForceFlag] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let subscribed = true
    setRunning(true)
    getUserCloudInfo(user).then(info => {
      cache[user.id] = info
      setRunning(false)
      if (subscribed) {
        setInfo(info)
      }
    })
    return () => {
      subscribed = false
    }
  }, [user, forceFlag])

  return [info, () => setForceFlag(!forceFlag), running]
}

const getUserCloudInfo = async (user: User): Promise<UserCloudInfo> => {
  const [storages, subscription] = await Promise.all([
    getStorages(user),
    getSubscription(user)
  ])

  return {
    storages,
    subscription,
    usage: storages.reduce((sum, storage) => sum + storage.size, 0)
  }
}

const removeUser = (user: User, users: User[]) => {
  return users.filter(u => u.id !== user.id)
}
