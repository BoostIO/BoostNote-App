import React, { PropsWithChildren } from 'react'
import { TopbarPlaceholder } from '../../design/components/organisms/Topbar'
import ContentLayout, {
  ContentLayoutProps,
} from '../../design/components/templates/ContentLayout'

type ApplicationPageProps = {
  topbarPlaceholder?: boolean
} & ContentLayoutProps

const ApplicationPage = ({
  topbarPlaceholder,
  children,
  ...props
}: PropsWithChildren<ApplicationPageProps>) => {
  return (
    <ContentLayout {...props}>
      {topbarPlaceholder && <TopbarPlaceholder />}
      {children}
    </ContentLayout>
  )
}

export default ApplicationPage
