import React from 'react'
import FSStorageCreateForm from '../organisms/FSStorageCreateForm'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import { mdiBookPlusMultiple } from '@mdi/js'
import PageScrollableContent from '../atoms/PageScrollableContent'
import styled from '../../lib/styled'

const StorageCreatePage = () => {
  return (
    <PageContainer>
      <PageDraggableHeader
        iconPath={mdiBookPlusMultiple}
        label='Create Local Workspace'
      />
      <PageScrollableContent>
        <FSStorageCreateForm />
      </PageScrollableContent>
    </PageContainer>
  )
}

export default StorageCreatePage

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`
