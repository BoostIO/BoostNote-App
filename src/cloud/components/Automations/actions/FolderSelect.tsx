import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormGroup } from '../../../../components/atoms/form'
import Button from '../../../../design/components/atoms/Button'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import { useModal } from '../../../../design/lib/stores/modal'
import { useNav } from '../../../lib/stores/nav'
import WorkspaceExplorer from '../../WorkspaceExplorer'

interface FolderSelectProps {
  value: string
  onChange: (id?: string) => void
}

const FolderSelect = ({ value, onChange }: FolderSelectProps) => {
  const { foldersMap } = useNav()
  const { openModal, closeLastModal } = useModal()

  const label = useMemo(() => {
    const folder = foldersMap.get(value)
    console.log(folder)
    return folder != null
      ? `${folder.pathname}/${folder.name}`
      : 'Select Folder'
  }, [value, foldersMap])

  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const openFolderSelect = useCallback(() => {
    openModal(
      <FolderExplorer
        initialFolderId={value}
        onFolderSelect={(folderId) => {
          onChange(folderId)
          closeLastModal()
        }}
      />
    )
  }, [openModal, onChange, value, closeLastModal])

  return (
    <FormGroup>
      <FormInput value={label} readOnly={true} />
      <Button onClick={openFolderSelect}>...</Button>
    </FormGroup>
  )
}

export default FolderSelect

interface FolderExplorerProps {
  initialFolderId?: string
  onFolderSelect: (folder: string | undefined) => void
}

const FolderExplorer = ({
  initialFolderId,
  onFolderSelect,
}: FolderExplorerProps) => {
  const { foldersMap, workspacesMap } = useNav()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(() => {
    const initialFolder = foldersMap.get(initialFolderId || '')
    return initialFolder != null ? initialFolder.workspaceId : undefined
  })
  const [selectedFolderId, setSelectedFolderId] = useState(initialFolderId)

  const [folders, workspaces] = useMemo(() => {
    return [Array.from(foldersMap.values()), Array.from(workspacesMap.values())]
  }, [foldersMap, workspacesMap])

  return (
    <div>
      <div>
        <WorkspaceExplorer
          folders={folders}
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
        />
      </div>
      <div>
        <Button onClick={() => onFolderSelect(selectedFolderId)}>Select</Button>
      </div>
    </div>
  )
}
