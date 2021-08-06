import React, { useMemo, useCallback } from 'react'
import { usePreferences } from '../../lib/preferences'
import { useGlobalKeyDownHandler } from '../../lib/keyboard'
import { mdiClose } from '@mdi/js'
import { useDb } from '../../lib/db'
import { useRouteParams } from '../../lib/routeParams'
import MigrationTab from './MigrationTab'
import styled from '../../shared/lib/styled'
import {
  border,
  backgroundColor,
  borderBottom,
  borderLeft,
  closeIconColor,
  flexCenter,
} from '../../shared/lib/styled/styleFunctions'
import Icon from '../../shared/components/atoms/Icon'

const FullScreenContainer = styled.div`
  z-index: 7000;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const BackgroundShadow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  ${border}
`

const ContentContainer = styled.div`
  z-index: 7001;
  position: absolute;
  top: 0;
  left: 0px;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  ${backgroundColor}
  ${border}
`

const ModalHeader = styled.div`
  height: 40px;
  ${borderBottom};
  display: flex;
`

const ModalTitle = styled.h1`
  margin: 0;
  line-height: 40px;
  font-size: 1em;
  font-weight: bold;
  padding: 0 10px;
  flex: 1;
  display: flex;
  align-items: center;
`

const ModalBody = styled.div`
  display: flex;
  overflow: hidden;
  height: 100%;
`

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1em;
  ${borderLeft}
`

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: none;
  font-size: 24px;
  ${flexCenter}
  ${closeIconColor}
`

const PreferencesModal = () => {
  const { closed, togglePreferencesModal, tab } = usePreferences()
  const { storageMap } = useDb()
  const routeParams = useRouteParams()

  const currentStorage = useMemo(() => {
    let storageId: string
    switch (routeParams.name) {
      case 'local':
        storageId = routeParams.workspaceId
        break
      default:
        return null
    }
    const storage = storageMap[storageId]
    return storage != null ? storage : null
  }, [storageMap, routeParams])

  const keydownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!closed && event.key === 'Escape') {
        togglePreferencesModal()
      }
    },
    [closed, togglePreferencesModal]
  )
  useGlobalKeyDownHandler(keydownHandler)

  const content = useMemo(() => {
    switch (tab) {
      case 'migration':
        if (currentStorage != null) {
          return <MigrationTab storage={currentStorage} />
        }
        break
    }
    return null
  }, [tab, currentStorage])

  if (closed) {
    return null
  }

  return (
    <FullScreenContainer>
      <ContentContainer>
        <ModalHeader>
          <ModalTitle>Migrate to Cloud Space</ModalTitle>
          <CloseButton onClick={togglePreferencesModal}>
            <Icon path={mdiClose} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <TabContent>{content}</TabContent>
        </ModalBody>
      </ContentContainer>
      <BackgroundShadow onClick={togglePreferencesModal} />
    </FullScreenContainer>
  )
}

export default PreferencesModal
