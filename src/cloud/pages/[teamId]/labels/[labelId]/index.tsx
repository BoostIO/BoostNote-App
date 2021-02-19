import React, { useMemo } from 'react'
import Page from '../../../../components/Page'
import AppLayout from '../../../../components/layouts/AppLayout'
import { LazyDefaultLayout } from '../../../../components/layouts/DefaultLayout'
import {
  getTagsShowPageData,
  TagsShowPageResponseBody,
} from '../../../../api/pages/teams/tags'
import { useNav } from '../../../../lib/stores/nav'
import { usePage } from '../../../../lib/stores/pageStore'
import ColoredBlock from '../../../../components/atoms/ColoredBlock'
import BreadCrumbs from '../../../../components/organisms/RightSideTopBar/BreadCrumbs'
import ContentManager from '../../../../components/molecules/ContentManager'
import { SerializedWorkspace } from '../../../../interfaces/db/workspace'
import { GetInitialPropsParameters } from '../../../../interfaces/pages'

const TagsShowPage = ({ pageTag: pagePropsTag }: TagsShowPageResponseBody) => {
  const { docsMap, tagsMap, workspacesMap } = useNav()
  const { team } = usePage()

  const pageTag = useMemo(() => {
    return tagsMap.get(pagePropsTag.id)
  }, [tagsMap, pagePropsTag.id])

  const docs = useMemo(() => {
    if (pageTag == null) {
      return []
    }

    return [...docsMap.values()].filter((doc) => {
      return doc.tags.map((tag) => tag.id).includes(pageTag.id)
    })
  }, [docsMap, pageTag])

  const relatedWorkspaces = useMemo(() => {
    const workspacesIds = new Set<string>()
    docs.forEach((doc) => {
      workspacesIds.add(doc.workspaceId)
    })

    return [...workspacesMap.values()].reduce((acc, val) => {
      if (workspacesIds.has(val.id)) {
        acc.set(val.id, val)
      }
      return acc
    }, new Map<string, SerializedWorkspace>())
  }, [docs, workspacesMap])

  const content = useMemo(() => {
    if (team == null) {
      return <AppLayout rightLayout={{}} />
    }

    if (pageTag == null) {
      return (
        <AppLayout
          rightLayout={{
            className: 'reduced-width',
            topbar: { left: <BreadCrumbs team={team} /> },
          }}
        >
          <ColoredBlock variant='danger' style={{ marginTop: '40px' }}>
            <h3>Oops...</h3>
            <p>The Tag has been deleted.</p>
          </ColoredBlock>
        </AppLayout>
      )
    }

    return (
      <AppLayout
        rightLayout={{
          className: 'reduced-width',
          topbar: {
            left: <BreadCrumbs team={team} />,
          },
          header: <span>#{pageTag.text}</span>,
        }}
      >
        <ContentManager
          team={team}
          documents={docs}
          folders={[]}
          page='tag'
          workspacesMap={relatedWorkspaces}
        />
      </AppLayout>
    )
  }, [docs, pageTag, team, relatedWorkspaces])

  return (
    <Page>
      <LazyDefaultLayout>{content}</LazyDefaultLayout>
    </Page>
  )
}

TagsShowPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getTagsShowPageData(params)
  return result
}

export default TagsShowPage
