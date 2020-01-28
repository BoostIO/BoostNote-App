import React from 'react'
import TopBarButton from './TopBarButton'
import Icon from './Icon'
import { mdiDotsVertical } from '@mdi/js'
import { useGeneralStatus } from '../../lib/generalStatus'

const TopBarToggleNavButton = () => {
  const { toggleNav } = useGeneralStatus()
  return (
    <TopBarButton onClick={toggleNav}>
      <Icon path={mdiDotsVertical} />
    </TopBarButton>
  )
}

export default TopBarToggleNavButton
