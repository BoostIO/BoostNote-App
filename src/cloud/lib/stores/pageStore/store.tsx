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
import { useCommittedRef, useRefCallback } from '../../hooks'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedUser } from '../../../interfaces/db/user'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { freePlanDocLimit } from '../../subscription'
import { SubscriptionInfo } from './types'
import { getFormattedDateFromUnixTimestamp } from '../../date'
import { SerializedGuest } from '../../../interfaces/db/guest'
import { getMapFromEntityArray } from '../../utils/array'
import { useGlobalData } from '../globalData'

interface PageStoreProps {
  pageProps: any
}

function usePageDataStore(pageProps: any) {
  const [pageData, setPageData] = useState(pageProps)
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const pageDataRef = useCommittedRef(pageData)
  const [guestsMap, setGuestsMap] = useState<Map<string, SerializedGuest>>(
    new Map()
  )

  useEffect(() => {
    setPageData(pageProps)
    setGuestsMap(
      getMapFromEntityArray((pageProps.guests as SerializedGuest[]) || [])
    )
  }, [pageProps])

  const [setPartialPageData, setPartialPageDataRef] = useRefCallback(
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

  const updateGuestsMap = useCallback(
    (...mappedGuests: [string, SerializedGuest][]) =>
      setGuestsMap((prevMap) => {
        return new Map([...prevMap, ...mappedGuests])
      }),
    []
  )

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
    let label = ''
    let progressLabel = ''
    let rate = 0
    let overLimit = false
    const linkLabel = 'Subscribe'

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
    const docCount = team.creationsCounter
    const trialIsOver = !team.trial
    overLimit = docCount >= freePlanDocLimit
    rate = docCount === 0 ? 0 : Math.ceil((docCount / freePlanDocLimit) * 100)
    progressLabel = `${docCount}/${freePlanDocLimit}`
    label = `Under the free plan, you can create up to ${freePlanDocLimit} docs.`

    return {
      trialing: false,
      info: {
        label,
        trialIsOver,
        progressLabel,
        rate,
        overLimit,
        linkLabel,
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
    guestsMap,
    setGuestsMap,
    updateGuestsMap,
    currentUserPermissions,
  }
}

function createPageStoreContext(
  storeCreator: (pageProps: any) => PageDataContext<any>,
  storeName?: string
) {
  const reloadContext = createContext<null | any>(null)

  const StoreProvider = ({
    children,
    pageProps,
  }: PropsWithChildren<PageStoreProps>) => (
    <reloadContext.Provider value={storeCreator(pageProps)}>
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

export const {
  StoreProvider: PageDataProvider,
  useStore: usePage,
} = createPageStoreContext(usePageDataStore, 'pageData')
