import React, { useCallback, useMemo, useState } from 'react'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import {
  mdiStar,
  mdiTrashCan,
  mdiStarOutline,
  mdiPencil,
  mdiContentSaveOutline,
  mdiClockOutline,
  mdiContentCopy,
  mdiOpenInNew,
  mdiArrowRight,
  mdiFolderMultipleOutline,
} from '@mdi/js'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import { useModal } from '../../../design/lib/stores/modal'
import { useNav } from '../../lib/stores/nav'
import { getFormattedDateTime } from '../../lib/date'
import MetadataContainerBreak from '../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import { boostHubBaseUrl } from '../../lib/consts'
import { getFolderHref } from '../Link/FolderLink'
import { usePage } from '../../lib/stores/pageStore'
import copy from 'copy-to-clipboard'
import { sendToHost, usingElectron } from '../../lib/stores/electron'
import MoveItemModal from '../Modal/contents/Forms/MoveItemModal'
import { getMapValues } from '../../../design/lib/utils/array'
import { useRouter } from '../../lib/router'

interface FolderContextMenuProps {
  currentFolder: SerializedFolderWithBookmark
  currentUserIsCoreMember: boolean
}

const FolderContextMenu = ({
  currentFolder: folder,
  currentUserIsCoreMember,
}: FolderContextMenuProps) => {
  const { toggleFolderBookmark, sendingMap, updateFolder } = useCloudApi()
  const { deleteFolder, openRenameFolderForm } = useCloudResourceModals()
  const { closeAllModals, openModal } = useModal()
  const { translate } = useI18n()
  const { foldersMap, docsMap } = useNav()
  const [copied, setCopied] = useState(false)
  const { team } = usePage()
  const { query } = useRouter()

  const currentFolder = useMemo(() => {
    return foldersMap.get(folder.id)
  }, [foldersMap, folder.id])

  const folderUrl = useMemo(() => {
    if (currentFolder == null || team == null) {
      return ''
    }

    let folderUrl =
      boostHubBaseUrl + getFolderHref(currentFolder, team, 'index')
    if (query && query.view) {
      folderUrl += `?view=${query.view}`
    }
    return folderUrl
  }, [currentFolder, team, query])

  const children = useMemo(() => {
    if (currentFolder == null) {
      return { docs: 0, folders: 0 }
    }

    const docs = getMapValues(docsMap).reduce((acc, val) => {
      if (val.parentFolderId === currentFolder.id) {
        return acc + 1
      }
      return acc
    }, 0)

    const folders = getMapValues(foldersMap).reduce((acc, val) => {
      if (val.parentFolderId === currentFolder.id) {
        return acc + 1
      }
      return acc
    }, 0)

    return {
      docs,
      folders,
    }
  }, [foldersMap, currentFolder, docsMap])

  const copyButtonHandler = useCallback(() => {
    copy(folderUrl)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 200)
  }, [folderUrl])

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
    <MetadataContainer
      rows={[{ type: 'header', content: translate(lngKeys.FolderInfo) }]}
    >
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.CreationDate),
          type: 'content',
          icon: mdiClockOutline,
          content: getFormattedDateTime(
            currentFolder.createdAt,
            undefined,
            'MMM dd, yyyy, HH:mm'
          ),
        }}
      />
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.UpdateDate),
          type: 'content',
          icon: mdiContentSaveOutline,
          content: getFormattedDateTime(
            currentFolder.updatedAt,
            undefined,
            'MMM dd, yyyy, HH:mm'
          ),
        }}
      />
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.GeneralContent),
          type: 'content',
          icon: mdiFolderMultipleOutline,
          content: `${children.folders} ${translate(lngKeys.GeneralFolders)}, ${
            children.docs
          } ${translate(lngKeys.GeneralDocuments)}`,
        }}
      />
      <MetadataContainerBreak />
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
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'metadata-copy-link',
            label: translate(lngKeys.GeneralCopyTheLink),
            iconPath: mdiContentCopy,
            spinning: copied,
            disabled: copied,
            onClick: copyButtonHandler,
          },
        }}
      />
      {usingElectron && (
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              id: 'metadata-open-new',
              label: translate(lngKeys.OpenInBrowser),
              iconPath: mdiOpenInNew,
              onClick: () => {
                sendToHost('open-external-url', folderUrl)
              },
            },
          }}
        />
      )}
      {currentUserIsCoreMember && (
        <>
          <MetadataContainerBreak />
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

          <MetadataContainerRow
            row={{
              type: 'button',
              props: {
                disabled: sendingMap.has(currentFolder.id),
                spinning: sendingMap.get(currentFolder.id) === 'update',
                id: 'metadata-move',
                label: translate(lngKeys.GeneralMoveVerb),
                iconPath: mdiArrowRight,
                onClick: () => {
                  return openModal(
                    <MoveItemModal
                      onSubmit={(workspaceId, parentFolderId) =>
                        updateFolder(currentFolder, {
                          workspaceId,
                          parentFolderId,
                        })
                      }
                    />
                  )
                },
              },
            }}
          />
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
        </>
      )}
    </MetadataContainer>
  )
}

export default FolderContextMenu
