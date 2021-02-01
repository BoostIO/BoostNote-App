import React, { useMemo, useEffect, useCallback, useState } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { useNav } from '../../../lib/stores/nav'
import ColoredBlock from '../../atoms/ColoredBlock'
import { getTeamURL, getFolderURL } from '../../../lib/utils/patterns'
import { useTitle } from 'react-use'
import { useModal } from '../../../lib/stores/modal'
import {
  useGlobalKeyDownHandler,
  preventKeyboardEventPropagation,
} from '../../../lib/keyboard'
import { isFolderEditShortcut } from '../../../lib/shortcuts'
import EditFolderModal from '../Modal/contents/Folder/EditFolderModal'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import {
  mdiFolderOutline,
  mdiTextBoxPlusOutline,
  mdiFolderMultiplePlusOutline,
} from '@mdi/js'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import FolderControls from '../Topbar/Controls/FolderControls'
import EmojiIcon from '../../atoms/EmojiIcon'
import ContentManager, {
  ContentManagerParent,
} from '../../molecules/ContentManager'
import { useEmojiPicker } from '../../../lib/stores/emoji'
import { EmojiResource } from '../Sidebar/SideNavigator/SideNavIcon'
import SingleInputModal from '../Modal/contents/Forms/SingleInputModal'
import RightLayoutHeaderButtons from '../../molecules/RightLayoutHeaderButtons'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import AppLayout from '../../layouts/AppLayout'
import BreadCrumbs from '../RightSideTopBar/BreadCrumbs'
import { useRouter } from '../../../lib/router'

const folderIdRegex = new RegExp('(?:/[A-z0-9]*-)([A-z0-9]*)$')

enum FolderHeaderActions {
  newDoc = 0,
  newFolder = 1,
}

const FolderPage = () => {
  const { pageFolder, team } = usePage()
  const {
    docsMap,
    foldersMap,
    setCurrentPath,
    workspacesMap,
    currentWorkspaceId,
    createDocHandler,
    createFolderHandler,
  } = useNav()
  const router = useRouter()
  const { openModal } = useModal()
  const { openEmojiPicker } = useEmojiPicker()
  const [sending, setSending] = useState<number>()

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
      .map((docId) => docsMap.get(docId) as SerializedDocWithBookmark)
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

  const currentAsPath = useMemo(() => {
    if (team == null) {
      return '/'
    }

    if (currentFolder == null) {
      return getTeamURL(team)
    } else {
      return `${getTeamURL(team)}${getFolderURL(currentFolder)}`
    }
  }, [team, currentFolder])

  const onEmojiClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      openEmojiPicker(event, {
        item: currentFolder,
        type: 'folder',
      } as EmojiResource)
    },
    [currentFolder, openEmojiPicker]
  )

  // useEffect(() => {
  //   if (router.asPath === currentAsPath) {
  //     return
  //   }

  //   const prevPathMatch = router.asPath.match(folderIdRegex)
  //   const currentPathMatch = currentAsPath.match(folderIdRegex)
  //   if (
  //     prevPathMatch == null ||
  //     currentPathMatch == null ||
  //     prevPathMatch[1] !== currentPathMatch[1]
  //   ) {
  //     return
  //   }

  //   router.replace('/[teamId]/[resourceId]', currentAsPath, {
  //     shallow: true,
  //   })
  // }, [currentAsPath, router, setCurrentPath])

  useEffect(() => {
    if (currentFolder == null) {
      setCurrentPath('/')
    } else {
      setCurrentPath(currentFolder.pathname)
    }
  }, [currentFolder, setCurrentPath])

  const folderPageControlsKeyDownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (team == null) {
        return
      }
      if (isFolderEditShortcut(event)) {
        if (pageFolder == null) {
          return
        }
        preventKeyboardEventPropagation(event)
        openModal(<EditFolderModal folder={pageFolder} />)
        return
      }
    }
  }, [openModal, team, pageFolder])
  useGlobalKeyDownHandler(folderPageControlsKeyDownHandler)

  const parentFolder = useMemo(() => {
    if (currentFolder == null || currentFolder.parentFolderId == null) {
      return
    }

    return foldersMap.get(currentFolder.parentFolderId)
  }, [foldersMap, currentFolder])

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

  const parent: ContentManagerParent | undefined = useMemo(() => {
    if (parentFolder != null) {
      return { type: 'folder', item: parentFolder }
    }

    if (currentWorkspace != null) {
      return { type: 'workspace', item: currentWorkspace }
    }

    return undefined
  }, [parentFolder, currentWorkspace])

  const submitNewDoc = useCallback(async () => {
    if (currentFolder == null) {
      return
    }

    try {
      setSending(FolderHeaderActions.newDoc)
      await createDocHandler({
        workspaceId: currentFolder.workspaceId,
        parentFolderId: currentFolder.id,
      })
    } catch (error) {}
    setSending(undefined)
  }, [createDocHandler, currentFolder])

  const submitNewFolder = useCallback(
    async (name: string) => {
      if (name.trim() === '' || currentFolder == null) {
        return
      }

      try {
        setSending(FolderHeaderActions.newFolder)
        await createFolderHandler({
          workspaceId: currentFolder.workspaceId,
          parentFolderId: currentFolder.id,
          folderName: name,
          description: '',
        })
      } catch (error) {}

      setSending(undefined)
    },
    [createFolderHandler, currentFolder]
  )

  const openNewFolderForm = useCallback(() => {
    openModal(
      <SingleInputModal
        content={<p>Name of your new folder</p>}
        onSubmit={submitNewFolder}
      />,
      {
        classNames: 'fit-content',
      }
    )
  }, [openModal, submitNewFolder])

  if (team == null) {
    return null
  }

  if (currentFolder == null) {
    return (
      <AppLayout
        rightLayout={{
          className: 'reduced-width',
          topbar: { left: <BreadCrumbs team={team} /> },
        }}
      >
        <ColoredBlock variant='danger' style={{ marginTop: '40px' }}>
          <h3>Oops...</h3>
          <p>The folder has been deleted.</p>
        </ColoredBlock>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      rightLayout={{
        className: 'reduced-width',
        topbar: {
          left: <BreadCrumbs team={team} />,
          right: <FolderControls currentFolder={currentFolder} />,
        },
        header: (
          <>
            <EmojiIcon
              defaultIcon={mdiFolderOutline}
              emoji={currentFolder.emoji}
              onClick={onEmojiClick}
              style={{ marginRight: 10 }}
              tooltip='Icon'
            />
            <span style={{ marginRight: 10 }}>{currentFolder.name}</span>
            <RightLayoutHeaderButtons
              buttons={[
                {
                  disabled: sending != null,
                  sending: sending === FolderHeaderActions.newDoc,
                  tooltip: 'Create new doc',
                  iconPath: mdiTextBoxPlusOutline,
                  onClick: submitNewDoc,
                },
                {
                  disabled: sending != null,
                  sending: sending === FolderHeaderActions.newFolder,
                  tooltip: 'Create new folder',
                  iconPath: mdiFolderMultiplePlusOutline,
                  onClick: openNewFolderForm,
                },
              ]}
            />
          </>
        ),
      }}
    >
      <ContentManager
        team={team}
        documents={childDocs}
        folders={childFolders}
        parent={parent}
        workspacesMap={workspaceMap}
      />
    </AppLayout>
  )
}

export default FolderPage
