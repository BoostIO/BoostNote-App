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
  removeCachedPageProps,
  setCachedPageProps,
} from '../../../../lib/routing/pagePropCache'
import { usePage } from '../../../lib/stores/pageStore'
import { useNav } from '../../../lib/stores/nav'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { useToast } from '../../../../design/lib/stores/toast'
import { getTeamURL } from '../../../lib/utils/patterns'
import { useRouter } from '../../../lib/router'
import {
  ResourceDeleteEventDetails,
  resourceDeleteEventEmitter,
} from '../../../lib/utils/events'

const ResourceIndex = () => {
  const { setPageData, pageData } = usePage()
  const props = pageData as ResourceShowPageResponseBody & {
    needsReload?: { pathname: string; search: string }
  }
  const { updateDocsMap, updateFoldersMap, foldersMap } = useNav()
  const reloadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { pushApiErrorMessage } = useToast()
  const { push } = useRouter()

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
      try {
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
              (doc) => [doc.id, doc] as [string, SerializedDocWithSupplemental]
            )
          )
          updateFoldersMap(
            ...pageData.folders.map(
              (folder) =>
                [folder.id, folder] as [string, SerializedFolderWithBookmark]
            )
          )
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`The request for ${pathname} has been aborted`)
          return
        }

        pushApiErrorMessage(error)
        if (error.response != null && error.response.statusCode === 404) {
          const [resourceId] = pathname.split('/')[2].split('-').reverse()
          removeCachedPageProps(resourceId)
          push(getTeamURL(props.team))
        }
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
  }, [
    push,
    props.team,
    props.needsReload,
    setPageData,
    updateDocsMap,
    updateFoldersMap,
    pushApiErrorMessage,
  ])

  useEffect(() => {
    const handler = (event: CustomEvent<ResourceDeleteEventDetails>) => {
      const deletedResourceType = event.detail.resourceType
      const deletedResourceId = event.detail.resourceId

      if (props.type === 'doc') {
        if (
          deletedResourceType === 'workspace' &&
          deletedResourceId === props.pageDoc.workspaceId
        ) {
          push(event.detail.parentURL)
          return
        }

        if (deletedResourceType === 'folder') {
          let parentFolderId = props.pageDoc.parentFolderId
          while (parentFolderId != null) {
            const parentFolder = foldersMap.get(parentFolderId)
            if (parentFolder == null) {
              break
            }
            if (deletedResourceId === parentFolderId) {
              push(event.detail.parentURL)
              return
            }
            parentFolderId = parentFolder.parentFolderId
          }
        }

        if (
          deletedResourceType === 'doc' &&
          deletedResourceId === props.pageDoc.id
        ) {
          push(event.detail.parentURL)
          return
        }
      } else if (props.type === 'folder') {
        if (
          deletedResourceType === 'workspace' &&
          deletedResourceId === props.pageFolder.workspaceId
        ) {
          push(event.detail.parentURL)
          return
        }

        if (deletedResourceType === 'folder') {
          let parentFolderId = props.pageFolder.parentFolderId
          while (parentFolderId != null) {
            const parentFolder = foldersMap.get(parentFolderId)
            if (parentFolder == null) {
              break
            }
            if (deletedResourceId === parentFolderId) {
              push(event.detail.parentURL)
              return
            }
            parentFolderId = parentFolder.parentFolderId
          }
        }
      }
    }
    resourceDeleteEventEmitter.listen(handler)
    return () => {
      resourceDeleteEventEmitter.unlisten(handler)
    }
  }, [push, props, foldersMap])

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
  const [resourceId] = params.pathname.split('/')[2].split('-').reverse()

  if (!params.forceReload) {
    const existingPageProps = await getCachedPageProps<
      ResourceShowPageResponseBody
    >(resourceId)
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

  await setCachedPageProps<ResourceShowPageResponseBody>(resourceId, {
    ...result,
    folders: [],
    docs: [],
  })
  const query = parseQuery(params.search.slice(1))

  return { ...result, thread: query.thread }
}

export default ResourceIndex
