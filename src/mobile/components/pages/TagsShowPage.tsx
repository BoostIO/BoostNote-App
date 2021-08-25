import React, { useMemo } from 'react'
import {
  getTagsShowPageData,
  TagsShowPageResponseBody,
} from '../../../cloud/api/pages/teams/tags'
import { useNav } from '../../../cloud/lib/stores/nav'
import { usePage } from '../../../cloud/lib/stores/pageStore'
import { SerializedWorkspace } from '../../../cloud/interfaces/db/workspace'
import { GetInitialPropsParameters } from '../../../cloud/interfaces/pages'
import DocOnlyContentManager from '../organisms/DocOnlyContentManager'
import AppLayout from '../layouts/AppLayout'
import EmojiIcon from '../../../cloud/components/EmojiIcon'
import { mdiTag } from '@mdi/js'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'

const TagsShowPage = ({ pageTag: pagePropsTag }: TagsShowPageResponseBody) => {
  const { docsMap, tagsMap, workspacesMap } = useNav()
  const { team, currentUserIsCoreMember } = usePage()

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
    return <AppLayout />
  }

  if (pageTag == null) {
    return (
      <AppLayout>
        <ColoredBlock
          variant='danger'
          style={{
            width: '96%',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '100px',
          }}
        >
          <h3>Oops...</h3>
          <p>The Tag has been deleted.</p>
        </ColoredBlock>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={
        <>
          <EmojiIcon className='emoji-icon' defaultIcon={mdiTag} size={16} />{' '}
          {pageTag.text}
        </>
      }
    >
      <DocOnlyContentManager
        team={team}
        documents={docs}
        page='tag'
        workspacesMap={relatedWorkspaces}
        currentUserIsCoreMember={currentUserIsCoreMember}
      />
    </AppLayout>
  )
}

TagsShowPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getTagsShowPageData(params)
  return result
}

export default TagsShowPage
