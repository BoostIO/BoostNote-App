import React, { useMemo } from 'react'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { mdiStar, mdiTrashCan, mdiStarOutline, mdiPencil } from '@mdi/js'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import MetadataContainer from '../../../../shared/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../shared/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { useModal } from '../../../../shared/lib/stores/modal'
import { useNav } from '../../../lib/stores/nav'

interface FolderContextMenuProps {
  currentFolder: SerializedFolderWithBookmark
  currentUserIsCoreMember: boolean
}

const FolderContextMenu = ({
  currentFolder: folder,
  currentUserIsCoreMember,
}: FolderContextMenuProps) => {
  const { toggleFolderBookmark, sendingMap } = useCloudApi()
  const { deleteFolder, openRenameFolderForm } = useCloudResourceModals()
  const { closeAllModals } = useModal()
  const { translate } = useI18n()
  const { foldersMap } = useNav()

  const currentFolder = useMemo(() => {
    return foldersMap.get(folder.id)
  }, [foldersMap, folder.id])

  if (currentFolder == null) {
    return (
      <MetadataContainer>
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: 'Folder has been deleted',
              disabled: true,
            },
          }}
        />
      </MetadataContainer>
    )
  }

  return (
    <MetadataContainer>
      {currentUserIsCoreMember && (
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              disabled: sendingMap.has(currentFolder.id),
              id: 'metadata-rename',
              label: translate(lngKeys.GeneralRenameVerb),
              iconPath: mdiPencil,
              onClick: () => openRenameFolderForm(currentFolder),
            },
          }}
        />
      )}
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'metadata-bookmark',
            disabled: sendingMap.has(currentFolder.id),
            spinning: sendingMap.get(currentFolder.id) === 'bookmark',
            label: currentFolder.bookmarked
              ? translate(lngKeys.GeneralUnbookmarkVerb)
              : translate(lngKeys.GeneralBookmarkVerb),
            iconPath: currentFolder.bookmarked ? mdiStar : mdiStarOutline,
            onClick: () =>
              toggleFolderBookmark(
                currentFolder.teamId,
                currentFolder.id,
                currentFolder.bookmarked
              ),
          },
        }}
      />
      {currentUserIsCoreMember && (
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              disabled: sendingMap.has(currentFolder.id),
              id: 'metadata-delete',
              label: translate(lngKeys.GeneralDelete),
              iconPath: mdiTrashCan,
              onClick: () => {
                closeAllModals()
                deleteFolder(currentFolder)
              },
            },
          }}
        />
      )}
    </MetadataContainer>
  )
}

export default FolderContextMenu
