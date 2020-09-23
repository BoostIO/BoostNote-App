import React, { useMemo, useCallback, useEffect, useRef } from 'react'
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
import { useRouter, useActiveStorageId } from '../../lib/router'
import AppNavigatorStorageItem from '../molecules/AppNavigatorStorageItem'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { useDialog, DialogIconTypes } from '../../lib/dialog'

const Container = styled.div`
  width: 50px;
  height: 100%;
  ${borderRight}
  display: flex;
  flex-direction: column;
`

const StoragesContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-items: center;
  align-items: center;
`

const ControlContainer = styled.div`
  display: flex;
  justify-content: center;
`

const NavigatorButton = styled.button`
  ${secondaryButtonStyle}
  height: 40px;
  width: 40px;
  ${border}
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:first-child {
    margin-top: 5px;
  }
`

const StorageNavigator = () => {
  const { storageMap } = useDb()
  const { push, pathname } = useRouter()
  const previousStorageIdRef = useRef<string>()

  const activeStorageId = useActiveStorageId()

  const lastStoragePathnameMapRef = useRef<Map<string, string>>(new Map())
  useEffect(() => {
    previousStorageIdRef.current =
      activeStorageId != null ? activeStorageId : undefined
    if (previousStorageIdRef.current != null) {
      lastStoragePathnameMapRef.current.set(
        previousStorageIdRef.current,
        pathname
      )
    }
  }, [activeStorageId, pathname])

  const storages = useMemo(() => {
    return entries(storageMap).map(([storageId, storage]) => {
      const active = activeStorageId === storageId
      const href =
        !active && lastStoragePathnameMapRef.current.has(storageId)
          ? lastStoragePathnameMapRef.current.get(storageId)
          : `/app/storages/${storageId}/notes`
      return (
        <AppNavigatorStorageItem
          key={storageId}
          href={href}
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
  const { popup } = useContextMenu()
  const { prompt } = useDialog()

  const openSideNavContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'New Storage',
          onClick: async () => {
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
      ])
    },
    [popup, prompt, createStorage, push]
  )

  return (
    <Container>
      <StoragesContainer onContextMenu={openSideNavContextMenu}>
        {storages}
      </StoragesContainer>
      <ControlContainer>
        <NavigatorButton onClick={goToStorageCreatePage}>
          <Icon path={mdiPlus} />
        </NavigatorButton>
      </ControlContainer>
    </Container>
  )
}

export default StorageNavigator
