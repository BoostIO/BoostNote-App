import React, { useMemo, useCallback, useState } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import styled from '../../../lib/styled'
import Container from '../../layouts/Container'
import FolderDocList from '../../molecules/FolderDocList'
import { useNav } from '../../../lib/stores/nav'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import FolderListItem from '../../molecules/FolderListItem'
import {
  CreateDocBookmarkResponseBody,
  DestroyDocBookmarkResponseBody,
  destroyDocBookmark,
  createDocBookmark,
} from '../../../api/teams/docs/bookmarks'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import {
  CreateFolderBookmarkResponseBody,
  DestroyFolderBookmarkResponseBody,
  destroyFolderBookmark,
  createFolderBookmark,
} from '../../../api/teams/folders/bookmarks'
import DocListItem from '../../molecules/DocListItem'
import { getDocTitle } from '../../../lib/utils/patterns'
import { getHexFromUUID } from '../../../lib/utils/string'
import { useToast } from '../../../../lib/v2/stores/toast'

const BookmarkLists = () => {
  const {
    foldersMap,
    docsMap,
    deleteDocHandler,
    updateDocsMap,
    updateFoldersMap,
    deleteFolderHandler,
  } = useNav()
  const { team } = usePage()
  const { pushMessage } = useToast()
  const [sendingBookmark, setSendingBookmark] = useState<boolean>(false)

  const bookmarkedFolders = useMemo(() => {
    return [...foldersMap.values()]
      .filter((folder) => folder.bookmarked)
      .sort((a, b) => {
        if (a.pathname < b.pathname) {
          return -1
        } else {
          return 1
        }
      })
  }, [foldersMap])

  const bookmarkedDocs = useMemo(() => {
    return [...docsMap.values()]
      .filter((doc) => doc.bookmarked)
      .sort((a, b) => {
        if (getDocTitle(a) < getDocTitle(b)) {
          return -1
        } else {
          return 1
        }
      })
  }, [docsMap])

  const toggleDocBookmark = useCallback(
    async (doc: SerializedDocWithBookmark) => {
      if (sendingBookmark || team == null) {
        return
      }
      setSendingBookmark(true)
      try {
        let data: CreateDocBookmarkResponseBody | DestroyDocBookmarkResponseBody
        if (doc.bookmarked) {
          data = await destroyDocBookmark(team.id, doc.id)
        } else {
          data = await createDocBookmark(team.id, doc.id)
        }
        updateDocsMap([data.doc.id, data.doc])
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: 'Could not bookmark this doc',
        })
      }
      setSendingBookmark(false)
    },
    [team, setSendingBookmark, pushMessage, updateDocsMap, sendingBookmark]
  )

  const toggleFolderBookmark = useCallback(
    async (folder: SerializedFolderWithBookmark) => {
      if (sendingBookmark || team == null) {
        return
      }
      setSendingBookmark(true)
      try {
        let data:
          | CreateFolderBookmarkResponseBody
          | DestroyFolderBookmarkResponseBody

        if (folder.bookmarked) {
          data = await destroyFolderBookmark(team.id, folder.id)
        } else {
          data = await createFolderBookmark(team.id, folder.id)
        }
        updateFoldersMap([data.folder.id, data.folder])
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: 'Could not bookmark this folder',
        })
      }
      setSendingBookmark(false)
    },
    [team, setSendingBookmark, pushMessage, updateFoldersMap, sendingBookmark]
  )

  if (team == null) {
    return null
  }

  return (
    <Container>
      <FolderDocList>
        <StyledBookmarkHeader>Bookmarks</StyledBookmarkHeader>
        <StyledBookmarksList>
          {bookmarkedDocs.length === 0 && bookmarkedFolders.length === 0 && (
            <StyledWarning>No documents have been bookmarked</StyledWarning>
          )}
          {bookmarkedFolders.map((folder) => (
            <FolderListItem
              item={folder}
              key={folder.id}
              team={team}
              onDeleteHandler={() => deleteFolderHandler(folder)}
              onBookmarkHandler={() => toggleFolderBookmark(folder)}
              id={`expandedBookmarkList-fD${getHexFromUUID(folder.id)}`}
            />
          ))}
          {bookmarkedDocs.map((doc) => (
            <DocListItem
              item={doc}
              key={doc.id}
              team={team}
              onDeleteHandler={() => deleteDocHandler(doc)}
              onBookmarkHandler={() => toggleDocBookmark(doc)}
              id={`expandedBookmarkList-dC${getHexFromUUID(doc.id)}`}
              displayTags={false}
            />
          ))}
        </StyledBookmarksList>
      </FolderDocList>
    </Container>
  )
}

export default BookmarkLists

const StyledBookmarkHeader = styled.h1`
  padding: 0 ${({ theme }) => theme.space.xsmall}px;
`

const StyledBookmarksList = styled.div``

const StyledWarning = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.space.small}px
    ${({ theme }) => theme.space.xsmall}px;
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  background: ${({ theme }) => theme.baseBackgroundColor};
  border-radius: 5px;
`
