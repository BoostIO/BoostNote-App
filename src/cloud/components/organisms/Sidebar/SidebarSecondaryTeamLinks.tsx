import React from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import {
  mdiFileDocumentOutline,
  mdiPaperclip,
  mdiArchive,
  mdiWeb,
} from '@mdi/js'
import { getTeamLinkHref } from '../../atoms/Link/TeamLink'
import TemplatesModal from '../Modal/contents/TemplatesModal'
import SideNavigatorItem from './SideNavigator/SideNavigatorItem'
import { useRouter } from '../../../lib/router'
import { useModal } from '../../../../shared/lib/stores/modal'

const SidebarSecondaryTeamLinks = () => {
  const { team } = usePage()
  const { openModal } = useModal()
  const { pathname } = useRouter()

  if (team == null) {
    return null
  }

  return (
    <>
      <SideNavigatorItem
        id='sidebar-templatesmodal'
        iconNode={mdiFileDocumentOutline}
        label={'Templates'}
        onClick={() => openModal(<TemplatesModal />, { width: 'large' })}
        depth={1}
      />

      <SideNavigatorItem
        href={getTeamLinkHref(team, 'uploads')}
        active={pathname === `/${team.domain}/uploads`}
        id='sidebar-uploadspage'
        iconNode={mdiPaperclip}
        label={'Attachments'}
        depth={1}
      />

      <SideNavigatorItem
        href={getTeamLinkHref(team, 'shared')}
        active={pathname === `/${team.domain}/shared`}
        id='sidebar-sharedpage'
        iconNode={mdiWeb}
        label={'Shared'}
        depth={1}
      />
      <SideNavigatorItem
        href={getTeamLinkHref(team, 'archived')}
        active={pathname === `/${team.domain}/archived`}
        id='sidebar-archivedpage'
        iconNode={mdiArchive}
        label={'Archived'}
        depth={1}
      />
    </>
  )
}

export default SidebarSecondaryTeamLinks
