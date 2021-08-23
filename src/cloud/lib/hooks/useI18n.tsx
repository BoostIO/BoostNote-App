import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StatusFilter } from '../../components/ThreadStatusFilterControl'
import { TeamPermissionType } from '../../interfaces/db/userTeamPermissions'
import { lngKeys } from '../i18n/types'

export function useI18n() {
  const { t } = useTranslation()

  const getRoleLabel = useCallback(
    (role: TeamPermissionType) => {
      return role === 'admin'
        ? t(lngKeys.GeneralAdmin)
        : role === 'member'
        ? t(lngKeys.GeneralMember)
        : role === 'viewer'
        ? t(lngKeys.GeneralViewer)
        : 'Unknown'
    },
    [t]
  )

  const getThreadStatusLabel = useCallback(
    (status: StatusFilter) => {
      switch (status) {
        case 'all':
          return t(lngKeys.GeneralAll)
        case 'open':
          return t(lngKeys.ThreadOpen)
        case 'closed':
          return t(lngKeys.ThreadClosed)
        case 'outdated':
          return t(lngKeys.ThreadOutdated)
        default:
          return 'uknown'
      }
    },
    [t]
  )

  return {
    translate: t,
    getRoleLabel,
    getThreadStatusLabel,
  }
}
