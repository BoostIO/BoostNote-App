import React, { useState, useCallback, useMemo } from 'react'
import IconMdi from '../../../atoms/IconMdi'
import { mdiStar, mdiStarOutline, mdiDotsVertical } from '@mdi/js'
import FolderContextMenu from './ControlsContextMenu/FolderContextMenu'
import { StyledContentControls, StyledContentButton } from './styled'
import { useNav } from '../../../../lib/stores/nav'
import {
  CreateFolderBookmarkResponseBody,
  DestroyFolderBookmarkResponseBody,
  destroyFolderBookmark,
  createFolderBookmark,
} from '../../../../api/teams/folders/bookmarks'
import { useToast } from '../../../../lib/stores/toast'
import { SerializedFolderWithBookmark } from '../../../../interfaces/db/folder'
import {
  useGlobalKeyDownHandler,
  preventKeyboardEventPropagation,
} from '../../../../lib/keyboard'
import Tooltip from '../../../atoms/Tooltip'
import {
  isFolderBookmarkShortcut,
  isFolderDeleteShortcut,
} from '../../../../lib/shortcuts'

interface FolderControlsProps {
  currentFolder: SerializedFolderWithBookmark
}

const FolderControls = ({ currentFolder }: FolderControlsProps) => {
  const { updateFoldersMap, deleteFolderHandler } = useNav()
  const [opened, setOpened] = useState<boolean>(false)
  const [sendingBookmark, setSendingBookmark] = useState<boolean>(false)
  const { pushMessage } = useToast()

  const toggleFolderBookmark = useCallback(async () => {
    if (sendingBookmark || currentFolder == null) {
      return
    }
    setSendingBookmark(true)
    try {
      let data:
        | CreateFolderBookmarkResponseBody
        | DestroyFolderBookmarkResponseBody
      if (currentFolder.bookmarked) {
        data = await destroyFolderBookmark(
          currentFolder.teamId,
          currentFolder.id
        )
      } else {
        data = await createFolderBookmark(
          currentFolder.teamId,
          currentFolder.id
        )
      }
      updateFoldersMap([data.folder.id, data.folder])
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: 'Could not bookmark this folder',
      })
    }
    setSendingBookmark(false)
  }, [
    setSendingBookmark,
    pushMessage,
    updateFoldersMap,
    sendingBookmark,
    currentFolder,
  ])

  const folderPageControlsKeyDownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isFolderBookmarkShortcut(event)) {
        preventKeyboardEventPropagation(event)
        toggleFolderBookmark()
        return
      }
      if (isFolderDeleteShortcut(event)) {
        preventKeyboardEventPropagation(event)
        deleteFolderHandler(currentFolder)
        return
      }
    }
  }, [toggleFolderBookmark, deleteFolderHandler, currentFolder])
  useGlobalKeyDownHandler(folderPageControlsKeyDownHandler)

  if (currentFolder == null) {
    return null
  }

  return (
    <StyledContentControls>
      <Tooltip
        tooltip={
          <div>
            <span className='tooltip-text'>Bookmark</span>
            <span className='tooltip-command'>B</span>
          </div>
        }
      >
        <StyledContentButton onClick={toggleFolderBookmark}>
          {currentFolder.bookmarked ? (
            <IconMdi path={mdiStar} />
          ) : (
            <IconMdi path={mdiStarOutline} />
          )}
        </StyledContentButton>
      </Tooltip>
      <StyledContentButton onClick={() => setOpened(true)}>
        <IconMdi path={mdiDotsVertical} />
      </StyledContentButton>
      {opened && (
        <FolderContextMenu
          currentFolder={currentFolder}
          closeContextMenu={() => setOpened(false)}
        />
      )}
    </StyledContentControls>
  )
}

export default FolderControls
