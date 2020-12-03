import React, { useMemo } from 'react'
import { mdiBookOpen, mdiFolder } from '@mdi/js'
import { useRouter } from '../../lib/router'
import ToolbarSlashSeparator from '../atoms/ToolbarSlashSeparator'
import ToolbarButton from '../atoms/ToolbarButton'

interface NotePageToolbarFolderHeaderProps {
  storageId: string
  folderPathname: string
}

interface FolderData {
  name: string
  pathname: string
}

const NotePageToolbarFolderHeader = ({
  storageId,
  folderPathname,
}: NotePageToolbarFolderHeaderProps) => {
  const { push } = useRouter()

  const folderDataList = useMemo<FolderData[]>(() => {
    if (folderPathname === '/') {
      return []
    }
    const folderNames = folderPathname.slice(1).split('/')
    let pathname = ''
    const folderDataList = []
    for (const folderName of folderNames) {
      pathname += '/' + folderName
      folderDataList.push({
        name: folderName,
        pathname,
      })
    }
    return folderDataList
  }, [folderPathname])

  const navigateToWorkspace = () => {
    push(`/app/storages/${storageId}/notes`)
  }
  return (
    <>
      <ToolbarButton
        iconPath={mdiBookOpen}
        label={folderDataList.length === 0 ? 'Workspace' : undefined}
        onClick={navigateToWorkspace}
      />
      {folderDataList.map(({ name, pathname }, index) => {
        return (
          <React.Fragment key={pathname}>
            <ToolbarSlashSeparator />
            <ToolbarButton
              key={pathname}
              iconPath={mdiFolder}
              onClick={() => {
                push(`/app/storages/${storageId}/notes${pathname}`)
              }}
              label={name}
              limitWidth={index !== folderDataList.length - 1}
            />
          </React.Fragment>
        )
      })}
    </>
  )
}

export default NotePageToolbarFolderHeader
