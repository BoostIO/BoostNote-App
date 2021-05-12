import React, { useCallback, MouseEvent, useMemo } from 'react'
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

import copy from 'copy-to-clipboard'
import { SerializedTeam } from '../../../interfaces/db/team'
import { getDocLinkHref } from '../../atoms/Link/DocLink'
import { boostHubBaseUrl } from '../../../lib/consts'

export interface DocActionContextMenuParams {
  team: SerializedTeam
  doc: SerializedDocWithBookmark
  toggleBookmarkForDoc: () => void
  togglePublicSharing: () => void
  openGuestsModal: () => void
}

export function useDocActionContextMenu({
  team,
  doc,
  toggleBookmarkForDoc,
  togglePublicSharing,
  openGuestsModal,
}: DocActionContextMenuParams) {
  const { popup } = useContextMenu()

  const docUrl = useMemo(() => {
    return boostHubBaseUrl + getDocLinkHref(doc, team, 'index')
  }, [team, doc])

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
          onClick: openGuestsModal,
        }),
        createMenuItem({
          label: 'Copy Link',
          iconPath: mdiContentCopy,
          onClick: () => {
            copy(docUrl)
          },
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
      openGuestsModal,
      docUrl,
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
