import { NoteStorage } from '../../lib/db/types'
import { getArchiveHref } from '../../lib/db/utils'
import Application from '../Application'
import { topParentId } from '../../cloud/lib/mappers/topbarTree'
import { mdiArchive } from '@mdi/js'
import React from 'react'
import ArchiveDetail from '../organisms/ArchiveDetail'
import { useRouter } from '../../lib/router'

interface ArchivePageProps {
  storage: NoteStorage
}

const ArchivePage = ({ storage }: ArchivePageProps) => {
  const { push } = useRouter()
  const archiveHref = getArchiveHref(storage)
  return (
    <Application
      content={{
        topbar: {
          breadcrumbs: [
            {
              label: 'Archive',
              active: true,
              parentId: topParentId,
              icon: mdiArchive,
              link: {
                href: archiveHref,
                navigateTo: () => push(archiveHref),
              },
            },
          ],
        },
      }}
    >
      <ArchiveDetail storage={storage} />
    </Application>
  )
}

export default ArchivePage
