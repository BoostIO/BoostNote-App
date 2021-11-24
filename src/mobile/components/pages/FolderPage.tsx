import React, { useMemo, useEffect, useState } from 'react'
import { usePage } from '../../../cloud/lib/stores/pageStore'
import { useNav } from '../../../cloud/lib/stores/nav'
import { useTitle } from 'react-use'
import { SerializedDocWithSupplemental } from '../../../cloud/interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../cloud/interfaces/db/folder'
import ContentManager from '../organisms/ContentManager'
import { SerializedWorkspace } from '../../../cloud/interfaces/db/workspace'
import ErrorLayout from '../../../design/components/templates/ErrorLayout'
import AppLayout from '../layouts/AppLayout'
import FolderContextMenu from '../../../cloud/components/Topbar/Controls/ControlsContextMenu/FolderContextMenu'
import EmojiIcon from '../../../cloud/components/EmojiIcon'
import { mdiFolder } from '@mdi/js'

const FolderPage = () => {
  const { pageFolder, team, currentUserIsCoreMember } = usePage()
  const {
    docsMap,
    foldersMap,
    setCurrentPath,
    workspacesMap,
    currentWorkspaceId,
  } = useNav()
  const [showContextMenu, setShowContextMenu] = useState<boolean>(false)

  const currentFolder = useMemo(() => {
    if (pageFolder == null) {
      return
    }

    return foldersMap.get(pageFolder.id)
  }, [foldersMap, pageFolder])

  const childDocs = useMemo(() => {
    if (currentFolder == null) {
      return []
    }
    return currentFolder.childDocsIds
      .filter((docId) => docsMap.has(docId))
      .map((docId) => docsMap.get(docId) as SerializedDocWithSupplemental)
  }, [docsMap, currentFolder])

  const childFolders = useMemo(() => {
    if (currentFolder == null) {
      return []
    }
    return currentFolder.childFoldersIds
      .filter((folderId) => foldersMap.has(folderId))
      .map(
        (folderId) => foldersMap.get(folderId) as SerializedFolderWithBookmark
      )
  }, [foldersMap, currentFolder])

  const pageTitle = useMemo(() => {
    if (currentFolder == null || team == null) {
      return 'BoostHub'
    }

    return `${currentFolder.name} - ${team.name}`
  }, [currentFolder, team])

  useTitle(pageTitle)

  useEffect(() => {
    if (currentFolder == null) {
      setCurrentPath('/')
    } else {
      setCurrentPath(currentFolder.pathname)
    }
  }, [currentFolder, setCurrentPath])

  const currentWorkspace = useMemo(() => {
    if (currentWorkspaceId == null) {
      return undefined
    }
    return workspacesMap.get(currentWorkspaceId)
  }, [currentWorkspaceId, workspacesMap])

  const workspaceMap = useMemo(() => {
    const map = new Map<string, SerializedWorkspace>()
    if (currentWorkspace != null) {
      map.set(currentWorkspace.id, currentWorkspace)
    }

    return map
  }, [currentWorkspace])

  if (team == null) {
    return (
      <AppLayout>
        <ErrorLayout message={'Team is missing'} />
      </AppLayout>
    )
  }

  if (currentFolder == null) {
    return (
      <AppLayout>
        <ErrorLayout message={'The folder has been deleted'} />
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={
        <>
          <EmojiIcon
            className='emoji-icon'
            defaultIcon={mdiFolder}
            emoji={currentFolder.emoji}
            size={16}
          />{' '}
          {currentFolder.name}
        </>
      }
    >
      {showContextMenu && (
        <FolderContextMenu
          currentFolder={currentFolder}
          closeContextMenu={() => setShowContextMenu(false)}
          currentUserIsCoreMember={currentUserIsCoreMember}
        />
      )}

      <ContentManager
        team={team}
        documents={childDocs}
        folders={childFolders}
        workspacesMap={workspaceMap}
        currentFolderId={currentFolder.id}
        currentWorkspaceId={currentFolder.workspaceId}
        currentUserIsCoreMember={currentUserIsCoreMember}
      />
    </AppLayout>
  )
}

export default FolderPage
