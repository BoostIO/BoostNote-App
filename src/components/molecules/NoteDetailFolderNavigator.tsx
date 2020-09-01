import React, { useMemo, MouseEvent } from 'react'
import styled from '../../lib/styled'
import { mdiBookOpen, mdiSlashForward } from '@mdi/js'
import Icon from '../atoms/Icon'
import { useRouter, useRouteParams } from '../../lib/router'
import { flexCenter } from '../../lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../lib/db'

const Container = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.navButtonColor};
  overflow: hidden;
`

const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  ${flexCenter}
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.navButtonColor};
`

const FolderNavItemButton = styled.button`
  background-color: transparent;
  border: none;
  white-space: nowrap;
  cursor: pointer;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navItemColor};
  user-select: none;
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`

interface NoteDetailFolderNavigatorProps {
  storageId: string
  storageName: string
  noteId: string
  noteFolderPathname: string
}

interface FolderData {
  name: string
  pathname: string
}

interface FolderNavItemProps {
  path: string
  children?: React.ReactNode
}

const FolderNavItem: React.FC<FolderNavItemProps> = ({
  children,
  path,
}: FolderNavItemProps) => {
  const { t } = useTranslation()
  const db = useDb()
  const { push } = useRouter()
  const routeParams = useRouteParams()

  const currentFolderPathname = useMemo(() => {
    if (routeParams.name !== 'storages.notes') {
      return null
    }
    return routeParams.folderPathname
  }, [routeParams])

  const parsePath = (path: string) => {
    const result = {
      storageId: '',
      storageName: '',
      folderName: '',
      folderPath: '',
    }

    const storageMatch = /\/storages\/(.*)\/notes/.exec(path)
    if (storageMatch) {
      const storage = db.storageMap[storageMatch[1]]
      if (storage) {
        result.storageId = storage.id
        result.storageName = storage.name
      }
    }
    const folderMatch = /\/notes\/(.*)\//.exec(path)
    if (folderMatch) {
      result.folderPath = `/${folderMatch[1]}`

      const folderNameMatch = /[^/]*$/.exec(result.folderPath)
      if (folderNameMatch) {
        result.folderName = folderNameMatch[0]
      }
    }
    return result
  }

  const { storageName, folderName, folderPath } = parsePath(path)
  const getStorageTooltip = (storageName: string) =>
    `${t('storage.storage')} ${storageName}: ${t('general.allnote')}`

  const getFolderTooltip = (foldername: string) =>
    `${t('folder.folder')} ${foldername}: ${t('general.allnote')}`

  const tooltip = folderName
    ? getFolderTooltip(folderName)
    : getStorageTooltip(storageName)

  const isActive =
    currentFolderPathname === folderPath ||
    (!folderName && currentFolderPathname === '/')

  return (
    <FolderNavItemButton
      title={tooltip}
      href={path}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        push(path)
      }}
      className={isActive ? 'active' : ''}
    >
      {folderName ? folderName : storageName}
      {children}
    </FolderNavItemButton>
  )
}

const NoteDetailFolderNavigator = ({
  storageId,
  noteId,
  noteFolderPathname,
}: NoteDetailFolderNavigatorProps) => {
  const folderDataList = useMemo<FolderData[]>(() => {
    if (noteFolderPathname === '/') {
      return []
    }
    const folderNames = noteFolderPathname.slice(1).split('/')
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
  }, [noteFolderPathname])

  return (
    <Container>
      <IconContainer>
        <Icon path={mdiBookOpen} />
      </IconContainer>
      <FolderNavItem path={`/app/storages/${storageId}/notes/${noteId}`} />

      {folderDataList.map((folderData) => (
        <React.Fragment key={folderData.pathname}>
          <Icon path={mdiSlashForward} />
          <FolderNavItem
            path={`/app/storages/${storageId}/notes${folderData.pathname}/${noteId}`}
          />
        </React.Fragment>
      ))}
    </Container>
  )
}

export default NoteDetailFolderNavigator
