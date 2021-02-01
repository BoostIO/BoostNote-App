import React, { useMemo, useCallback } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import {
  mdiFileDocumentOutline,
  mdiDownload,
  mdiPaperclip,
  mdiArchive,
  mdiWeb,
} from '@mdi/js'
import { getTeamLinkHref } from '../../atoms/Link/TeamLink'
import { useRouter } from 'next/router'
import { useModal } from '../../../lib/stores/modal'
import TemplatesModal from '../Modal/contents/TemplatesModal'
import ImportModal from '../Modal/contents/Import/ImportModal'
import { OnboardingPastille } from '../Onboarding/styled'
import { updateTeam } from '../../../api/teams'
import SideNavigatorItem from './SideNavigator/SideNavigatorItem'

const SidebarSecondaryTeamLinks = () => {
  const { team, setPartialPageData } = usePage()
  const { openModal } = useModal()

  const { pathname } = useRouter()

  const hideImportNotice = useMemo(() => {
    return team != null && team.state.import === true
  }, [team])

  const onImportModal = useCallback(async () => {
    if (team == null) {
      return
    }

    openModal(<ImportModal />, {
      classNames: 'largeW',
    })
    if (team.state.import) {
      return
    }
    setPartialPageData({
      team: { ...team, state: { ...team.state, import: true } },
    })
    try {
      await updateTeam(team.id, {
        name: team.name,
        state: JSON.stringify({ ...team.state, import: true }),
      })
    } catch (error) {}
  }, [team, setPartialPageData, openModal])

  if (team == null) {
    return null
  }

  return (
    <>
      <SideNavigatorItem
        id='sidebar-uploadModal'
        iconNode={mdiDownload}
        label={
          hideImportNotice ? (
            'Import'
          ) : (
            <>
              Import{' '}
              <OnboardingPastille
                style={{
                  marginLeft: 14,
                  verticalAlign: 'middle',
                  width: 12,
                  height: 12,
                }}
              />
            </>
          )
        }
        onClick={onImportModal}
        depth={1}
      />

      <SideNavigatorItem
        id='sidebar-templatesmodal'
        iconNode={mdiFileDocumentOutline}
        label={'Templates'}
        onClick={() =>
          openModal(<TemplatesModal />, {
            classNames: 'size-XL',
            closable: false,
          })
        }
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
