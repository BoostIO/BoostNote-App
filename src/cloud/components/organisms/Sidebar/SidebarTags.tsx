import React, { useMemo } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import styled from '../../../lib/styled'
import { sidebarButtonStyle } from '../../../lib/styled/styleFunctions'
import { useNav } from '../../../lib/stores/nav'
import { getTagHref } from '../../atoms/Link/TagLink'
import { useRouter } from '../../../lib/router'
import IconMdi from '../../atoms/IconMdi'
import {
  mdiTag,
  mdiTagMultiple,
  mdiChevronRight,
  mdiChevronDown,
} from '@mdi/js'
import { useSidebarCollapse } from '../../../lib/stores/sidebarCollapse'
import SidebarTopButton from './SidebarTopButton'
import SideNavigatorItem from './SideNavigator/SideNavigatorItem'

const tagsHeaderId = 'sidebar-tags'

const SidebarTags = () => {
  const { team } = usePage()
  const { tagsMap, docsMap } = useNav()
  const { pathname } = useRouter()
  const {
    toggleItem,
    unfoldItem,
    foldItem,
    sideBarOpenedLinksIdsSet,
  } = useSidebarCollapse()
  const opened = sideBarOpenedLinksIdsSet.has(tagsHeaderId)

  const docsPerTagIdMap = useMemo(() => {
    return [...docsMap.values()].reduce((acc, doc) => {
      const docTags = doc.tags || []
      docTags.forEach((tag) => {
        let docIds = acc.get(tag.id)
        if (docIds == null) {
          docIds = []
          acc.set(tag.id, docIds)
        }
        docIds.push(doc.id)
      })
      return acc
    }, new Map<string, string[]>())
  }, [docsMap])

  const tagsMapList = useMemo(() => {
    if (team == null) {
      return null
    }

    const sortedTags = [...tagsMap.values()]
      .filter((tag) => (docsPerTagIdMap.get(tag.id) || []).length > 0)
      .sort((a, b) => {
        if (a.text < b.text) {
          return -1
        } else {
          return 1
        }
      })

    if (sortedTags.length === 0) {
      return null
    }

    return sortedTags.map((tag) => {
      const href = getTagHref(tag, team, 'index')

      return (
        <SideNavigatorItem
          active={pathname === href}
          id={`sidebar-tag-${tag.id}`}
          iconNode={mdiTag}
          label={tag.text}
          key={tag.id}
          href={href}
          depth={1}
          onClick={undefined}
        />
      )
    })
  }, [pathname, team, docsPerTagIdMap, tagsMap])

  if (team == null) {
    return null
  }

  if (tagsMapList == null) {
    return null
  }

  return (
    <>
      <SidebarTopButton
        onClick={() => toggleItem('links', tagsHeaderId)}
        variant='transparent'
        id={tagsHeaderId}
        folding={{
          unfold: () => unfoldItem('links', tagsHeaderId),
          fold: () => foldItem('links', tagsHeaderId),
        }}
        label={
          <>
            <IconMdi
              path={mdiTagMultiple}
              size={19}
              style={{ marginRight: 4 }}
            />
            Labels
          </>
        }
        prependIcon={!opened ? mdiChevronRight : mdiChevronDown}
      />
      {opened && <StyledSideNavTagsList>{tagsMapList}</StyledSideNavTagsList>}
    </>
  )
}

export default SidebarTags

const StyledSideNavTagsList = styled.div`
  .sidebar-tag-link {
    ${sidebarButtonStyle}
    display: flex;
    align-items: center;
    border-radius: 2px;
    text-decoration: none;

    .sidebar-tag-label {
      overflow: hidden;
      flex: 1 1 auto;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
    }

    svg {
      vertical-align: middle !important;
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
    }
  }
`
