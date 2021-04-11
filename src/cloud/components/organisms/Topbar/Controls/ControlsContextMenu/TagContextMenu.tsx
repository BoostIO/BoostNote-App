import React, { useState, useMemo, useCallback } from 'react'
import { usePage } from '../../../../../lib/stores/pageStore'
import { useNav } from '../../../../../lib/stores/nav'
import ContextMenuItem from './ControlsContextMenuItem'
import {
  Scrollable,
  StyledContextMenuContainer,
  StyledFooter,
  StyledMenuItem,
  StyledIcon,
} from './styled'
import ControlsContextMenuBackground from './ControlsContextMenuBackground'
import { getFormattedBoosthubDate } from '../../../../../lib/date'
import { useEffectOnce } from 'react-use'
import {
  useGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  useContextMenuKeydownHandler,
} from '../../../../../lib/keyboard'
import { SerializedTag } from '../../../../../interfaces/db/tag'
import { deleteTag } from '../../../../../api/teams/tags'
import { SerializedTeam } from '../../../../../interfaces/db/team'
import {
  useDialog,
  DialogIconTypes,
} from '../../../../../../lib/v2/stores/dialog'
import IconMdi from '../../../../atoms/IconMdi'
import { mdiTrashCan } from '@mdi/js'
import { useToast } from '../../../../../../lib/v2/stores/toast'

interface TagContextMenuProps {
  currentTag: SerializedTag
  team: SerializedTeam
  closeContextMenu: () => void
}

const TagContextMenu = ({
  closeContextMenu,
  team,
  currentTag,
}: TagContextMenuProps) => {
  const [sendingRemoval, setSendingRemoval] = useState<boolean>(false)
  const { removeFromTagsMap } = useNav()
  const { setPartialPageData, pageTag } = usePage()
  const { pushApiErrorMessage } = useToast()
  const { messageBox } = useDialog()

  const menuRef = React.createRef<HTMLDivElement>()
  useEffectOnce(() => {
    menuRef.current!.focus()
  })

  const onBlurHandler = (event: any) => {
    if (
      menuRef.current != null &&
      event.relatedTarget != null &&
      menuRef.current.contains(event.relatedTarget)
    ) {
      return
    }

    closeContextMenu()
    return
  }

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

  const deleteTagHandler = useCallback(
    async (currentTag: SerializedTag) => {
      if (sendingRemoval) {
        return
      }
      messageBox({
        title: `Delete #${currentTag.text}?`,
        message: `Are you sure to remove this tag? It will be removed from all the affiliated docs`,
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Delete',
            onClick: async () => {
              setSendingRemoval(true)
              try {
                await deleteTag(team.id, currentTag.id)
                removeFromTagsMap(currentTag.id)
                if (pageTag != null && pageTag.id === currentTag.id) {
                  setPartialPageData({ pageTag: undefined })
                }
              } catch (error) {
                pushApiErrorMessage(error)
              }

              setSendingRemoval(false)
              return
            },
          },
        ],
      })
    },
    [
      sendingRemoval,
      pushApiErrorMessage,
      setSendingRemoval,
      removeFromTagsMap,
      setPartialPageData,
      pageTag,
      team.id,
      messageBox,
    ]
  )

  return (
    <>
      <ControlsContextMenuBackground closeContextMenu={closeContextMenu} />
      <StyledContextMenuContainer ref={menuRef} onBlur={onBlurHandler}>
        <Scrollable>
          <ContextMenuItem
            label={
              sendingRemoval ? (
                '...'
              ) : (
                <div>
                  <StyledMenuItem>
                    <StyledIcon>
                      <IconMdi path={mdiTrashCan} />
                    </StyledIcon>
                    Delete
                  </StyledMenuItem>
                </div>
              )
            }
            onClick={() => deleteTagHandler(currentTag)}
            id='tag-context-top-delete'
          />
        </Scrollable>
        <StyledFooter>
          Created:
          <div>{getFormattedBoosthubDate(currentTag.createdAt)}</div>
        </StyledFooter>
      </StyledContextMenuContainer>
    </>
  )
}

export default TagContextMenu
