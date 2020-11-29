import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import { mdiFolder, mdiSubdirectoryArrowRight } from '@mdi/js'
import Icon from './Icon'
import { useRouter } from '../../lib/router'
import { textOverflow } from '../../lib/styled/styleFunctions'

interface FolderTreeListItemProps {
  storageId: string
  name: string
  pathname: string
  depth: number
}

const FolderTreeListItem = ({
  storageId,
  name,
  pathname,
  depth,
}: FolderTreeListItemProps) => {
  const { push } = useRouter()

  const navigateToFolder = useCallback(() => {
    push(`/app/storages/${storageId}/notes${pathname}`)
  }, [push, storageId, pathname])

  return (
    <Container>
      <button
        title={`Navigate to ${pathname}`}
        style={{
          paddingLeft: depth > 1 ? `${depth * 5 + 5}px` : '5px',
        }}
        onClick={navigateToFolder}
      >
        {depth > 0 && (
          <Icon className='icon' path={mdiSubdirectoryArrowRight} />
        )}
        <Icon className='icon folderIcon' path={mdiFolder} />
        <div className='label'>{name}</div>
      </button>
    </Container>
  )
}

export default FolderTreeListItem

const Container = styled.li`
  & > button {
    width: 100%;
    height: 24px;
    text-align: left;
    background-color: ${({ theme }) => theme.navItemBackgroundColor};
    color: ${({ theme }) => theme.navButtonColor};
    border: none;
    padding-right: 4px;
    display: flex;
    align-items: center;
    & > .icon {
      font-size: 18px;
      flex-shrink: 0;
    }
    & > .folderIcon {
      margin-right: 4px;
    }
    & > .label {
      max-width: 100px;
      ${textOverflow}
    }
    cursor: pointer;
    &:hover {
      background-color: ${({ theme }) => theme.navItemHoverBackgroundColor};
    }
    &:active,
    &.active {
      background-color: ${({ theme }) => theme.navItemActiveBackgroundColor};
    }
  }
`
