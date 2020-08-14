import React, { useMemo, MouseEvent } from 'react'
import styled from '../../lib/styled'
import { mdiBookOpen, mdiSlashForward } from '@mdi/js'
import Icon from '../atoms/Icon'
import { useRouter, useRouteParams } from '../../lib/router'
import { flexCenter } from '../../lib/styled/styleFunctions'

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

const FolderNavItem = styled.button`
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

const NoteDetailFolderNavigator = ({
  storageId,
  storageName,
  noteId,
  noteFolderPathname,
}: NoteDetailFolderNavigatorProps) => {
  const { push } = useRouter()
  const routeParams = useRouteParams()

  const currentFolderPathname = useMemo(() => {
    if (routeParams.name !== 'storages.notes') {
      return null
    }
    return routeParams.folderPathname
  }, [routeParams])

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
      <FolderNavItem
        href={`/app/storages/${storageId}/notes/${noteId}`}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          event.preventDefault()
          push(`/app/storages/${storageId}/notes/${noteId}`)
        }}
        className={currentFolderPathname === '/' ? 'active' : ''}
      >
        {storageName}
      </FolderNavItem>
      {folderDataList.map((folderData) => (
        <React.Fragment key={folderData.pathname}>
          <Icon path={mdiSlashForward} />
          <FolderNavItem
            onClick={() => {
              push(
                `/app/storages/${storageId}/notes${folderData.pathname}/${noteId}`
              )
            }}
            className={
              currentFolderPathname === folderData.pathname ? 'active' : ''
            }
          >
            {folderData.name}
          </FolderNavItem>
        </React.Fragment>
      ))}
    </Container>
  )
}

export default NoteDetailFolderNavigator
