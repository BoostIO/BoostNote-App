import React from 'react'
import { StorageAttachmentsRouteParams, useRouteParams } from '../../lib/router'
import { useDb } from '../../lib/db'
import AttachmentList from '../../../components/AttachmentsPage/AttachmentList'
import TopBarLayout from '../layouts/TopBarLayout'
import TopBarToggleNavButton from '../atoms/TopBarToggleNavButton'

const AttachmentsPage = () => {
  const routeParams = useRouteParams() as StorageAttachmentsRouteParams
  const { storageId } = routeParams

  const { storageMap } = useDb()
  const storage = storageMap[storageId]
  if (storage == null) {
    return <div>Storage does not exist.</div>
  }

  return (
    <TopBarLayout
      leftControl={<TopBarToggleNavButton />}
      title={<>Attachments in {storage.name}</>}
    >
      <AttachmentList storage={storage} />
    </TopBarLayout>
  )
}

export default AttachmentsPage
