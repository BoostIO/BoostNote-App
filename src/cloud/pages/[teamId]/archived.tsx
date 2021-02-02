import React from 'react'
import Page from '../../components/Page'
import { LazyDefaultLayout } from '../../components/layouts/DefaultLayout'
import { getArchivedDocsListPageData } from '../../api/pages/teams/deleted'
import ArchivedPageContent from '../../components/organisms/ArchivedPageContent'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const ArchivedPage = () => {
  return (
    <Page>
      <LazyDefaultLayout>
        <ArchivedPageContent />
      </LazyDefaultLayout>
    </Page>
  )
}

ArchivedPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getArchivedDocsListPageData(params)
  return result
}

export default ArchivedPage
