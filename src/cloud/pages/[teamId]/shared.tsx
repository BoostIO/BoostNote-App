import React, { useMemo } from 'react'
import { getSharedDocsListData } from '../../api/pages/teams/shared'
import { usePage } from '../../lib/stores/pageStore'
import { useNav } from '../../lib/stores/nav'
import { useTitle } from 'react-use'
import { mdiWeb } from '@mdi/js'
import Application from '../../components/Application'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { getTeamLinkHref } from '../../components/Link/TeamLink'
import { useRouter } from '../../lib/router'
import { topParentId } from '../../lib/mappers/topbarTree'
import ContentManager from '../../components/ContentManager'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { capitalize } from 'lodash'
import InviteCTAButton from '../../components/Buttons/InviteCTAButton'
import FolderPageInviteSection from '../../components/Onboarding/FolderPageInviteSection'

const SharedDocsListPage = () => {
  const { team, currentUserIsCoreMember } = usePage()
  const { docsMap, workspacesMap } = useNav()
  const { push } = useRouter()
  const { translate } = useI18n()

  const sharedDocs = useMemo(() => {
    return [...docsMap.values()].filter((doc) => doc.shareLink != null)
  }, [docsMap])

  useTitle('Shared')

  if (team == null) {
    return <Application content={{}} />
  }

  return (
    <Application
      content={{
        topbar: {
          breadcrumbs: [
            {
              label: capitalize(translate(lngKeys.GeneralShared)),
              active: true,
              parentId: topParentId,
              icon: mdiWeb,
              link: {
                href: getTeamLinkHref(team, 'shared'),
                navigateTo: () => push(getTeamLinkHref(team, 'shared')),
              },
            },
          ],
          controls: [
            {
              type: 'node',
              element: <InviteCTAButton key='invite-cta' />,
            },
          ],
        },
      }}
    >
      <FolderPageInviteSection />
      <ContentManager
        team={team}
        documents={sharedDocs}
        page='shared'
        workspacesMap={workspacesMap}
        currentUserIsCoreMember={currentUserIsCoreMember}
      />
    </Application>
  )
}

SharedDocsListPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getSharedDocsListData(params)
  return result
}

export default SharedDocsListPage
