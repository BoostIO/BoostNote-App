import React, { useCallback } from 'react'
import { SettingsTab, useSettings } from '../../../lib/stores/settings'
import cc from 'classcat'
import SettingTabButton from '../../../../shared/components/organisms/Settings/atoms/SettingTabButton'

interface SettingSidenavItemProps {
  label: string
  active: boolean
  tab: SettingsTab
  id?: string
}

const SettingSidenavItem = ({
  label,
  tab,
  active,
  id,
}: SettingSidenavItemProps) => {
  const { openSettingsTab } = useSettings()
  const onClickHandler = useCallback(() => {
    openSettingsTab(tab)
  }, [openSettingsTab, tab])

  return (
    <SettingTabButton
      onClick={onClickHandler}
      className={cc([active && 'active'])}
      id={id}
    >
      {label}
    </SettingTabButton>
  )
}

export default SettingSidenavItem
