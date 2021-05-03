import React, { useCallback } from 'react'
import cc from 'classcat'
import SettingTabButton from '../../shared/components/organisms/Settings/atoms/SettingTabButton'

interface TabButtonProps {
  label: string
  tab: string
  active: boolean
  setTab: (tab: string) => void
}

const TabButton = ({ label, tab, setTab, active }: TabButtonProps) => {
  const selectTab = useCallback(() => {
    setTab(tab)
  }, [tab, setTab])
  return (
    <SettingTabButton onClick={selectTab} className={cc([active && 'active'])}>
      <div className='label'>{label}</div>
    </SettingTabButton>
  )
}

export default TabButton
