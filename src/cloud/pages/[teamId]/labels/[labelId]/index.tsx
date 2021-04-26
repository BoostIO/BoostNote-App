import React, { useMemo } from 'react'
import Application from '../../../../components/Application'
import {
  getTagsShowPageData,
  TagsShowPageResponseBody,
} from '../../../../api/pages/teams/tags'
import { useNav } from '../../../../lib/stores/nav'
import { usePage } from '../../../../lib/stores/pageStore'
import ColoredBlock from '../../../../components/atoms/ColoredBlock'
import ContentManager from '../../../../components/molecules/ContentManager'
import { SerializedWorkspace } from '../../../../interfaces/db/workspace'
import { GetInitialPropsParameters } from '../../../../interfaces/pages'
import { topParentId } from '../../../../../lib/v2/mappers/cloud/topbarTree'
import { mdiTag } from '@mdi/js'
import { getTagHref } from '../../../../components/atoms/Link/TagLink'
import { useRouter } from '../../../../lib/router'

const TagsShowPage = ({ pageTag: pagePropsTag }: TagsShowPageResponseBody) => {
  const { docsMap, tagsMap, workspacesMap } = useNav()
  const { team } = usePage()
  const { push } = useRouter()

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

  if (team == null) {
    return <Application content={{}} />
  }

  if (pageTag == null) {
    return (
      <Application content={{}}>
        <ColoredBlock variant='danger' style={{ marginTop: '40px' }}>
          <h3>Oops...</h3>
          <p>The Tag has been deleted.</p>
        </ColoredBlock>
      </Application>
    )
  }

  return (
    <Application
      content={{
        reduced: true,
        topbar: {
          breadcrumbs: [
            {
              label: pageTag.text,
              active: true,
              parentId: topParentId,
              icon: mdiTag,
              link: {
                href: getTagHref(pageTag, team, 'index'),
                navigateTo: () => push(getTagHref(pageTag, team, 'index')),
              },
            },
          ],
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
    </Application>
  )
}

TagsShowPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getTagsShowPageData(params)
  return result
}

export default TagsShowPage
