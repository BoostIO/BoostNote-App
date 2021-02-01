import React from 'react'
import Page from '../../components/Page'
import { LazyDefaultLayout } from '../../components/layouts/DefaultLayout'
import { getArchivedDocsListPageData } from '../../api/pages/teams/deleted'
import ArchivedPage from '../../components/organisms/ArchivedPage'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const DeletedDocsListPage = () => {
  return (
    <Page>
      <LazyDefaultLayout>
        <ArchivedPage />
      </LazyDefaultLayout>
    </Page>
  )
}

DeletedDocsListPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getArchivedDocsListPageData(params)
  return result
}

export default DeletedDocsListPage
