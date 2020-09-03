import React, { useMemo, MouseEvent } from 'react'
import styled from '../../lib/styled'
import { mdiBookOpen, mdiSlashForward } from '@mdi/js'
import Icon from '../atoms/Icon'
import { useRouter, useRouteParams } from '../../lib/router'
import { flexCenter } from '../../lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import NoteDetailNavigatorItem from '../atoms/NoteDetailNavigatorItem'

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
  active: boolean
  storageId: string
  storageName: string
  folderName: string
  folderPathname: string
  noteId: string
}

const NavigatorFolderItem: React.FC<FolderNavItemProps> = ({
  active,
  storageId,
  storageName,
  folderName,
  folderPathname,
  noteId,
}: FolderNavItemProps) => {
  const { push } = useRouter()

  return (
    <NoteDetailNavigatorItem
      title={`${storageName}${folderPathname}`}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        push(`/app/storages/${storageId}/notes${folderPathname}/${noteId}`)
      }}
      className={active ? 'active' : ''}
    >
      {folderName}
    </NoteDetailNavigatorItem>
  )
}

const NoteDetailFolderNavigator = ({
  storageId,
  storageName,
  noteId,
  noteFolderPathname,
}: NoteDetailFolderNavigatorProps) => {
  const { push } = useRouter()
  const routeParams = useRouteParams()

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

  const currentFolderPathname = useMemo(() => {
    if (routeParams.name !== 'storages.notes') {
      return null
    }
    return routeParams.folderPathname
  }, [routeParams])

  return (
    <Container>
      <IconContainer>
        <Icon path={mdiBookOpen} />
      </IconContainer>
      <NoteDetailNavigatorItem
        title={storageName}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          event.preventDefault()
          push(`/app/storages/${storageId}/notes/${noteId}`)
        }}
        className={currentFolderPathname === '/' ? 'active' : ''}
      >
        {storageName}
      </NoteDetailNavigatorItem>

      {folderDataList.map((folderData) => {
        return (
          <React.Fragment key={folderData.pathname}>
            <Icon path={mdiSlashForward} />
            <NavigatorFolderItem
              active={currentFolderPathname === folderData.pathname}
              storageId={storageId}
              storageName={storageName}
              folderName={folderData.name}
              folderPathname={folderData.pathname}
              noteId={noteId}
            />
          </React.Fragment>
        )
      })}
    </Container>
  )
}

export default NoteDetailFolderNavigator
