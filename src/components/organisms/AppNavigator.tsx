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
import { NoteStorage } from '../../lib/db/types'

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

const ControlContainer = styled.div``

const NaviagtorItemContainer = styled.button`
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

interface AppNavigatorItemProps {
  active: boolean
  storage: NoteStorage
  href?: string
}

const AppNavigatorItem = ({ active, storage, href }: AppNavigatorItemProps) => {
  const { push } = useRouter()

  const goToStorage = useCallback(() => {
    if (href == null) {
      return
    }
    push(href)
  }, [push, href])

  return (
    <NaviagtorItemContainer
      className={active ? 'active' : ''}
      title={storage.name}
      onClick={goToStorage}
    >
      {storage.name.slice(0, 1)}
    </NaviagtorItemContainer>
  )
}

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
        <AppNavigatorItem
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

  return (
    <Container>
      <StoragesContainer>{storages}</StoragesContainer>
      <ControlContainer>
        <NaviagtorItemContainer onClick={goToStorageCreatePage}>
          <Icon path={mdiPlus} />
        </NaviagtorItemContainer>
      </ControlContainer>
    </Container>
  )
}

export default StorageNavigator
