import React, { useState, useMemo, useCallback } from 'react'
import SidebarBookmarkList from '../../molecules/SidebarBookmarkList'
import styled from '../../../lib/styled'
import IconMdi from '../../atoms/IconMdi'
import { mdiChevronDown, mdiChevronRight, mdiStar } from '@mdi/js'
import { usePage } from '../../../lib/stores/pageStore'
import { useNav } from '../../../lib/stores/nav'
import { getDocTitle } from '../../../lib/utils/patterns'
import { usePreferences } from '../../../lib/stores/preferences'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { sortBy, prop } from 'ramda'
import SidebarTopButton from './SidebarTopButton'

type Resource =
  | { type: 'doc'; resource: SerializedDocWithBookmark }
  | { type: 'folder'; resource: SerializedFolderWithBookmark }

export type OrderedChild = { updatedAt: string; title: string } & Resource

const SidebarBookmarks = () => {
  const { preferences, setPreferences } = usePreferences()
  const [showBookmarks, setShowBookmarks] = useState<boolean>(
    preferences.sidebarBookmarksAreUnfolded
  )
  const { foldersMap, docsMap } = useNav()
  const { team } = usePage()

  const childDocs: OrderedChild[] = useMemo(() => {
    return [...docsMap.values()]
      .filter((doc) => doc.bookmarked)
      .map((doc) => {
        return {
          title: getDocTitle(doc).toLowerCase(),
          updatedAt: doc.updatedAt,
          type: 'doc',
          resource: doc,
        }
      })
  }, [docsMap])

  const childFolders: OrderedChild[] = useMemo(() => {
    return [...foldersMap.values()]
      .filter((folder) => folder.bookmarked)
      .map((folder) => {
        return {
          title: folder.name.toLowerCase(),
          type: 'folder',
          resource: folder,
          updatedAt: folder.updatedAt,
        }
      })
  }, [foldersMap])

  const orderedChildren = useMemo(() => {
    const children: OrderedChild[] = [...childDocs, ...childFolders]
    return sortBy(prop('title'), children)
  }, [childFolders, childDocs])

  const displayBookmarks = useCallback(() => {
    const nextState = !showBookmarks
    setPreferences({ sidebarBookmarksAreUnfolded: nextState })
    setShowBookmarks(nextState)
  }, [setPreferences, showBookmarks])

  const setBookmarks = useCallback(
    (nextState: boolean) => {
      setPreferences({ sidebarBookmarksAreUnfolded: nextState })
      setShowBookmarks(nextState)
    },
    [setPreferences]
  )

  if (team == null || orderedChildren.length === 0) {
    return null
  }

  return (
    <StyledSidebarBookmarks>
      <StyledHeaderRow>
        <SidebarTopButton
          onClick={displayBookmarks}
          variant='transparent'
          id='sidebar-bookmarksheader'
          folding={{
            fold: () => setBookmarks(false),
            unfold: () => setBookmarks(true),
          }}
          label={
            <>
              <IconMdi path={mdiStar} size={19} style={{ marginRight: 4 }} />
              Bookmarks
            </>
          }
          prependIcon={!showBookmarks ? mdiChevronRight : mdiChevronDown}
        />
      </StyledHeaderRow>
      {showBookmarks && (
        <SidebarBookmarkList orderedChildren={orderedChildren} team={team} />
      )}
    </StyledSidebarBookmarks>
  )
}

export default SidebarBookmarks

const StyledSidebarBookmarks = styled.div`
  margin-top: ${({ theme }) => theme.space.xsmall}px;
`

const StyledHeaderRow = styled.div`
  margin-bottom: ${({ theme }) => theme.space.xxsmall}px;
`
