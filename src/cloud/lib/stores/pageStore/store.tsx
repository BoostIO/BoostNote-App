import React, {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { PageDataContext, PageDataProps } from './types'
import { useCommittedRef, useRefEffect } from '../../hooks'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedUser } from '../../../interfaces/db/user'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { SubscriptionInfo } from './types'
import { getFormattedDateFromUnixTimestamp } from '../../date'
import { useGlobalData } from '../globalData'
import { remainingTrialInfo } from '../../subscription'

interface PageStoreProps {
  pageProps: any
  navigatingBetweenPage: boolean
}

function usePageDataStore(pageProps: any, navigatingBetweenPage: boolean) {
  const [pageData, setPageData] = useState(pageProps || {})
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const pageDataRef = useCommittedRef(pageData)

  useEffect(() => {
    setPageData((old: any) => {
      if (pageProps.merge !== true) {
        return pageProps
      }

      if (
        pageProps.pageDoc != null ||
        pageProps.pageFolder != null ||
        pageProps.pageWorkspace != null
      ) {
        return {
          ...old,
          pageDoc: undefined,
          pageFolder: undefined,
          pageWorkspace: undefined,
          ...pageProps,
        }
      }

      return { ...old, ...pageProps }
    })
  }, [pageProps])

  const setPartialPageData = useCallback(
    (val: any) => {
      setPageData((prevState: any) => {
        return Object.assign(
          {},
          prevState,
          val instanceof Function ? val(prevState) : val
        )
      })
    },
    [setPageData]
  )
  const setPartialPageDataRef = useRefEffect(setPartialPageData)

  const team: undefined | SerializedTeam = pageData.team
  const permissions: undefined | SerializedUserTeamPermissions[] =
    pageData.permissions
  const subscription: undefined | SerializedSubscription = pageData.subscription

  const currentUserPermissions = useMemo(() => {
    if (
      currentUser == null ||
      permissions == null ||
      permissions.length === 0
    ) {
      return undefined
    }

    return permissions.find((p) => p.userId === currentUser.id)
  }, [currentUser, permissions])

  const currentUserIsCoreMember = useMemo(() => {
    return (
      currentUserPermissions != null && currentUserPermissions.role !== 'viewer'
    )
  }, [currentUserPermissions])

  const updateTeamSubscription = useCallback(
    (sub?: Partial<SerializedSubscription>) => {
      if (sub == null) {
        setPartialPageData({
          subscription: undefined,
        })
      } else {
        setPartialPageData(({ subscription }: PageDataProps) => {
          return {
            subscription: {
              ...subscription,
              ...sub,
            },
          }
        })
      }
    },
    [setPartialPageData]
  )

  const removeUserInPermissions = useCallback(
    (userId: string) => {
      setPartialPageData(({ permissions = [] }: PageDataProps) => {
        return {
          permissions: permissions.filter(
            (permission) => permission.user.id !== userId
          ),
        }
      })
    },
    [setPartialPageData]
  )

  const updateUserInPermissions = useCallback(
    (updatedUser: Partial<SerializedUser>) => {
      setPartialPageData(({ permissions = [] }: PageDataProps) => {
        return {
          permissions: permissions.map((permission) => {
            return permission.user.id === updatedUser.id
              ? {
                  ...permission,
                  user: {
                    ...permission.user,
                    displayName: updatedUser.displayName,
                  },
                }
              : permission
          }),
        }
      })
    },
    [setPartialPageData]
  )

  const updateSinglePermission = useCallback(
    (updated: Partial<SerializedUserTeamPermissions>) => {
      if (updated.id == null) {
        return
      }

      setPartialPageData(({ permissions = [] }: PageDataProps) => {
        const originalPermissions = permissions.find((p) => p.id === updated.id)

        if (originalPermissions == null) {
          return {
            permissions: [...permissions, updated],
          }
        }

        return {
          permissions: permissions.map((permission) => {
            return permission.id === updated.id
              ? {
                  ...permission,
                  ...updated,
                }
              : permission
          }),
        }
      })
    },
    [setPartialPageData]
  )

  const removeSinglePermission = useCallback(
    (permissionId: string) => {
      setPartialPageData(({ permissions = [] }: PageDataProps) => {
        return {
          permissions: permissions.filter(
            (permission) => permission.id !== permissionId
          ),
        }
      })
    },
    [setPartialPageData]
  )

  const currentSubInfo: SubscriptionInfo | undefined = useMemo(() => {
    if (team == null) {
      return undefined
    }

    if (subscription != null) {
      if (subscription.status !== 'trialing') {
        return undefined
      }

      return {
        trialing: true,
        info: {
          formattedEndDate: getFormattedDateFromUnixTimestamp(
            subscription.trialEnd
          ),
        },
      }
    }

    const { remaining, max, end } = remainingTrialInfo(team)
    return {
      trialing: false,
      info: {
        cancelled: !team.trial,
        trialIsOver: remaining < 1,
        progressLabel: `${max - remaining}/${max}`,
        endDate: end,
        rate: ((max - remaining) / max) * 100,
      },
    }
  }, [subscription, team])

  return {
    pageData,
    pageDataRef,
    type: pageData.type,
    pageFolder: pageData.pageFolder,
    pageDoc: pageData.pageDoc,
    pageTag: pageData.pageTag,
    pageDashboard: pageData.dashboard,
    revisions: pageData.revisions,
    pageWorkspace: pageData.pageWorkspace,
    workspaces: pageData.workspaces,
    openInvite: pageData.openInvite,
    currentSubInfo,
    team,
    permissions,
    subscription,
    removeUserInPermissions,
    updateUserInPermissions,
    updateSinglePermission,
    removeSinglePermission,
    updateTeamSubscription,
    setPageData,
    setPartialPageData,
    setPartialPageDataRef,
    currentUserPermissions,
    currentUserIsCoreMember,
    navigatingBetweenPage,
  }
}

function createPageStoreContext(
  storeCreator: (
    pageProps: any,
    navigatingBetweenPage: boolean
  ) => PageDataContext<any>,
  storeName?: string
) {
  const reloadContext = createContext<null | any>(null)

  const StoreProvider = ({
    children,
    pageProps,
    navigatingBetweenPage,
  }: PropsWithChildren<PageStoreProps>) => (
    <reloadContext.Provider
      value={storeCreator(pageProps, navigatingBetweenPage)}
    >
      {children}
    </reloadContext.Provider>
  )

  function useStore<D>() {
    const store = useContext(reloadContext)
    if (store == null) {
      throw new Error(`You have forgotten to use ${storeName} provider.`)
    }
    return store as PageDataContext<D>
  }

  return {
    StoreProvider,
    useStore,
  }
}

export const { StoreProvider: PageDataProvider, useStore: usePage } =
  createPageStoreContext(usePageDataStore, 'pageData')
