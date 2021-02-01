import React, { useMemo } from 'react'
import { getSharedDocsListData } from '../../api/pages/teams/shared'
import { usePage } from '../../lib/stores/pageStore'
import { useNav } from '../../lib/stores/nav'
import { useTitle } from 'react-use'
import EmojiIcon from '../../components/atoms/EmojiIcon'
import { mdiWeb } from '@mdi/js'
import BreadCrumbs from '../../components/organisms/RightSideTopBar/BreadCrumbs'
import ContentManager from '../../components/molecules/ContentManager'
import Page from '../../components/Page'
import { LazyDefaultLayout } from '../../components/layouts/DefaultLayout'
import AppLayout from '../../components/layouts/AppLayout'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const SharedDocsListPage = () => {
  const { team } = usePage()
  const { docsMap, workspacesMap } = useNav()

  const sharedDocs = useMemo(() => {
    return [...docsMap.values()].filter((doc) => doc.shareLink != null)
  }, [docsMap])

  useTitle('Shared')

  if (team == null) {
    return (
      <Page>
        <LazyDefaultLayout>
          <AppLayout rightLayout={{}} />
        </LazyDefaultLayout>
      </Page>
    )
  }

  return (
    <Page>
      <LazyDefaultLayout>
        <AppLayout
          rightLayout={{
            className: 'reduced-width',
            topbar: {
              left: <BreadCrumbs team={team} />,
            },
            header: (
              <>
                <EmojiIcon defaultIcon={mdiWeb} style={{ marginRight: 10 }} />
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
        </AppLayout>
      </LazyDefaultLayout>
    </Page>
  )
}

SharedDocsListPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getSharedDocsListData(params)
  return result
}

export default SharedDocsListPage
