import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  CSSProperties,
  useMemo,
} from 'react'
import styled from '../../lib/styled'
import throttle from 'lodash.throttle'
import cc from 'classcat'
import { clamp } from 'ramda'
import { usePreferences } from '../../lib/stores/preferences'
import Sidebar from '../organisms/Sidebar'
import Divider from '../atoms/Divider'
import { usePage } from '../../lib/stores/pageStore'
import {
  useGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  isSingleKeyEvent,
} from '../../lib/keyboard'
import {
  isActiveElementAnInput,
  focusFirstChildFromElement,
  InputableDomElement,
} from '../../lib/dom'
import { useNav } from '../../lib/stores/nav'
import { SerializedAppEvent } from '../../interfaces/db/appEvents'
import { useEffectOnce, useNumber } from 'react-use'
import { useGlobalData } from '../../lib/stores/globalData'
import { SerializedUserTeamPermissions } from '../../interfaces/db/userTeamPermissions'
import { useModal } from '../../lib/stores/modal'
import { useSettings } from '../../lib/stores/settings'
import { shortcuts, isFocusRightSideShortcut } from '../../lib/shortcuts'
import CreateFolderModal from '../organisms/Modal/contents/Folder/CreateFolderModal'
import { SerializedTag } from '../../interfaces/db/tag'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { getResources } from '../../api/teams/resources'
import { getMapFromEntityArray } from '../../lib/utils/array'
import { useSearch } from '../../lib/stores/search'
import RightLayoutWithTopBar, {
  RightLayoutWithTopBarProps,
} from './RightLayoutWithTopBar'
import { rightSideTopBarHeight } from '../organisms/RightSideTopBar/styled'
import AnnouncementAlert from '../atoms/AnnouncementAlert'
import { SerializedTeam } from '../../interfaces/db/team'
import { getTemplate } from '../../api/teams/docs/templates'
import {
  newFolderEventEmitter,
  searchEventEmitter,
} from '../../lib/utils/events'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { getAccessToken, usingElectron } from '../../lib/stores/electron'
import { sseUrl } from '../../lib/consts'
import { SerializedGuest } from '../../interfaces/db/guest'
import { useRouter } from '../../lib/router'

interface AppLayoutProps {
  rightLayout: RightLayoutWithTopBarProps
  className?: string
  style?: CSSProperties
  maxLeftWidth?: number
}

const defaultReconnectionDelay = 500 // 5ms
const maxReconnectionDelay = 600000 // 10min

