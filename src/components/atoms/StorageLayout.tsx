import React, { useCallback } from 'react'
import TwoPaneLayout from './TwoPaneLayout'
import { useGeneralStatus } from '../../lib/generalStatus'
import NoteStorageNavigator from '../organisms/NoteStorageNavigator'
import { NoteStorage } from '../../lib/db/types'

interface StorageLayoutProps {
  storage: NoteStorage
  children: React.ReactNode
}

const StorageLayout = ({ storage, children }: StorageLayoutProps) => {
  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const updateNavWidth = useCallback(
    (leftWidth: number) => {
      setGeneralStatus({
        sideBarWidth: leftWidth,
      })
    },
    [setGeneralStatus]
  )

  return (
    <TwoPaneLayout
      defaultLeftWidth={generalStatus.sideBarWidth}
      left={<NoteStorageNavigator storage={storage} />}
      right={children}
      onResizeEnd={updateNavWidth}
    />
  )
}

export default StorageLayout
