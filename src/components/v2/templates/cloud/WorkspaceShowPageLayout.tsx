import React from 'react'
import MetadataContainer from '../../organisms/MetadataContainer'
import ContentLayout from '../ContentLayout'
import { TopbarProps } from '../../organisms/Topbar'

interface WorkspaceShowPageLayoutProps {
  helmet?: { title?: string; indexing?: boolean }
  topbar: TopbarProps
  showMetadata?: boolean
}

const WorkspaceShowPageLayout = ({
  topbar,
  showMetadata,
}: WorkspaceShowPageLayoutProps) => (
  <ContentLayout
    topbar={topbar}
    right={showMetadata && <MetadataContainer rows={[]} />}
  >
    workspace page
  </ContentLayout>
)

export default WorkspaceShowPageLayout
