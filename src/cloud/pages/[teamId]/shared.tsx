import React, { useMemo } from 'react'
import { getSharedDocsListData } from '../../api/pages/teams/shared'
import { usePage } from '../../lib/stores/pageStore'
import { useNav } from '../../lib/stores/nav'
import { useTitle } from 'react-use'
import { mdiWeb } from '@mdi/js'
import Application from '../../components/Application'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { getTeamLinkHref } from '../../components/atoms/Link/TeamLink'
import { useRouter } from '../../lib/router'
import { topParentId } from '../../lib/mappers/topbarTree'
import DocOnlyContentManager from '../../components/molecules/ContentManager/DocOnlyContentManager'

const SharedDocsListPage = () => {
  const { team } = usePage()
  const { docsMap, workspacesMap } = useNav()
  const { push } = useRouter()

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
              label: 'Shared',
              active: true,
              parentId: topParentId,
              icon: mdiWeb,
              link: {
                href: getTeamLinkHref(team, 'shared'),
                navigateTo: () => push(getTeamLinkHref(team, 'shared')),
              },
            },
          ],
        },
      }}
    >
      <DocOnlyContentManager
        team={team}
        documents={sharedDocs}
        page='shared'
        workspacesMap={workspacesMap}
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
