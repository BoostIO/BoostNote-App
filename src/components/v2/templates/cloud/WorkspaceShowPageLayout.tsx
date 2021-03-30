import React from 'react'
import MetadataContainer, {
  MetadataContainerRow,
} from '../../organisms/MetadataContainer'
import ContentLayout from '../ContentLayout'
import { TopbarProps } from '../../organisms/Topbar'

interface WorkspaceShowPageLayoutProps {
  helmet?: { title?: string; indexing?: boolean }
  topbar: TopbarProps
  metadata: { show: boolean; rows: MetadataContainerRow[] }
}

const WorkspaceShowPageLayout = ({
  topbar,
  metadata,
}: WorkspaceShowPageLayoutProps) => (
  <ContentLayout
    topbar={topbar}
    right={metadata?.show && <MetadataContainer rows={metadata.rows} />}
  >
    workspace page
  </ContentLayout>
)

export default WorkspaceShowPageLayout
