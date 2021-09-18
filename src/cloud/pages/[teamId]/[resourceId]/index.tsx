import React, { useEffect, useMemo, useRef } from 'react'
import Page from '../../../components/Page'
import {
  getResourceShowPageData,
  ResourceShowPageResponseBody,
} from '../../../api/pages/teams'
import DocPage from '../../../components/DocPage'
import FolderPage from '../../../components/FolderPage'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { parse as parseQuery } from 'querystring'
import {
  getCachedPageProps,
  setCachedPageProps,
} from '../../../../lib/routing/pagePropCache'
import { usePage } from '../../../lib/stores/pageStore'
import { useNav } from '../../../lib/stores/nav'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'

const ResourceIndex = () => {
  const { setPageData, pageData } = usePage()
  const props = pageData as ResourceShowPageResponseBody & {
    needsReload?: { pathname: string; search: string }
  }
  const { updateDocsMap, updateFoldersMap } = useNav()
  const reloadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  useEffect(() => {
    reload()

    async function reload() {
      if (reloadingRef.current) {
        return
      }
      if (props.needsReload == null) {
        return
      }
      reloadingRef.current = true
      const abortController = new AbortController()
      abortControllerRef.current = abortController
      const { pathname, search } = props.needsReload
      const pageData = await ResourceIndex.getInitialProps({
        pathname,
        search,
        signal: abortController.signal,
        forceReload: true,
      })
      if (!abortController.signal.aborted) {
        setPageData(pageData)
        updateDocsMap(
          ...pageData.docs.map(
            (doc) => [doc.id, doc] as [string, SerializedDocWithBookmark]
          )
        )
        updateFoldersMap(
          ...pageData.folders.map(
            (folder) =>
              [folder.id, folder] as [string, SerializedFolderWithBookmark]
          )
        )
      }
      reloadingRef.current = false
    }
    return () => {
      if (abortControllerRef.current != null) {
        if (!abortControllerRef.current.signal.aborted) {
          abortControllerRef.current.abort()
        }
      }
      reloadingRef.current = false
    }
  }, [props.needsReload, setPageData, updateDocsMap, updateFoldersMap])

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
            loading={props.needsReload != null}
          />
        )
        break

      case 'folder':
        innerPage = <FolderPage />
        break
    }

    return <Page>{innerPage}</Page>
  }, [props])

  return content
}

ResourceIndex.getInitialProps = async (
  params: GetInitialPropsParameters & { forceReload?: boolean }
) => {
  if (!params.forceReload) {
    const existingPageProps = await getCachedPageProps<
      ResourceShowPageResponseBody
    >(params.pathname)
    if (existingPageProps != null) {
      return {
        ...existingPageProps,
        needsReload: {
          pathname: params.pathname,
          search: params.search,
        },
      }
    }
  }

  const result = await getResourceShowPageData(params)

  await setCachedPageProps<ResourceShowPageResponseBody>(params.pathname, {
    ...result,
    folders: [],
    docs: [],
  })
  const query = parseQuery(params.search.slice(1))

  return { ...result, thread: query.thread }
}

export default ResourceIndex
