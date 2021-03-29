import React from 'react'
import MetadataContainer from '../../organisms/MetadataContainer'
import ContentLayout from '../ContentLayout'
import { TopbarProps } from '../../organisms/Topbar'

interface WorkspaceShowPageLayoutProps {
  helmet?: { title?: string; indexing?: boolean }
  topbar: TopbarProps
  metadata?: { show: boolean; rows: any[] }
}

const WorkspaceShowPageLayout = ({
  topbar,
  metadata,
}: WorkspaceShowPageLayoutProps) => (
  <ContentLayout
    topbar={topbar}
    right={metadata?.show && <MetadataContainer rows={[]} />}
  >
    workspace page
  </ContentLayout>
)

export default WorkspaceShowPageLayout