const AppLayout = ({
  rightLayout,
  className,
  style,
  children,
}: React.PropsWithChildren<AppLayoutProps>) => {
  const { preferences, setPreferences } = usePreferences()
  const [dragging, setDragging] = useState(false)
  const mouseupListenerIsSetRef = useRef(false)
  const dragStartXPositionRef = useRef(0)
  const {
    team,
    removeUserInPermissions,
    updateUserInPermissions,
    updateTeamSubscription,
    updateSinglePermission,
    removeSinglePermission,
    setPartialPageData,
    updateGuestsMap,
    setGuestsMap,
    currentUserPermissions,
  } = usePage()
  const eventSourceRef = useRef<EventSource | undefined>()
  const {
    eventSourceResourceUpdateHandler,
    removeFromTagsMap,
    updateTagsMap,
    currentParentFolderId,
    updateWorkspacesMap,
    removeFromWorkspacesMap,
    docsMap,
    foldersMap,
    removeFromDocsMap,
    removeFromFoldersMap,
    updateDocsMap,
    updateFoldersMap,
    updateTemplatesMap,
    removeFromTemplatesMap,
  } = useNav()
  const [eventSourceSetupCounter, { inc }] = useNumber(0)
  const reconnectionDelayRef = useRef<number>(defaultReconnectionDelay)
  const {
    setPartialGlobalData,
    globalDataRef,
    globalData: { currentUser, teams },
  } = useGlobalData()
  const { openModal, modalContent } = useModal()
  const { openSettingsTab, closed: settingsModalIsClosed } = useSettings()
  const rightSideContentRef = React.createRef<HTMLDivElement>()
  const [sidebarIsFocused, setSidebarIsFocused] = useState<boolean>(false)
  const { setShowGlobalSearch, showGlobalSearch } = useSearch()
  const { query } = useRouter()

  const leftWidth = useMemo(() => {
    return preferences.sideBarWidth
  }, [preferences.sideBarWidth])

  const sidebarIsHidden = useMemo(() => {
    return preferences.sidebarIsHidden
  }, [preferences.sidebarIsHidden])

  const previousLeftWidthRef = useRef(leftWidth)
  const startDragging = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      dragStartXPositionRef.current = event.clientX
      previousLeftWidthRef.current = leftWidth
      setDragging(true)
    },
    [leftWidth]
  )

  const endDragging = useCallback((event: MouseEvent) => {
    event.preventDefault()
    setDragging(false)
  }, [])

  const moveDragging = useCallback(
    throttle((event: MouseEvent) => {
      event.preventDefault()
      const diff = event.clientX - dragStartXPositionRef.current
      setPreferences({
        sideBarWidth: clamp(
          minLeftWidth,
          500,
          previousLeftWidthRef.current + diff
        ),
      })
    }, 1000 / 30),
    []
  )

  useEffectOnce(() => {
    if (query.settings === 'upgrade') {
      openSettingsTab('teamUpgrade')
    }
  })

  useEffect(() => {
    if (dragging && !mouseupListenerIsSetRef.current) {
      window.addEventListener('mouseup', endDragging)
      window.addEventListener('mousemove', moveDragging)
      mouseupListenerIsSetRef.current = true
      return
    }

    if (!dragging && mouseupListenerIsSetRef.current) {
      window.removeEventListener('mouseup', endDragging)
      window.removeEventListener('mousemove', moveDragging)
      mouseupListenerIsSetRef.current = false
      return
    }

    return () => {
      if (mouseupListenerIsSetRef.current) {
        window.removeEventListener('mouseup', endDragging)
        window.removeEventListener('mousemove', moveDragging)
      }
    }
  }, [dragging, endDragging, moveDragging])

  const onResizeEnd = useCallback(
    (leftWidth: number) => {
      setPreferences({
        sideBarWidth: leftWidth,
      })
    },
    [setPreferences]
  )

  const appOnMouseLeaveHandler = useCallback(() => {
    setPreferences({
      sidebarIsHovered: false,
    })
  }, [setPreferences])

  useEffect(() => {
    if (!dragging) {
      onResizeEnd(leftWidth)
    }
  }, [onResizeEnd, leftWidth, dragging])

  const openCreateFolderModal = useCallback(() => {
    openModal(<CreateFolderModal parentFolderId={currentParentFolderId} />)
  }, [openModal, currentParentFolderId])

  useEffect(() => {
    if (team == null || currentUserPermissions == null) {
      return
    }
    newFolderEventEmitter.listen(openCreateFolderModal)
    return () => {
      newFolderEventEmitter.unlisten(openCreateFolderModal)
    }
  }, [team, currentUserPermissions, openCreateFolderModal])

  useEffect(() => {
    const handler = () => {
      if (
        !settingsModalIsClosed ||
        modalContent != null ||
        currentUserPermissions == null
      ) {
        return
      }
      if (showGlobalSearch) {
        setShowGlobalSearch(false)
      } else {
        setShowGlobalSearch(true)
      }
    }
    searchEventEmitter.listen(handler)
    return () => {
      searchEventEmitter.unlisten(handler)
    }
  }, [
    currentUserPermissions,
    modalContent,
    settingsModalIsClosed,
    setShowGlobalSearch,
    showGlobalSearch,
  ])

  const overrideBrowserCtrlsHandler = useCallback(
    async (event: KeyboardEvent) => {
      if (team == null) {
        return
      }

      if (isSingleKeyEventOutsideOfInput(event, shortcuts.teamMembers)) {
        preventKeyboardEventPropagation(event)
        openSettingsTab('teamMembers')
      }

      if (isSingleKeyEvent(event, 'escape') && isActiveElementAnInput()) {
        if (isCodeMirorTextAreaEvent(event)) {
          return
        }
        preventKeyboardEventPropagation(event)
        ;(document.activeElement as InputableDomElement).blur()
      }

      if (isFocusRightSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(rightSideContentRef.current)
      }
    },
    [openSettingsTab, team, rightSideContentRef]
  )
  useGlobalKeyDownHandler(overrideBrowserCtrlsHandler)

  const teamId = team == null ? undefined : team.id
  const setupEventSource = useCallback(
    (url: string) => {
      if (eventSourceRef.current != null) {
        eventSourceRef.current.close()
      }
      console.log('setup event source', url)
      const accessToken = usingElectron ? getAccessToken() : null
      const newEventSource = new EventSourcePolyfill(url, {
        withCredentials: true,
        headers:
          accessToken != null
            ? {
                ['Authorization']: `Bearer ${accessToken}`,
              }
            : {},
      })
      newEventSource.onerror = () => {
        newEventSource.close()
        setTimeout(() => {
          setupEventSource(eventSourceRef.current!.url)
          reconnectionDelayRef.current = Math.min(
            defaultReconnectionDelay *
              ((reconnectionDelayRef.current / defaultReconnectionDelay) * 2),
            maxReconnectionDelay
          )
        }, reconnectionDelayRef.current)
      }
      eventSourceRef.current = newEventSource
      inc(1)
    },
    [inc]
  )

  useEffect(() => {
    if (teamId == null) {
      return
    }
    setupEventSource(`${sseUrl}/events/${teamId}`)
    return () => {
      try {
        eventSourceRef.current!.close()
      } catch (error) {}
    }
  }, [teamId, setupEventSource])

  const userRemovalEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      if (event.data.userId === null) {
        return
      }
      // global
      setPartialGlobalData({
        teams: globalDataRef.current.teams.map((team) => {
          return {
            ...team,
            permissions: (team.permissions as SerializedUserTeamPermissions[]).filter(
              (p) => p.user.id !== event.data.userId
            ),
          }
        }),
      })
      //page
      removeUserInPermissions(event.data.userId)
    },
    [setPartialGlobalData, globalDataRef, removeUserInPermissions]
  )

  const userUpdateEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      if (event.userId != null && event.data.displayName != null) {
        updateUserInPermissions({
          id: event.userId,
          displayName: event.data.displayName,
        })
      }
    },
    [updateUserInPermissions]
  )

  const guestChangeEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      const { guest } = event.data as { guest?: SerializedGuest | string }
      if (guest == null) {
        return
      }

      if (event.type === 'guestRemoval') {
        setGuestsMap((prevMap) => {
          const newMap = new Map(prevMap)
          newMap.delete(typeof guest === 'string' ? guest : guest!.id)
          return newMap
        })
        return
      }

      if (typeof guest === 'string') {
        return
      }

      updateGuestsMap([guest.id, guest])
      return
    },
    [setGuestsMap, updateGuestsMap]
  )

  const subscriptionChangeEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      if (event.data.subscription.status === 'inactive') {
        updateTeamSubscription(undefined)
      } else {
        updateTeamSubscription(event.data.subscription)
      }
    },
    [updateTeamSubscription]
  )

  const permissionsUpdateEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      if (event.data.userPermissions != null) {
        updateSinglePermission(event.data.userPermissions)
      }
    },
    [updateSinglePermission]
  )

  const permissionsRemoveEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      if (event.data.userPermissionsId != null) {
        removeSinglePermission(event.data.userPermissionsId)
      }
    },
    [removeSinglePermission]
  )

  const teamUpdateHandler = useCallback(
    (event: SerializedAppEvent) => {
      const eventTeam = event.data.team as Partial<SerializedTeam>
      if (eventTeam != null && team != null) {
        setPartialPageData({ team: { ...team, ...eventTeam } })
        const updatedTeams = teams.map((t) => {
          if (t.id === eventTeam.id) {
            return { ...t, ...eventTeam }
          }
          return t
        })
        setPartialGlobalData({ teams: updatedTeams })
      }
    },
    [setPartialGlobalData, setPartialPageData, teams, team]
  )

  const tagChangeEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      const tag = event.data.tag as SerializedTag
      if (event.type === 'tagCreate') {
        updateTagsMap([tag.id, tag])
        return
      }

      removeFromTagsMap(tag.id)
    },
    [removeFromTagsMap, updateTagsMap]
  )

  const workspaceChangeEventHandler = useCallback(
    async (event: SerializedAppEvent) => {
      if (event.type !== 'workspaceRemoval') {
        const workspace = event.data.workspace as SerializedWorkspace
        updateWorkspacesMap([workspace.id, workspace])
        const addedUsers = event.data.added as string[]
        if (currentUser != null && addedUsers.includes(currentUser.id)) {
          const { docs, folders, workspaces } = await getResources(
            event.teamId!,
            {
              resourcesIds: [],
              workspacesIds: [workspace.id],
            }
          )
          const changedWorkspaces = getMapFromEntityArray(workspaces)
          updateWorkspacesMap(...changedWorkspaces)
          const changedFolders = getMapFromEntityArray(folders)
          updateFoldersMap(...changedFolders)
          const changedDocs = getMapFromEntityArray(docs)
          updateDocsMap(...changedDocs)
        }
        return
      }

      if (typeof event.data.workspace !== 'string') {
        return
      }

      removeFromWorkspacesMap(event.data.workspace)
      removeFromDocsMap(
        ...[...docsMap.values()]
          .filter((doc) => doc.workspaceId === event.data.workspace)
          .map((doc) => doc.id)
      )
      removeFromFoldersMap(
        ...[...foldersMap.values()]
          .filter((folder) => folder.workspaceId === event.data.workspace)
          .map((folder) => folder.id)
      )
    },
    [
      removeFromWorkspacesMap,
      updateWorkspacesMap,
      docsMap,
      removeFromDocsMap,
      foldersMap,
      removeFromFoldersMap,
      currentUser,
      updateDocsMap,
      updateFoldersMap,
    ]
  )

  const templateChangeEventHandler = useCallback(
    async (event: SerializedAppEvent) => {
      if (event.type === 'templateDelete') {
        if (typeof event.data.template === 'string') {
          removeFromTemplatesMap(event.data.template)
        }
        return
      }

      try {
        if (typeof event.data.template === 'string') {
          const { template } = await getTemplate(event.data.template)
          updateTemplatesMap([template.id, template])
        } else {
          updateTemplatesMap([event.data.template.id, event.data.template])
        }
      } catch (error) {}
    },
    [removeFromTemplatesMap, updateTemplatesMap]
  )

  /// re-assign handler on change
  useEffect(() => {
    if (eventSourceRef.current != null && eventSourceSetupCounter > 0) {
      eventSourceRef.current.onopen = () =>
        (reconnectionDelayRef.current = defaultReconnectionDelay)
      eventSourceRef.current.onmessage = (eventData: MessageEvent) => {
        const event = JSON.parse(eventData.data) as SerializedAppEvent
        switch (event.type) {
          case 'teamUpdate':
            teamUpdateHandler(event)
            break
          case 'permissionsCreate':
            permissionsUpdateEventHandler(event)
            break
          case 'permissionsRemoval':
            permissionsRemoveEventHandler(event)
            break
          case 'subscriptionUpdate':
          case 'subscriptionCreate':
            subscriptionChangeEventHandler(event)
            break
          case 'createDoc':
          case 'contentUpdate':
          case 'resourcesUpdate':
          case 'archiveDoc':
          case 'unarchiveDoc':
            eventSourceResourceUpdateHandler(event)
            break
          case 'userRemoval':
            userRemovalEventHandler(event)
            break
          case 'userUpdate':
            userUpdateEventHandler(event)
            break
          case 'tagCreate':
          case 'tagRemoval':
            tagChangeEventHandler(event)
            break
          case 'templateDelete':
          case 'templateUpdate':
            templateChangeEventHandler(event)
            break
          case 'workspaceCreate':
          case 'workspaceRemoval':
          case 'workspaceUpdate':
            workspaceChangeEventHandler(event)
            break
          case 'guestRemoval':
          case 'guestUpdate':
            guestChangeEventHandler(event)
            break
        }
      }
    }
    return
  }, [
    guestChangeEventHandler,
    eventSourceResourceUpdateHandler,
    eventSourceSetupCounter,
    userRemovalEventHandler,
    userUpdateEventHandler,
    subscriptionChangeEventHandler,
    permissionsRemoveEventHandler,
    permissionsUpdateEventHandler,
    workspaceChangeEventHandler,
    tagChangeEventHandler,
    teamUpdateHandler,
    templateChangeEventHandler,
  ])

  return (
    <StyledAppLayout onMouseLeave={appOnMouseLeaveHandler}>
      <StyledAppContainer className={className} style={style}>
        <StyledPane
          className={cc([
            'left',
            sidebarIsHidden && 'hidden',
            preferences.sidebarIsHovered && 'hovered',
            sidebarIsFocused && 'focused',
          ])}
          style={{ width: `${leftWidth}px` }}
        >
          <Sidebar setFocused={setSidebarIsFocused} />
          <Divider onMouseDown={startDragging} dragging={dragging} />
        </StyledPane>

        <StyledPane className='right' ref={rightSideContentRef}>
          <RightLayoutWithTopBar {...rightLayout}>
            {children}
          </RightLayoutWithTopBar>
          <AnnouncementAlert />
        </StyledPane>
      </StyledAppContainer>
    </StyledAppLayout>
  )
}

