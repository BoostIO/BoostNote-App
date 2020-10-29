import React, { useMemo, useCallback } from 'react'
import styled from '../../lib/styled'
import {
  borderRight,
  border,
  secondaryButtonStyle,
} from '../../lib/styled/styleFunctions'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import Icon from '../atoms/Icon'
import { mdiPlus } from '@mdi/js'
import { useRouter } from '../../lib/router'
import { useActiveStorageId } from '../../lib/routeParams'
import AppNavigatorStorageItem from '../molecules/StorageNavigatorItem'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { usePreferences } from '../../lib/preferences'
import { openContextMenu } from '../../lib/electronOnly'

const TopLevelNavigator = () => {
  const { storageMap } = useDb()
  const { push } = useRouter()
  const { setPreferences } = usePreferences()

  const activeStorageId = useActiveStorageId()

  const storages = useMemo(() => {
    return entries(storageMap).map(([storageId, storage]) => {
      const active = activeStorageId === storageId
      return (
        <AppNavigatorStorageItem
          key={storageId}
          active={active}
          storage={storage}
        />
      )
    })
  }, [storageMap, activeStorageId])

  const goToStorageCreatePage = useCallback(() => {
    push(`/app/storages`)
  }, [push])

  const { createStorage } = useDb()
  const { prompt } = useDialog()

  const openSideNavContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      openContextMenu({
        menuItems: [
          {
            type: 'normal',
            label: 'New Storage',
            click: async () => {
              prompt({
                title: 'Create a Storage',
                message: 'Enter name of a storage to create',
                iconType: DialogIconTypes.Question,
                submitButtonLabel: 'Create Storage',
                onClose: async (value: string | null) => {
                  if (value == null) return
                  const storage = await createStorage(value)
                  push(`/app/storages/${storage.id}/notes`)
                },
              })
            },
          },
          {
            type: 'separator',
          },
          {
            type: 'normal',
            label: 'Hide App Navigator',
            click: () => {
              setPreferences({
                'general.showAppNavigator': false,
              })
            },
          },
        ],
      })
    },
    [prompt, createStorage, push, setPreferences]
  )

  return (
    <Container>
      <ListContainer onContextMenu={openSideNavContextMenu}>
        {storages}
      </ListContainer>
      <ControlContainer>
        <NavigatorButton onClick={goToStorageCreatePage}>
          <Icon path={mdiPlus} />
        </NavigatorButton>
      </ControlContainer>
    </Container>
  )
}

export default TopLevelNavigator

const Container = styled.div`
  width: 68px;
  height: 100%;
  ${borderRight}
  display: flex;
  flex-direction: column;
`

const ListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  margin-top: 20px;
`

const ControlContainer = styled.div`
  display: flex;
  justify-content: center;
`

const NavigatorButton = styled.button`
  ${secondaryButtonStyle}
  height: 50px;
  width: 50px;
  ${border}
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  border-radius: 5px;
  &:first-child {
    margin-top: 5px;
  }
`
