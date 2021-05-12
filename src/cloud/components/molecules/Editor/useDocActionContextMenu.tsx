import React, { useCallback, MouseEvent } from 'react'
import {
  useContextMenu,
  MenuTypes,
  MenuItem,
} from '../../../../shared/lib/stores/contextMenu'
import Icon from '../../../../shared/components/atoms/Icon'
import {
  mdiStarOutline,
  mdiEarth,
  mdiAccountMultiplePlus,
  mdiContentCopy,
  mdiOpenInNew,
  mdiExportVariant,
  mdiPaletteOutline,
  mdiArrowRight,
  mdiArchiveOutline,
  mdiStarRemoveOutline,
  mdiEarthRemove,
} from '@mdi/js'
import styled from '../../../../shared/lib/styled'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'

export interface DocActionContextMenuParams {
  doc: SerializedDocWithBookmark
  toggleBookmarkForDoc: () => void
  togglePublicSharing: () => void
}

export function useDocActionContextMenu({
  doc,
  toggleBookmarkForDoc,
  togglePublicSharing,
}: DocActionContextMenuParams) {
  const { popup } = useContextMenu()

  const open = useCallback(
    (event: MouseEvent) => {
      popup(event, [
        doc.bookmarked
          ? createMenuItem({
              label: 'Remove from Bookmarks',
              iconPath: mdiStarRemoveOutline,
              onClick: toggleBookmarkForDoc,
            })
          : createMenuItem({
              label: 'Add to Bookmarks',
              iconPath: mdiStarOutline,
              onClick: toggleBookmarkForDoc,
            }),
        doc.shareLink == null
          ? createMenuItem({
              label: 'Share to Web',
              iconPath: mdiEarth,
              onClick: togglePublicSharing,
            })
          : createMenuItem({
              label: 'Stop Sharing to Web',
              iconPath: mdiEarthRemove,
              onClick: togglePublicSharing,
            }),
        createMenuItem({
          label: 'Invite Guest',
          iconPath: mdiAccountMultiplePlus,
        }),
        createMenuItem({
          label: 'Copy Link',
          iconPath: mdiContentCopy,
        }),
        createMenuItem({
          label: 'Open in Browser',
          iconPath: mdiOpenInNew,
        }),
        createMenuItem({
          label: 'Export',
          iconPath: mdiExportVariant,
        }),
        createMenuItem({
          label: 'Save as Template',
          iconPath: mdiPaletteOutline,
        }),
        createMenuItem({
          label: 'Move to',
          iconPath: mdiArrowRight,
        }),
        createMenuItem({
          label: 'Archive',
          iconPath: mdiArchiveOutline,
        }),
      ])
    },
    [
      popup,
      doc.bookmarked,
      toggleBookmarkForDoc,
      doc.shareLink,
      togglePublicSharing,
    ]
  )

  return {
    open,
  }
}

interface MenuItemParams {
  label: string
  iconPath: string
  onClick?: () => void
}

function createMenuItem({
  label,
  iconPath,
  onClick,
}: MenuItemParams): MenuItem {
  return {
    type: MenuTypes.Normal,
    label: (
      <MenuItemContainer>
        <Icon className='icon' size={16} path={iconPath} /> {label}
      </MenuItemContainer>
    ),
    onClick,
  }
}

const MenuItemContainer = styled.div`
  display: flex;
  align-items: center;

  .icon {
    margin-right: 4px;
  }
`
