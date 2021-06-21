import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { TeamPermissionType } from '../../interfaces/db/userTeamPermissions'
import { lngKeys } from '../i18n/types'

export function useI18n() {
  const { t } = useTranslation()

  const getRoleLabel = useCallback(
    (role: TeamPermissionType) => {
      return role === 'admin'
        ? t(lngKeys.Admin)
        : role === 'member'
        ? t(lngKeys.Member)
        : role === 'viewer'
        ? t(lngKeys.Viewer)
        : 'Unknown'
    },
    [t]
  )

  return {
    t,
    getRoleLabel,
  }
}
