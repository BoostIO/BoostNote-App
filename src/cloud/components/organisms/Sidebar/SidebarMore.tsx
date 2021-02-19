import React from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import IconMdi from '../../atoms/IconMdi'
import { mdiChevronRight, mdiChevronDown, mdiDotsVertical } from '@mdi/js'
import { useSidebarCollapse } from '../../../lib/stores/sidebarCollapse'
import SidebarTopButton from './SidebarTopButton'
import SidebarSecondaryTeamLinks from './SidebarSecondaryTeamLinks'

export const moreHeaderId = 'sidebar-more'

const SidebarMore = () => {
  const { team } = usePage()
  const {
    toggleItem,
    unfoldItem,
    foldItem,
    sideBarOpenedLinksIdsSet,
  } = useSidebarCollapse()
  const opened = sideBarOpenedLinksIdsSet.has(moreHeaderId)

  if (team == null) {
    return null
  }

  return (
    <>
      <SidebarTopButton
        onClick={() => toggleItem('links', moreHeaderId)}
        variant='transparent'
        folding={{
          fold: () => foldItem('links', moreHeaderId),
          unfold: () => unfoldItem('links', moreHeaderId),
        }}
        id={moreHeaderId}
        label={
          <>
            <IconMdi
              path={mdiDotsVertical}
              size={19}
              style={{ marginRight: 4 }}
            />
            More
          </>
        }
        prependIcon={!opened ? mdiChevronRight : mdiChevronDown}
      />
      {opened && <SidebarSecondaryTeamLinks />}
    </>
  )
}

export default SidebarMore
