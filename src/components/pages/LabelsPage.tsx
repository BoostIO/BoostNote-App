import { NoteStorage } from '../../lib/db/types'
import { getLabelHref } from '../../lib/db/utils'
import Application from '../Application'
import { topParentId } from '../../cloud/lib/mappers/topbarTree'
import { mdiTag } from '@mdi/js'
import React from 'react'
import TagDetail from '../organisms/TagDetail'
import { useRouter } from '../../lib/router'

interface LabelsPageProps {
  storage: NoteStorage
  tagName: string
}

const LabelsPage = ({ storage, tagName }: LabelsPageProps) => {
  const labelHref = getLabelHref(storage, tagName)
  const { push } = useRouter()
  return (
    <Application
      content={{
        topbar: {
          breadcrumbs: [
            {
              label: tagName,
              active: true,
              parentId: topParentId,
              icon: mdiTag,
              link: {
                href: labelHref,
                navigateTo: () => push(labelHref),
              },
            },
          ],
        },
      }}
    >
      <TagDetail storage={storage} tagName={tagName} />
    </Application>
  )
}

export default LabelsPage
