import React, { useMemo } from 'react'
import { getArchivedDocsListPageData } from '../../api/pages/teams/deleted'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { usePage } from '../../lib/stores/pageStore'
import { useNav } from '../../lib/stores/nav'
import { useTitle } from 'react-use'
import { mdiArchive } from '@mdi/js'
import { useRouter } from '../../lib/router'
import Application from '../../components/Application'
import { getTeamLinkHref } from '../../components/atoms/Link/TeamLink'
import ContentManager from '../../components/molecules/ContentManager'
import { topParentId } from '../../lib/mappers/topbarTree'
import EmojiIcon from '../../components/atoms/EmojiIcon'
import InviteCTAButton from '../../components/molecules/InviteCTAButton'

const ArchivedPage = () => {
  const { team, currentUserIsCoreMember } = usePage()
  const { docsMap, workspacesMap } = useNav()
  const { push } = useRouter()

  const archivedDocs = useMemo(() => {
    return [...docsMap.values()].filter((doc) => doc.archivedAt != null)
  }, [docsMap])

  useTitle('Archived')

  if (team == null) {
    return <Application content={{}} />
  }

  const href = getTeamLinkHref(team, 'archived')
  return (
    <Application
      content={{
        reduced: true,
        topbar: {
          breadcrumbs: [
            {
              label: 'Archived',
              active: true,
              parentId: topParentId,
              icon: mdiArchive,
              link: {
                href,
                navigateTo: () => push(href),
              },
            },
          ],
          controls: [
            {
              type: 'node',
              element: <InviteCTAButton />,
            },
          ],
        },
        header: (
          <>
            <EmojiIcon
              defaultIcon={mdiArchive}
              style={{ marginRight: 10 }}
              size={20}
            />
            <span style={{ marginRight: 10 }}>Archived</span>
          </>
        ),
      }}
    >
      <ContentManager
        team={team}
        documents={archivedDocs}
        folders={[]}
        page='archive'
        workspacesMap={workspacesMap}
        currentUserIsCoreMember={currentUserIsCoreMember}
      />
    </Application>
  )
}

export default ArchivedPage

ArchivedPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getArchivedDocsListPageData(params)
  return result
}
