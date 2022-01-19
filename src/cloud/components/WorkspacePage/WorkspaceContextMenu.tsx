import React, { useCallback, useMemo, useState } from 'react'
import {
  mdiTrashCan,
  mdiContentSaveOutline,
  mdiClockOutline,
  mdiContentCopy,
  mdiOpenInNew,
  mdiFolderMultipleOutline,
  mdiCog,
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
import { usePage } from '../../lib/stores/pageStore'
import copy from 'copy-to-clipboard'
import { sendToHost, usingElectron } from '../../lib/stores/electron'
import { getMapValues } from '../../../design/lib/utils/array'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { getWorkspaceHref } from '../Link/WorkspaceLink'
import { useRouter } from '../../lib/router'

interface WorkspaceContextMenuProps {
  currentWorkspace: SerializedWorkspace
  currentUserIsCoreMember: boolean
}

const WorkspaceContextMenu = ({
  currentWorkspace: workspace,
  currentUserIsCoreMember,
}: WorkspaceContextMenuProps) => {
  const { sendingMap } = useCloudApi()
  const { openWorkspaceEditForm, deleteWorkspace } = useCloudResourceModals()
  const { closeAllModals } = useModal()
  const { translate } = useI18n()
  const { foldersMap, docsMap, workspacesMap } = useNav()
  const [copied, setCopied] = useState(false)
  const { team } = usePage()
  const { query } = useRouter()
  const currentWorkspace = useMemo(() => {
    return workspacesMap.get(workspace.id)
  }, [workspacesMap, workspace])

  const workspaceUrl = useMemo(() => {
    if (currentWorkspace == null || team == null) {
      return ''
    }

    let workspaceUrl =
      boostHubBaseUrl + getWorkspaceHref(currentWorkspace, team, 'index')
    if (query && query.view) {
      workspaceUrl += `?view=${query.view}`
    }
    return workspaceUrl
  }, [currentWorkspace, team, query])

  const children = useMemo(() => {
    if (currentWorkspace == null) {
      return { docs: 0, folders: 0 }
    }

    const docs = getMapValues(docsMap).reduce((acc, val) => {
      if (
        val.workspaceId === currentWorkspace.id &&
        val.parentFolderId == null
      ) {
        return acc + 1
      }
      return acc
    }, 0)

    const folders = getMapValues(foldersMap).reduce((acc, val) => {
      if (
        val.workspaceId === currentWorkspace.id &&
        val.parentFolderId == null
      ) {
        return acc + 1
      }
      return acc
    }, 0)

    return {
      docs,
      folders,
    }
  }, [foldersMap, currentWorkspace, docsMap])

  const copyButtonHandler = useCallback(() => {
    copy(workspaceUrl)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 200)
  }, [workspaceUrl])

  if (currentWorkspace == null) {
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
            currentWorkspace.createdAt,
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
            currentWorkspace.updatedAt,
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
                sendToHost('open-external-url', workspaceUrl)
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
                disabled: sendingMap.has(currentWorkspace.id),
                id: 'metadata-rename',
                label: translate(lngKeys.GeneralEditVerb),
                iconPath: mdiCog,
                onClick: () => openWorkspaceEditForm(currentWorkspace),
              },
            }}
          />
          {!workspace.default && (
            <MetadataContainerRow
              row={{
                type: 'button',
                props: {
                  disabled: sendingMap.has(currentWorkspace.id),
                  id: 'metadata-delete',
                  label: translate(lngKeys.GeneralDelete),
                  iconPath: mdiTrashCan,
                  onClick: () => {
                    closeAllModals()
                    deleteWorkspace(currentWorkspace)
                  },
                },
              }}
            />
          )}
        </>
      )}
    </MetadataContainer>
  )
}

export default WorkspaceContextMenu
