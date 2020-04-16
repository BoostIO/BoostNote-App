import React from 'react'
import TopBarButton from './TopBarButton'
import Icon from '../../../components/atoms/Icon'
import { mdiMenu } from '@mdi/js'
import { useGeneralStatus } from '../../lib/generalStatus'

const TopBarToggleNavButton = () => {
  const { toggleNav } = useGeneralStatus()
  return (
    <TopBarButton onClick={toggleNav}>
      <Icon path={mdiMenu} />
    </TopBarButton>
  )
}

export default TopBarToggleNavButton
