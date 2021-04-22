import React, { useMemo } from 'react'
import { getSharedDocsListData } from '../../api/pages/teams/shared'
import { usePage } from '../../lib/stores/pageStore'
import { useNav } from '../../lib/stores/nav'
import { useTitle } from 'react-use'
import EmojiIcon from '../../components/atoms/EmojiIcon'
import { mdiWeb } from '@mdi/js'
import ContentManager from '../../components/molecules/ContentManager'
import Application from '../../components/Application'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { getTeamLinkHref } from '../../components/atoms/Link/TeamLink'
import { useRouter } from '../../lib/router'
import { topParentId } from '../../../shared/lib/mappers/cloud/topbarTree'

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
        reduced: true,
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
        header: (
          <>
            <EmojiIcon
              defaultIcon={mdiWeb}
              style={{ marginRight: 10 }}
              size={16}
            />
            <span style={{ marginRight: 10 }}>Shared</span>
          </>
        ),
      }}
    >
      <ContentManager
        team={team}
        documents={sharedDocs}
        folders={[]}
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
