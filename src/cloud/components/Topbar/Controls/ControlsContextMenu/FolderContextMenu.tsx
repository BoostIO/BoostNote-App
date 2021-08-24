import React, { useState, useCallback, useMemo, useRef } from 'react'
import { usePage } from '../../../../lib/stores/pageStore'
import { useNav } from '../../../../lib/stores/nav'
import {
  destroyFolderBookmark,
  createFolderBookmark,
  CreateFolderBookmarkResponseBody,
  DestroyFolderBookmarkResponseBody,
} from '../../../../api/teams/folders/bookmarks'
import ContextMenuItem from './ControlsContextMenuItem'
import {
  StyledContextMenuContainer,
  Scrollable,
  StyledMenuItem,
} from './styled'
import ControlsContextMenuBackground from './ControlsContextMenuBackground'
import { SerializedFolderWithBookmark } from '../../../../interfaces/db/folder'
import { useEffectOnce } from 'react-use'
import {
  useGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  useContextMenuKeydownHandler,
} from '../../../../lib/keyboard'
import { MetaKeyText } from '../../../../lib/keyboard'
import { mdiStar, mdiTrashCan, mdiStarOutline, mdiPencil } from '@mdi/js'
import { useToast } from '../../../../../design/lib/stores/toast'
import { useCloudResourceModals } from '../../../../lib/hooks/useCloudResourceModals'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import Icon from '../../../../../design/components/atoms/Icon'

interface FolderContextMenuProps {
  currentFolder: SerializedFolderWithBookmark
  closeContextMenu: () => void
  currentUserIsCoreMember: boolean
}

const FolderContextMenu = ({
  closeContextMenu,
  currentFolder,
  currentUserIsCoreMember,
}: FolderContextMenuProps) => {
  const [sendingBookmark, setSendingBookmark] = useState<boolean>(false)
  const { updateFoldersMap, deleteFolderHandler } = useNav()
  const { setPartialPageData } = usePage()
  const { pushMessage } = useToast()
  const { openRenameFolderForm } = useCloudResourceModals()
  const { translate } = useI18n()

  const menuRef = useRef<HTMLDivElement>(null)
  useEffectOnce(() => {
    menuRef.current!.focus()
  })

  const onBlurHandler = (event: any) => {
    if (
      !(
        menuRef.current == null ||
        event.relatedTarget == null ||
        !menuRef.current.contains(event.relatedTarget)
      )
    ) {
      return
    }
    closeContextMenu()
  }

  const toggleBookmark = useCallback(async () => {
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
      setPartialPageData({ pageFolder: data.folder })
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: 'Could not bookmark this doc',
      })
    }
    setSendingBookmark(false)
  }, [
    currentFolder,
    setPartialPageData,
    setSendingBookmark,
    pushMessage,
    updateFoldersMap,
    sendingBookmark,
  ])

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isSingleKeyEventOutsideOfInput(event, 'escape')) {
        preventKeyboardEventPropagation(event)
        closeContextMenu()
      }
    }
  }, [closeContextMenu])
  useGlobalKeyDownHandler(keydownHandler)
  useContextMenuKeydownHandler(menuRef)

  return (
    <>
      <ControlsContextMenuBackground closeContextMenu={closeContextMenu} />
      <StyledContextMenuContainer ref={menuRef} onBlur={onBlurHandler}>
        <Scrollable>
          {currentUserIsCoreMember && (
            <ContextMenuItem
              label={
                <div>
                  <StyledMenuItem>
                    <Icon className='icon' size={16} path={mdiPencil} />
                    {translate(lngKeys.GeneralRenameVerb)}
                  </StyledMenuItem>
                </div>
              }
              disabled={sendingBookmark}
              onClick={() => {
                openRenameFolderForm(currentFolder)
                closeContextMenu()
              }}
              id='fD-context-top-edit'
              tooltip='E'
            />
          )}
          <ContextMenuItem
            label={
              sendingBookmark ? (
                '...'
              ) : currentFolder.bookmarked ? (
                <div>
                  <StyledMenuItem>
                    <Icon className='icon' size={16} path={mdiStar} />
                    {translate(lngKeys.GeneralUnbookmarkVerb)}
                  </StyledMenuItem>
                </div>
              ) : (
                <div>
                  <StyledMenuItem>
                    <Icon className='icon' size={16} path={mdiStarOutline} />
                    {translate(lngKeys.GeneralBookmarkVerb)}
                  </StyledMenuItem>
                </div>
              )
            }
            disabled={sendingBookmark}
            onClick={toggleBookmark}
            id='fD-context-top-bookmark'
            tooltip='B'
          />
          {currentUserIsCoreMember && (
            <ContextMenuItem
              label={
                <div>
                  <StyledMenuItem>
                    <Icon className='icon' size={16} path={mdiTrashCan} />
                    {translate(lngKeys.GeneralDelete)}
                  </StyledMenuItem>
                </div>
              }
              onClick={() => deleteFolderHandler(currentFolder)}
              id='fd-context-top-delete'
              tooltip={`${MetaKeyText()} + Shift + Delete`}
            />
          )}
        </Scrollable>
      </StyledContextMenuContainer>
    </>
  )
}

export default FolderContextMenu