export default AppLayout

const minLeftWidth = 250

const StyledAppLayout = styled.div`
  display: block;
  top: 0;
  left: 0;
  position: absolute;
`

const StyledAppContainer = styled.div`
  display: flex;
  position: relative;
  overflow: hidden;
  height: 100vh;
  width: 100vw;
`

const StyledPane = styled.div`
  flex: 1 1 auto;
  transition: width 0.3s linear, top 0.2s linear, left 0.2s linear;

  &.right {
    overflow: auto;
    position: relative;
    top: ${rightSideTopBarHeight}px;
    max-height: calc(100vh - ${rightSideTopBarHeight}px);
  }

  &.left {
    transition: top 0.2s linear, left 0.2s linear;
    position: relative;
    top: 0;
    flex: 0 0 auto;
    overflow: visible;

    .clip {
      display: flex;
      flex-direction: column;
      flex: 1 0 auto;
      width: 100%;
      overflow: hidden auto;
      height: calc(100vh - 50px);
    }

    &.hidden {
      position: absolute;
      top: ${({ theme }) => theme.topHeaderHeight}px;
      left: -300px;
      z-index: 1;
      max-width: 250px;
      background-color: ${({ theme }) => theme.baseBackgroundColor};

      .clip {
        height: calc(100vh - ${({ theme }) => theme.topHeaderHeight * 3}px);
      }

      &.hovered,
      &.focused {
        left: 0;
        height: auto;
        max-height: calc(100vh - ${({ theme }) => theme.topHeaderHeight * 2}px);
        border: 1px solid ${({ theme }) => theme.baseBorderColor};
        .divider {
          display: none;
        }
      }
    }
  }
`

function isCodeMirorTextAreaEvent(event: KeyboardEvent) {
  const target = event.target as HTMLTextAreaElement
  if (target == null || target.tagName.toLowerCase() !== 'textarea') {
    return false
  }
  const classNameOfParentParentElement =
    target.parentElement?.parentElement?.className
  if (classNameOfParentParentElement == null) {
    return false
  }
  if (!/CodeMirror/.test(classNameOfParentParentElement)) {
    return false
  }

  return true
}
