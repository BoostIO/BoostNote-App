import React, { useState, useMemo, useCallback, useRef } from 'react'
import { ModalContainer } from '../styled'
import ImportModalHeader, { ImportStep } from './ImportModalHeader'
import { StyledImportModalContainer } from './styled'
import ImportModalSelectFolder from './ImportModalSelectFolder'
import { useModal } from '../../../../../lib/stores/modal'
import ImportModalSelectSource from './ImportModalSelectSource'
import ImportModalGuide, { ImportService } from './ImportModalGuide'
import {
  AllowedDocTypeImports,
  importDocs,
} from '../../../../../api/teams/docs/import'
import { usePage } from '../../../../../lib/stores/pageStore'
import { useNav } from '../../../../../lib/stores/nav'
import { getMapFromEntityArray } from '../../../../../lib/utils/array'
import ImportModalUpload from './ImportModalUpload'
import { useNavigateToDoc } from '../../../../atoms/Link/DocLink'
import { useNavigateToFolder } from '../../../../atoms/Link/FolderLink'
import { useNavigateToWorkspace } from '../../../../atoms/Link/WorkspaceLink'
import { useNavigateToTeam } from '../../../../atoms/Link/TeamLink'
import { useToast } from '../../../../../../lib/v2/stores/toast'

const ImportModal = () => {
  const [step, setStep] = useState<ImportStep>('source')
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>()
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [service, setService] = useState<ImportService>()
  const { closeModal } = useModal()
  const fileUploaderRef = useRef<HTMLInputElement>(null)
  const [uploadType, setUploadType] = useState<
    AllowedDocTypeImports | undefined
  >()
  const { pushApiErrorMessage, pushMessage } = useToast()
  const { team, pageFolder, pageWorkspace, setPartialPageData } = usePage()
  const [sending, setSending] = useState<boolean>(false)
  const { updateDocsMap, updateFoldersMap, updateWorkspacesMap } = useNav()
  const navigateToDoc = useNavigateToDoc()
  const navigateToFolder = useNavigateToFolder()

  const showGuide = useCallback((service: ImportService) => {
    setService(service)
    setStep('guide')
  }, [])

  const openFileExplorer = useCallback(() => {
    if (fileUploaderRef.current != null) {
      fileUploaderRef.current.click()
    }
  }, [])

  const navigateToTeam = useNavigateToTeam()
  const navigateToWorkspace = useNavigateToWorkspace()

  const onFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      if (
        team == null ||
        uploadType == null ||
        selectedWorkspaceId == null ||
        sending
      ) {
        return
      }

      setSending(true)
      setStep('import')

      if (
        event.target != null &&
        event.target.files != null &&
        event.target.files.length > 0
      ) {
        try {
          const { docs, parentFolder, workspace, errors } = await importDocs(
            team.id,
            {
              parentFolderId: selectedFolderId,
              workspaceId: selectedWorkspaceId,
              files: event.target.files,
              type: uploadType,
            }
          )

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
          pushApiErrorMessage(error)
        }
      }
      setSending(false)
      closeModal()
    },
    [
      selectedWorkspaceId,
      selectedFolderId,
      pushApiErrorMessage,
      team,
      uploadType,
      sending,
      updateDocsMap,
      updateFoldersMap,
      updateWorkspacesMap,
      pushMessage,
      pageFolder,
      pageWorkspace,
      setPartialPageData,
      closeModal,
      navigateToTeam,
      navigateToWorkspace,
      navigateToDoc,
      navigateToFolder,
    ]
  )

  const content = useMemo(() => {
    switch (step) {
      case 'destination':
        return (
          <ImportModalSelectFolder
            selectedFolderId={selectedFolderId}
            selectedWorkspaceId={selectedWorkspaceId}
            setSelectedWorkspaceId={setSelectedWorkspaceId}
            setSelectedFolderId={setSelectedFolderId}
            onCancel={() => setStep('source')}
            onSelect={openFileExplorer}
          />
        )
      case 'source':
        return (
          <ImportModalSelectSource
            selectedService={service}
            setUploadType={setUploadType}
            onCancel={() => closeModal()}
            showGuide={showGuide}
            setStep={setStep}
            sending={sending}
          />
        )
      case 'guide':
        return (
          <ImportModalGuide
            selectedService={service}
            onCancel={() => setStep('source')}
            setUploadType={setUploadType}
            onContinue={() => setStep('destination')}
          />
        )
      case 'import':
        return <ImportModalUpload />
      default:
        return null
    }
  }, [
    step,
    selectedWorkspaceId,
    selectedFolderId,
    closeModal,
    service,
    setUploadType,
    sending,
    showGuide,
    openFileExplorer,
  ])

  const accept = useMemo(() => {
    switch (uploadType) {
      case 'md':
        return '.text, .md, .txt'
      case 'html':
        return '.html, .htm'
      case 'md|html':
        return '.text, .md, .txt, .html, .htm'
      default:
        return ''
    }
  }, [uploadType])

  return (
    <ModalContainer>
      <StyledImportModalContainer>
        <ImportModalHeader currentStep={step === 'guide' ? 'source' : step} />
        {content}

        <form>
          <input
            type='file'
            accept={accept}
            multiple={true}
            style={{ display: 'none' }}
            ref={fileUploaderRef}
            onChange={onFileUpload}
          />
        </form>
      </StyledImportModalContainer>
    </ModalContainer>
  )
}

export default ImportModal
