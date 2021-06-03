import React, { useMemo } from 'react'
import Page from '../../../components/Page'
import DefaultLayout from '../../../components/layouts/DefaultLayout'
import {
  getResourceShowPageData,
  ResourceShowPageResponseBody,
} from '../../../api/pages/teams'
import DocPage from '../../../components/organisms/DocPage'
import FolderPage from '../../../components/organisms/FolderPage'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { parse as parseQuery } from 'querystring'

const ResourceIndex = (props: ResourceShowPageResponseBody) => {
  const content = useMemo(() => {
    let innerPage

    switch (props.type) {
      case 'doc':
        innerPage = (
          <DocPage
            doc={props.pageDoc}
            contributors={props.contributors || []}
            backLinks={props.backLinks || []}
            revisionHistory={props.revisionHistory || []}
            thread={props.thread}
          />
        )
        break

      case 'folder':
        innerPage = <FolderPage />
        break
    }

    return (
      <Page>
        <DefaultLayout>{innerPage}</DefaultLayout>
      </Page>
    )
  }, [props])

  return content
}

ResourceIndex.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getResourceShowPageData(params)
  const query = parseQuery(params.search.slice(1))
  return { ...result, thread: query.thread }
}

export default ResourceIndex
