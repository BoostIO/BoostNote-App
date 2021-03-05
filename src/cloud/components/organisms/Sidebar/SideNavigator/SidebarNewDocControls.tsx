import React, { useCallback, useRef, useState } from 'react'
import SidebarTopButton from '../SidebarTopButton'
import {
  mdiDotsHorizontal,
  mdiFileUploadOutline,
  mdiPencilBoxMultipleOutline,
} from '@mdi/js'
import { useContextMenu, MenuTypes } from '../../../../lib/stores/contextMenu'
import TemplatesModal from '../../Modal/contents/TemplatesModal'
import { useModal } from '../../../../lib/stores/modal'
import { usePage } from '../../../../lib/stores/pageStore'
import { importDocs } from '../../../../api/teams/docs/import'
import { useNav } from '../../../../lib/stores/nav'
import { useToast } from '../../../../lib/stores/toast'
import { getMapFromEntityArray } from '../../../../lib/utils/array'
import { useNavigateToDoc } from '../../../atoms/Link/DocLink'
import { useNavigateToFolder } from '../../../atoms/Link/FolderLink'
import { useNavigateToTeam } from '../../../atoms/Link/TeamLink'
import { useNavigateToWorkspace } from '../../../atoms/Link/WorkspaceLink'
import {
  StyledModals,
  StyledModalsBackground,
  StyledModalsContainer,
} from '../../Modal/styled'
import { ModalContainer } from '../../Modal/contents/styled'
import { StyledImportModalContainer } from '../../Modal/contents/Import/styled'
import { updateTeam } from '../../../../api/teams'
import IconMdi from '../../../atoms/IconMdi'

interface SidebarNewDocControlsProps {
  disabled: boolean
}

const SidebarNewDocControls = ({ disabled }: SidebarNewDocControlsProps) => {
  const { pageWorkspace, pageFolder, team, setPartialPageData } = usePage()
  const { popup } = useContextMenu()
  const { openModal } = useModal()
  const {
    currentParentFolderId,
    currentWorkspaceId,
    updateWorkspacesMap,
    updateFoldersMap,
    updateDocsMap,
  } = useNav()
  const newDocUploader = useRef<HTMLInputElement>(null)
  const uploaderFormRef = useRef<HTMLFormElement>(null)
  const [sending, setSending] = useState(false)
  const { pushMessage, pushApiErrorMessage: pushAxiosErrorMessage } = useToast()
  const navigateToTeam = useNavigateToTeam()
  const navigateToWorkspace = useNavigateToWorkspace()
  const navigateToDoc = useNavigateToDoc()
  const navigateToFolder = useNavigateToFolder()

  const openFileExplorer = useCallback(() => {
    if (newDocUploader.current != null) {
      newDocUploader.current.click()
    }
    if (team == null) {
      return
    }
    setPartialPageData({
      team: { ...team, state: { ...team.state, import: true } },
    })
    try {
      updateTeam(team.id, {
        name: team.name,
        state: JSON.stringify({ ...team.state, import: true }),
      })
    } catch (error) {}
  }, [team, setPartialPageData])

  const onFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      if (team == null || currentWorkspaceId == null || sending) {
        return
      }

      setSending(true)

      if (
        event.target != null &&
        event.target.files != null &&
        event.target.files.length > 0
      ) {
        try {
          const { docs, parentFolder, workspace, errors } = await importDocs(
            team.id,
            {
              parentFolderId: currentParentFolderId,
              workspaceId: currentWorkspaceId,
              files: event.target.files,
              type: 'md|html',
            }
          )

          if (uploaderFormRef.current != null) {
            uploaderFormRef.current.reset()
          }

          if (errors.length > 0) {
            pushMessage({
              title: 'Errors',
              description: `Some files could not be imported: ${errors.join(
                ','
              )}`,
            })
          }

          updateWorkspacesMap([workspace.id, workspace])
          if (pageWorkspace != null && pageWorkspace.id === workspace.id) {
            setPartialPageData({ pageWorkspace: workspace })
          }
          if (parentFolder != null) {
            updateFoldersMap([parentFolder.id, parentFolder])
            if (pageFolder != null && pageFolder.id === parentFolder.id) {
              setPartialPageData({ pageFolder: parentFolder })
            }
          }
          const changedDocs = getMapFromEntityArray(docs)
          updateDocsMap(...changedDocs)

          if (docs.length === 1) {
            navigateToDoc(docs[0], team, 'index')
          } else {
            if (
              parentFolder != null &&
              !(pageFolder != null && pageFolder.id === parentFolder.id)
            ) {
              navigateToFolder(parentFolder, team, 'index')
            } else {
              if (
                !(pageWorkspace != null && pageWorkspace.id === workspace.id)
              ) {
                if (workspace.public) {
                  navigateToTeam(team, 'index')
                } else {
                  navigateToWorkspace(workspace, team, 'index')
                }
              }
            }
          }
        } catch (error) {
          pushAxiosErrorMessage(error)
        }
      }
      setSending(false)
    },
    [
      team,
      currentWorkspaceId,
      sending,
      currentParentFolderId,
      updateWorkspacesMap,
      pageWorkspace,
      updateDocsMap,
      pushMessage,
      setPartialPageData,
      updateFoldersMap,
      pageFolder,
      navigateToDoc,
      navigateToFolder,
      navigateToTeam,
      navigateToWorkspace,
      pushAxiosErrorMessage,
    ]
  )

  const openDotsContextMenuOthers = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          icon: <IconMdi path={mdiPencilBoxMultipleOutline} size={16} />,
          label: 'Create from a template',
          onClick: async () =>
            openModal(<TemplatesModal />, {
              classNames: 'size-XL',
              closable: false,
            }),
        },
        {
          type: MenuTypes.Normal,
          icon: <IconMdi path={mdiFileUploadOutline} size={16} />,
          label: 'Upload document',
          onClick: openFileExplorer,
        },
      ])
    },
    [popup, openModal, openFileExplorer]
  )
  return (
    <>
      <SidebarTopButton
        variant='blue'
        style={{
          flexShrink: 0,
          width: 'auto',
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
        disabled={disabled}
        prependIcon={mdiDotsHorizontal}
        tabIndex={-1}
        label=''
        id='newdoc-context'
        onClick={openDotsContextMenuOthers}
      />
      <form ref={uploaderFormRef}>
        <input
          type='file'
          accept='.text, .md, .txt, .html, .htm'
          multiple={true}
          tabIndex={-1}
          style={{ display: 'none' }}
          ref={newDocUploader}
          onChange={onFileUpload}
        />
      </form>
      {sending && (
        <StyledModals>
          <StyledModalsBackground />
          <StyledModalsContainer>
            <ModalContainer>
              <StyledImportModalContainer>
                Uploading...
              </StyledImportModalContainer>
            </ModalContainer>
          </StyledModalsContainer>
        </StyledModals>
      )}
    </>
  )
}

export default SidebarNewDocControls
